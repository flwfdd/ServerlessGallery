import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
import { zValidator } from '@hono/zod-validator';
import type { Context } from 'hono';
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { validator } from 'hono/validator';
import { z } from 'zod';

import type { FileMetadata, ImageCompressionLevel, StorageService } from '../common/services';
import { ImageCompressionLevelSchema, ListFilesOptionsSchema } from '../common/services';
import { CloudflareD1Service, CloudFlareImageService, CloudflareR2Service } from './services/cloudflare';

const htmlShell = (clientScriptPath: string, stylePath: string, faviconPath: string) => `
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ZenGallery</title>
      <link href="${stylePath}" rel="stylesheet">
      <link href="${faviconPath}" rel="icon">
    </head>
    <body>
      <div id="app"></div>
      <script type="module" src="${clientScriptPath}"></script>
    </body>
  </html>
`;

// 权限校验中间件
const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  const secretKey = c.env.SECRET_KEY;

  // 如果SECRET_KEY为空，跳过权限检查
  if (!secretKey) {
    return next();
  }

  // 从cookie或header获取提供的密钥
  const providedKey = getCookie(c, 'secret-key');

  // 如果没有提供密钥或密钥不匹配，返回401
  if (!providedKey || providedKey !== secretKey) {
    return c.json({
      error: 'Unauthorized',
      message: 'Valid secret key required'
    }, 401);
  }

  return next();
};

// Define bindings directly in Hono generic for better type inference with c.env
const app = new Hono<{
  Bindings: {
    BUCKET: R2Bucket;
    DB: D1Database;
    IMAGES: ImagesBinding;
    SECRET_KEY: string;
  }
}>();

// 文件大小限制常量
const MAX_SINGLE_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB - 单次上传的最大文件大小

// Define Zod schema for file upload
const fileUploadFormSchema = z.object({
  file: z.instanceof(File, { message: "File is required" })
    .refine(file => file.size > 0, { message: "File cannot be empty" }),
  hash: z.string(),
});

// 分片上传相关 schema
const multipartCreateSchema = z.object({
  filename: z.string(),
  hash: z.string(),
});

const multipartUploadSchema = z.object({
  upload_id: z.string(),
  key: z.string(),
  part_number: z.number().min(1).max(10000),
});

const multipartCompleteSchema = z.object({
  filename: z.string(),
  hash: z.string(),
  upload_id: z.string(),
  parts: z.array(z.object({
    partNumber: z.number(),
    etag: z.string(),
  })),
  mime_type: z.string(),
  size: z.number(),
});

const fileUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

const getFileKey = (originalFilename: string, md5: string) => {
  const fileExtension = originalFilename.split('.').pop();
  return fileExtension ? `${md5}.${fileExtension}` : md5;
}

// 安全的流式处理函数 - 不将整个文件加载到内存
async function processStreamSafely<T>(
  stream: ReadableStream,
  processor: (chunk: Uint8Array) => void,
  options?: { maxSize?: number }
): Promise<void> {
  const maxSize = options?.maxSize || 100 * 1024 * 1024; // 默认 100MB 限制
  const reader = stream.getReader();
  let processedSize = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        processedSize += value.length;
        if (processedSize > maxSize) {
          throw new Error(`Stream size exceeds maximum allowed size: ${maxSize} bytes`);
        }
        processor(value);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

const route = app
  .get('/', (c) => {
    const clientScript = '/static/client.js';
    const styleSheet = '/static/assets/style.css';
    const favicon = '/favicon.ico';
    return c.html(htmlShell(clientScript, styleSheet, favicon));
  })
  .get(
    '/api/files',
    authMiddleware,
    zValidator('query', ListFilesOptionsSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid query parameters', issues: result.error.issues }, 400);
      }
    }),
    async (c) => {
      const dbService = new CloudflareD1Service(c.env.DB as D1Database);

      try {
        const queryParams = c.req.valid('query');
        const files = await dbService.listFiles(queryParams);

        return c.json({
          files,
          count: files.length,
          ...(queryParams.limit && {
            pagination: {
              limit: queryParams.limit,
              offset: queryParams.offset || 0,
              hasMore: files.length === queryParams.limit
            }
          })
        });
      } catch (error: any) {
        console.error('Error listing files:', error);
        return c.json({ error: 'Failed to list files', details: error.message }, 500);
      }
    }
  )
  .post(
    '/api/files',
    authMiddleware,
    zValidator('form', fileUploadFormSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid form data', issues: result.error.issues }, 400);
      }
    }),
    async (c) => {
      try {
        const storageService = new CloudflareR2Service(c.env.BUCKET, 'files');
        const dbService = new CloudflareD1Service(c.env.DB as D1Database);
        const { file, hash } = c.req.valid('form');

        // 检查文件是否已存在（防止重复上传）
        const filename = getFileKey(file.name, hash);
        const existingFile = await storageService.get(filename);
        if (existingFile) {
          return c.json({
            message: 'File already exists',
            exists: true,
            url: `/api/files/${filename}`,
            metadata: existingFile,
          });
        }

        // 检查文件大小
        if (file.size > MAX_SINGLE_UPLOAD_SIZE) {
          return c.json({
            error: `File too large. Maximum size is ${MAX_SINGLE_UPLOAD_SIZE / 1024 / 1024}MB`,
            useMultipart: true
          }, 413);
        }

        // 上传文件到存储
        await storageService.put(filename, file.stream(), {
          contentType: file.type,
        });

        // 保存文件元数据到数据库
        const metadata: FileMetadata = {
          filename: filename,
          title: file.name,
          description: '',
          mime_type: file.type,
          size: file.size,
          uploaded_at: new Date().toISOString(),
        };

        await dbService.saveFile(metadata);

        return c.json({
          message: 'File uploaded successfully',
          url: `/api/files/${filename}`,
          metadata,
        });
      } catch (error: any) {
        console.error('Upload error:', error);
        return c.json({ error: 'Upload failed', details: error.message }, 500);
      }
    }
  )
  // 分片上传 API
  .post(
    '/api/files/multipart/create',
    authMiddleware,
    zValidator('json', multipartCreateSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid JSON data', issues: result.error.issues }, 400);
      }
    }),
    async (c) => {
      try {
        const storageService = new CloudflareR2Service(c.env.BUCKET, 'files');
        const dbService = new CloudflareD1Service(c.env.DB as D1Database);
        const { filename: originalFilename, hash } = c.req.valid('json');

        if (!hash) {
          return c.json({ error: 'Hash is required for multipart upload' }, 400);
        }

        // 检查文件是否已存在
        const filename = getFileKey(originalFilename, hash);
        const existingFile = await storageService.head(filename);
        if (existingFile) {
          return c.json({
            message: 'File already exists',
            exists: true,
            url: `/api/files/${filename}`,
            metadata: existingFile,
          });
        }
        // 创建分片上传
        const multipartUpload = await c.env.BUCKET.createMultipartUpload(`files/${filename}`);

        return c.json({
          upload_id: multipartUpload.uploadId,
          key: filename,
        });
      } catch (error) {
        console.error('Create multipart upload error:', error);
        return c.json({ error: 'Failed to create multipart upload' }, 500);
      }
    }
  )
  .put(
    '/api/files/multipart/upload',
    authMiddleware,
    async (c) => {
      try {
        const upload_id = c.req.query('upload_id');
        const key = c.req.query('key');
        const part_number = c.req.query('part_number');

        if (!upload_id || !key || !part_number) {
          return c.json({ error: 'Missing upload_id, key, or part_number' }, 400);
        }

        const partNumberInt = parseInt(part_number, 10);
        if (isNaN(partNumberInt) || partNumberInt < 1 || partNumberInt > 10000) {
          return c.json({ error: 'Invalid part number' }, 400);
        }

        // 获取请求体作为 ReadableStream
        const body = c.req.raw.body;
        if (!body) {
          return c.json({ error: 'No request body provided' }, 400);
        }

        // 使用 R2 API 上传分片
        const multipartUpload = c.env.BUCKET.resumeMultipartUpload(`files/${key}`, upload_id);
        const uploadedPart = await multipartUpload.uploadPart(partNumberInt, body as any);

        return c.json({
          partNumber: partNumberInt,
          etag: uploadedPart.etag,
        });
      } catch (error) {
        console.error('Part upload error:', error);
        return c.json({ error: 'Failed to upload part' }, 500);
      }
    }
  )
  .post(
    '/api/files/multipart/complete',
    authMiddleware,
    zValidator('json', multipartCompleteSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid JSON data', issues: result.error.issues }, 400);
      }
    }),
    async (c) => {
      try {
        const storageService = new CloudflareR2Service(c.env.BUCKET, 'files');
        const dbService = new CloudflareD1Service(c.env.DB as D1Database);
        const { upload_id, parts, mime_type, filename, size, hash } = c.req.valid('json');

        // 再次检查文件是否已存在（防止竞争条件）
        const key = getFileKey(filename, hash);
        const existingFile = await dbService.getFile(key);
        if (existingFile) {
          // 中止当前的分片上传
          try {
            const multipartUpload = c.env.BUCKET.resumeMultipartUpload(`files/${key}`, upload_id);
            await multipartUpload.abort();
          } catch (abortError) {
            console.error('Failed to abort multipart upload:', abortError);
          }

          return c.json({
            message: 'File already exists',
            exists: true,
            url: `/api/files/${key}`,
            metadata: existingFile,
          });
        }

        // 完成分片上传
        const multipartUpload = c.env.BUCKET.resumeMultipartUpload(`files/${key}`, upload_id);
        await multipartUpload.complete(parts);


        // 保存文件元数据到数据库
        const metadata: FileMetadata = {
          filename: key,
          title: filename,
          description: '',
          mime_type: mime_type,
          size: size,
          uploaded_at: new Date().toISOString(),
        };

        await dbService.saveFile(metadata);

        return c.json({
          message: 'File uploaded successfully',
          url: `/api/files/${key}`,
          exists: false,
          metadata,
        });
      } catch (error) {
        console.error('Complete multipart upload error:', error);
        return c.json({ error: 'Failed to complete multipart upload' }, 500);
      }
    }
  )
  .delete(
    '/api/files/multipart/abort',
    authMiddleware,
    async (c) => {
      try {
        const upload_id = c.req.query('upload_id');
        const key = c.req.query('key');

        if (!upload_id || !key) {
          return c.json({ error: 'Missing upload_id or key' }, 400);
        }

        // 中止分片上传
        const multipartUpload = c.env.BUCKET.resumeMultipartUpload(`files/${key}`, upload_id);
        await multipartUpload.abort();

        return c.json({ message: 'Multipart upload aborted successfully' });
      } catch (error) {
        console.error('Abort multipart upload error:', error);
        return c.json({ error: 'Failed to abort multipart upload' }, 500);
      }
    }
  )
  .get('/files/:filename', async (c) => {
    const { filename } = c.req.param();
    const level = c.req.query('level') as ImageCompressionLevel | undefined;

    const dbService = new CloudflareD1Service(c.env.DB);
    const originalFileStorage = new CloudflareR2Service(c.env.BUCKET, 'files');

    try {
      // Check if file exists in database
      const fileRecord = await dbService.getFile(filename);
      if (!fileRecord) {
        return c.json({ error: 'File not found in database' }, 404);
      }

      // 对于大文件或非图像文件，直接流式返回，不进行压缩处理
      const isLargeFile = fileRecord.size > 50 * 1024 * 1024; // 50MB 以上视为大文件

      if (!fileRecord.mime_type.startsWith('image/') || !level || isLargeFile) {
        return c.redirect(`/r2/files/${filename}`, 302);
      }

      // Validate level parameter
      const levelValidation = ImageCompressionLevelSchema.safeParse(level);
      if (!levelValidation.success) {
        // Invalid level, redirect to original
        console.log(`Invalid level ${level}, redirecting to original file`);
        return c.redirect(`/r2/files/${filename}`, 302);
      }

      const validLevel = levelValidation.data;
      const cacheStorage = new CloudflareR2Service(c.env.BUCKET, `cache/${validLevel}`);

      // Check if cached version already exists
      const cachedObject = await cacheStorage.head(filename);
      if (cachedObject) {
        // Cached version exists, redirect to it
        console.log(`Cached version ${filename} at level ${validLevel} exists, redirecting to it`);
        return c.redirect(`/r2/cache/${validLevel}/${filename}`, 302);
      }

      // 对于小图像文件，尝试压缩
      if (fileRecord.size <= 10 * 1024 * 1024) { // 10MB 以下的图像才进行压缩
        // Get original image from R2
        const originalObject = await originalFileStorage.get(filename);
        if (!originalObject || !originalObject.body) {
          return c.json({ error: 'Original file not found in storage' }, 404);
        }

        try {
          // 安全地处理小图像文件
          const chunks: Uint8Array[] = [];
          let totalSize = 0;

          await processStreamSafely(
            originalObject.body as ReadableStream,
            (chunk) => {
              chunks.push(chunk);
              totalSize += chunk.length;
            },
            { maxSize: 10 * 1024 * 1024 } // 10MB 限制
          );

          // 重新组合为 ArrayBuffer
          const imageData = new Uint8Array(totalSize);
          let offset = 0;
          for (const chunk of chunks) {
            imageData.set(chunk, offset);
            offset += chunk.length;
          }

          // Use CloudFlareImageService for compression
          const imageService = new CloudFlareImageService(c.env.IMAGES);
          const compressed = await imageService.compress(imageData.buffer, validLevel);

          if (compressed && compressed.data) {
            // Cache the compressed image
            await cacheStorage.put(filename, compressed.data, { contentType: compressed.mimeType });

            console.log(`Successfully cached ${filename} at level ${validLevel}`);

            // Redirect to cached version
            return c.redirect(`/r2/cache/${validLevel}/${filename}`, 302);
          } else {
            throw new Error('Image compression failed');
          }

        } catch (transformError) {
          console.error(`Failed to process ${filename} at level ${validLevel}:`, transformError);
          // Transform failed, redirect to original
          return c.redirect(`/r2/files/${filename}`, 302);
        }
      } else {
        // 大图像文件直接返回原文件
        return c.redirect(`/r2/files/${filename}`, 302);
      }

    } catch (error: any) {
      console.error(`Error processing file ${filename}:`, error);
      return c.json({ error: 'Failed to process file', details: error.message }, 500);
    }
  })
  .put('/api/files/:filename',
    authMiddleware,
    zValidator('json', fileUpdateSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid JSON data', issues: result.error.issues }, 400);
      }
    }),
    async (c) => {
      const { filename } = c.req.param();
      const { title, description } = c.req.valid('json');
      const dbService = new CloudflareD1Service(c.env.DB);

      try {
        // Check if file exists in database
        const fileRecord = await dbService.getFile(filename);
        if (!fileRecord) {
          return c.json({ error: 'File not found' }, 404);
        }

        // Update file information
        const updatedRecord = {
          ...fileRecord,
          title: title !== undefined ? title : fileRecord.title,
          description: description !== undefined ? description : fileRecord.description,
        };

        await dbService.saveFile(updatedRecord);

        return c.json({
          message: 'File information updated successfully',
          info: updatedRecord
        });
      } catch (error: any) {
        console.error(`Error updating file ${filename}:`, error);
        return c.json({ error: 'Failed to update file information', details: error.message }, 500);
      }
    }
  )
  .delete('/api/files/:filename', authMiddleware, async (c) => {
    const { filename } = c.req.param();
    const storageService = new CloudflareR2Service(c.env.BUCKET as R2Bucket, 'files');
    const dbService = new CloudflareD1Service(c.env.DB as D1Database);

    try {
      // Check if file exists in database
      const fileRecord = await dbService.getFile(filename);
      if (!fileRecord) {
        return c.json({ error: 'File not found' }, 404);
      }

      // Delete from R2 storage
      await storageService.delete(filename);

      // Delete from cache
      const cacheStorage = new CloudflareR2Service(c.env.BUCKET as R2Bucket, 'cache');
      const cacheDeletePromises = Object.values(ImageCompressionLevelSchema.enum).map(async (level) => {
        try {
          // Check if cache file exists
          const cacheObject = await cacheStorage.head(`${level}/${filename}`);
          if (cacheObject) {
            await cacheStorage.delete(`${level}/${filename}`);
            console.log(`Successfully deleted cache for file ${filename} at level ${level}`);
          }
        } catch (error: any) {
          console.error(`Error deleting cache for file ${filename} at level ${level}:`, error);
        }
      });
      await Promise.allSettled(cacheDeletePromises);

      // Delete from D1 database
      await dbService.deleteFile(filename);

      return c.json({ message: 'File deleted successfully' });
    } catch (error: any) {
      console.error(`Error deleting file ${filename}:`, error);
      return c.json({ error: 'Failed to delete file', details: error.message }, 500);
    }
  })
  .get('/r2/files/:filename', async (c) => {
    const { filename } = c.req.param();
    const storageService = new CloudflareR2Service(c.env.BUCKET as R2Bucket, 'files');
    return streamR2Object(c, storageService, filename);
  })
  .get('/r2/cache/:level/:filename',
    validator('param', (value, c) => {
      const parsedLevel = ImageCompressionLevelSchema.safeParse(value.level);
      if (!parsedLevel.success) {
        return c.text('Invalid compression level', 400);
      }
      return { level: parsedLevel.data, filename: value.filename };
    }),
    async (c) => {
      const { level, filename } = c.req.valid('param');
      const cacheStorage = new CloudflareR2Service(c.env.BUCKET as R2Bucket, `cache/${level}`);

      // Simply serve the cached file if it exists
      return streamR2Object(c, cacheStorage, filename);
    }
  );

// --- Helper to stream R2 object with headers ---
async function streamR2Object(c: Context, storageService: StorageService, key: string, cacheControl?: string) {
  try {
    // Check for Range header for partial content requests
    const rangeHeader = c.req.header('Range');

    if (rangeHeader) {
      // For range requests, use R2 bucket directly to get native range support
      const rangeMatch = rangeHeader.match(/bytes=(\d*)-(\d*)/);
      if (rangeMatch) {
        const start = rangeMatch[1] ? parseInt(rangeMatch[1], 10) : undefined;
        const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : undefined;

        // Use R2's native range support
        const rangeOptions: any = {};

        if (start !== undefined && end !== undefined) {
          // Both start and end specified: bytes=start-end
          rangeOptions.offset = start;
          rangeOptions.length = end - start + 1;
        } else if (start !== undefined && end === undefined) {
          // Only start specified: bytes=start-
          rangeOptions.offset = start;
        } else if (start === undefined && end !== undefined) {
          // Only end specified: bytes=-suffix (last N bytes)
          rangeOptions.suffix = end + 1;
        }

        try {
          // 检查是否在本地开发环境
          const isLocalDev = typeof globalThis.navigator === 'undefined' ||
            c.req.url.includes('localhost') ||
            c.req.url.includes('127.0.0.1');

          if (isLocalDev) {
            // 本地开发环境：使用常规get然后手动处理范围
            const fullObject = await storageService.get(key);
            if (!fullObject || !fullObject.body) {
              return c.json({ error: 'Object Not Found' }, 404);
            }

            // 获取完整内容的大小
            const contentLength = fullObject.metadata?.contentLength;
            if (!contentLength) {
              return c.json({ error: 'Content length unavailable' }, 500);
            }

            // 验证范围
            const actualStart = start || 0;
            const actualEnd = end !== undefined ? Math.min(end, contentLength - 1) : contentLength - 1;

            if (actualStart >= contentLength || actualEnd >= contentLength || actualStart > actualEnd) {
              const headers = new Headers();
              headers.set('Content-Range', `bytes */${contentLength}`);
              return new Response('Range Not Satisfiable', {
                status: 416,
                headers,
              });
            }

            // 对于小范围或小文件，读取并切片
            const rangeSize = actualEnd - actualStart + 1;
            if (rangeSize <= 10 * 1024 * 1024 || contentLength <= 50 * 1024 * 1024) { // 10MB范围或50MB文件
              try {
                // 读取完整对象
                const response = new Response(fullObject.body as ReadableStream);
                const arrayBuffer = await response.arrayBuffer();
                const slice = arrayBuffer.slice(actualStart, actualEnd + 1);

                const headers = new Headers();
                if (fullObject.metadata?.contentType) {
                  headers.set('Content-Type', fullObject.metadata.contentType);
                }
                if (fullObject.metadata?.etag) {
                  headers.set('ETag', fullObject.metadata.etag);
                }
                if (cacheControl) {
                  headers.set('Cache-Control', cacheControl);
                }
                headers.set('Content-Range', `bytes ${actualStart}-${actualEnd}/${contentLength}`);
                headers.set('Content-Length', rangeSize.toString());
                headers.set('Accept-Ranges', 'bytes');

                return new Response(slice, {
                  status: 206,
                  headers,
                });
              } catch (sliceError) {
                console.error('Local range slicing failed:', sliceError);
                // Fall through to production logic
              }
            }
          }

          // 生产环境或本地环境大文件：使用R2原生range
          const r2Object = await c.env.BUCKET.get(`files/${key}`, { range: rangeOptions });

          if (r2Object === null || r2Object.body === null) {
            return c.json({ error: 'Object Not Found' }, 404);
          }

          const headers = new Headers();
          if (r2Object.httpMetadata?.contentType) {
            headers.set('Content-Type', r2Object.httpMetadata.contentType);
          }
          if (r2Object.httpEtag) {
            headers.set('ETag', r2Object.httpEtag);
          }
          if (cacheControl) {
            headers.set('Cache-Control', cacheControl);
          }

          // Set range headers using R2Object properties
          if (r2Object.range) {
            headers.set('Content-Range', `bytes ${r2Object.range.offset}-${r2Object.range.offset + r2Object.range.length - 1}/${r2Object.size}`);
            headers.set('Content-Length', r2Object.range.length.toString());
          } else {
            headers.set('Content-Length', r2Object.size.toString());
          }
          headers.set('Accept-Ranges', 'bytes');

          return new Response(r2Object.body as BodyInit, {
            status: 206, // Partial Content
            headers,
          });
        } catch (rangeError) {
          console.error('Range request failed, falling back to full object:', rangeError);
          // Fall through to regular get
        }
      }
    }

    // For non-range requests or failed range requests, use regular get
    const object = await storageService.get(key);
    if (object === null || object.body === null) {
      return c.json({ error: 'Object Not Found' }, 404);
    }

    const headers = new Headers();
    if (object.metadata?.contentType) {
      headers.set('Content-Type', object.metadata.contentType);
    }
    if (object.metadata?.etag) {
      headers.set('ETag', object.metadata.etag);
    }
    if (cacheControl) {
      headers.set('Cache-Control', cacheControl);
    }

    // For full objects, we need to get the size from metadata
    const contentLength = object.metadata?.contentLength;
    if (contentLength !== undefined) {
      headers.set('Content-Length', contentLength.toString());
    }
    headers.set('Accept-Ranges', 'bytes');

    return new Response(object.body as BodyInit, {
      headers,
    });
  } catch (error: any) {
    console.error(`Failed to get object ${key} from R2:`, error);
    return c.json({ error: 'Failed to retrieve file', details: error.message }, 500);
  }
}

export default app;
export type AppType = typeof route;