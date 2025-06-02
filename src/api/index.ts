import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
import { zValidator } from '@hono/zod-validator';
import type { Context } from 'hono';
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod';

import type { FileMetadata, ImageCompressionLevel, StorageService } from '../common/services';
import { ImageCompressionLevelSchema, ListFilesOptionsSchema } from '../common/services';
import { CloudflareD1Service, CloudFlareImageService, CloudflareR2Service } from './services/cloudflare';

const htmlShell = (clientScriptPath: string, stylePath: string) => `
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ZenGallery</title>
      <link href="${stylePath}" rel="stylesheet">
    </head>
    <body>
      <div id="app"></div>
      <script type="module" src="${clientScriptPath}"></script>
    </body>
  </html>
`;

// Define bindings directly in Hono generic for better type inference with c.env
const app = new Hono<{
  Bindings: {
    BUCKET: R2Bucket;
    DB: D1Database;
    IMAGES: ImagesBinding;
  }
}>();

// Define Zod schema for file upload
const fileUploadFormSchema = z.object({
  file: z.instanceof(File, { message: "File is required" })
    .refine(file => file.size > 0, { message: "File cannot be empty" }),
  title: z.string().optional(),
  description: z.string().optional(),
});

const fileUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

const route = app
  .get('/', (c) => {
    const clientScript = '/static/client.js';
    const styleSheet = '/static/assets/style.css';
    return c.html(htmlShell(clientScript, styleSheet));
  })
  .get(
    '/api/files',
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
    zValidator('form', fileUploadFormSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid form data', issues: result.error.issues }, 400);
      }
    }),
    async (c) => {
      const storageService = new CloudflareR2Service(c.env.BUCKET as R2Bucket, 'files');
      const dbService = new CloudflareD1Service(c.env.DB as D1Database);

      let tempKey: string | null = null;

      try {
        const { file } = c.req.valid('form');

        const extension = file.name.split('.').pop() || '';

        // Upload to temporary location
        tempKey = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        const uploadResult = await storageService.put(tempKey, file, {
          contentType: file.type
        });

        const etag = uploadResult.etag;
        if (!etag) {
          throw new Error('Upload failed: No ETag received from R2');
        }
        const finalFilename = `${etag}${extension ? `.${extension}` : ''}`;

        // Check if file already exists in database
        const existingFileRecord = await dbService.getFile(finalFilename);

        if (existingFileRecord) {
          // File already exists, delete temporary file and return existing file information
          await storageService.delete(tempKey);
          tempKey = null; // Cleaned up

          return c.json({
            message: `File with identical content already exists: ${file.name}`,
            info: existingFileRecord,
            url: `/files/${existingFileRecord.filename}`,
          });
        }

        // Move from temporary location to final location
        const tempObject = await storageService.get(tempKey);
        if (!tempObject?.body) {
          throw new Error('Failed to retrieve uploaded temporary file');
        }

        // Upload to final location
        await storageService.put(finalFilename, tempObject.body as ReadableStream, {
          contentType: file.type
        });

        // Delete temporary file after successful upload
        await storageService.delete(tempKey);
        tempKey = null; // Cleaned up

        // Save file metadata to database
        const metadata: FileMetadata = {
          filename: finalFilename,
          title: file.name,
          description: '',
          mime_type: file.type || 'application/octet-stream',
          size: uploadResult.size || file.size,
          uploaded_at: new Date().toISOString(),
        };
        await dbService.saveFile(metadata);

        return c.json({
          message: `${file.name} uploaded successfully!`,
          info: metadata,
          url: `/files/${finalFilename}`,
        });

      } catch (error: any) {
        // Ensure temporary file is cleaned up
        if (tempKey) {
          try {
            await storageService.delete(tempKey);
          } catch (cleanupError) {
            console.error('Failed to cleanup temporary file:', cleanupError);
          }
        }

        console.error('Upload error:', error, error.stack);
        return c.json({
          error: 'Failed to upload file',
          details: error.message
        }, 500);
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

      // If not an image or no level specified, redirect to original file
      if (!fileRecord.mime_type.startsWith('image/') || !level) {
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

      // Get original image from R2
      const originalObject = await originalFileStorage.get(filename);
      if (!originalObject || !originalObject.body) {
        return c.json({ error: 'Original file not found in storage' }, 404);
      }

      try {
        // Convert R2 object body to ArrayBuffer for ImageProcessingService
        const imageData = originalObject.body instanceof ReadableStream
          ? await streamToArrayBuffer(originalObject.body)
          : originalObject.body as ArrayBuffer;

        // Use CloudFlareImageService for compression
        const imageService = new CloudFlareImageService(c.env.IMAGES);
        const compressed = await imageService.compress(imageData, validLevel);

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

    } catch (error: any) {
      console.error(`Error processing file ${filename}:`, error);
      return c.json({ error: 'Failed to process file', details: error.message }, 500);
    }
  })
  .put('/api/files/:filename',
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
  .delete('/api/files/:filename', async (c) => {
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

// Helper to convert ReadableStream to ArrayBuffer
async function streamToArrayBuffer(stream: ReadableStream<Uint8Array>): Promise<ArrayBuffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const buffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }
  return buffer.buffer;
}

// --- Helper to stream R2 object with headers ---
async function streamR2Object(c: Context, storageService: StorageService, key: string, cacheControl?: string) {
  try {
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

    const contentLength = object.metadata?.contentLength;
    if (contentLength === undefined) {
      // If we don't know the content length, return the full object
      return new Response(object.body as BodyInit, { headers });
    }

    // Check for Range header for partial content requests
    const rangeHeader = c.req.header('Range');

    if (rangeHeader) {
      // Parse Range header (e.g., "bytes=0-1023" or "bytes=1024-")
      const rangeMatch = rangeHeader.match(/bytes=(\d*)-(\d*)/);
      if (rangeMatch) {
        const start = rangeMatch[1] ? parseInt(rangeMatch[1], 10) : 0;
        const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : contentLength - 1;

        // Validate range
        if (start >= contentLength || end >= contentLength || start > end) {
          headers.set('Content-Range', `bytes */${contentLength}`);
          return new Response('Range Not Satisfiable', {
            status: 416,
            headers,
          });
        }

        // Convert stream to array buffer for range extraction
        const arrayBuffer = await streamToArrayBuffer(object.body as ReadableStream);
        const chunk = arrayBuffer.slice(start, end + 1);

        // Set partial content headers
        headers.set('Content-Range', `bytes ${start}-${end}/${contentLength}`);
        headers.set('Content-Length', chunk.byteLength.toString());
        headers.set('Accept-Ranges', 'bytes');

        return new Response(chunk, {
          status: 206,
          headers,
        });
      }
    }

    // For non-range requests or invalid ranges, return full content
    headers.set('Content-Length', contentLength.toString());
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