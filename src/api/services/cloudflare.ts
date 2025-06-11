import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
import type { DatabaseService, FileMetadata, ImageCompressionLevel, ImageProcessingService, ListFilesOptions, StorageService } from '../../common/services';

export class CloudflareR2Service implements StorageService {
    private bucket: R2Bucket;
    private prefix: string;

    constructor(bucket: R2Bucket, prefix: string = '') {
        this.bucket = bucket;
        this.prefix = prefix;
    }

    private getFullKey(key: string): string {
        let fullKey = key;
        if (this.prefix) {
            const p = this.prefix.endsWith('/') ? this.prefix : `${this.prefix}/`;
            const k = key.startsWith('/') ? key.substring(1) : key;
            fullKey = `${p}${k}`;
        }
        return fullKey.replace(/\/\/+/g, '/'); // Normalize multiple slashes
    }

    async put(key: string, data: ReadableStream | ArrayBuffer | Blob, metadata?: Record<string, string>): Promise<{ etag?: string; size?: number }> {
        const httpMetadata: Record<string, string> = {};
        if (metadata?.contentType) {
            httpMetadata.contentType = metadata.contentType;
        }

        const result = await this.bucket.put(this.getFullKey(key), data as any, { httpMetadata });

        return {
            etag: result.etag
        };
    }

    async get(key: string): Promise<{ body: ReadableStream<Uint8Array> | ArrayBuffer | null; metadata?: Record<string, any> } | null> {
        const object = await this.bucket.get(this.getFullKey(key));
        if (object === null) {
            return null;
        }
        const body = object.body as (ReadableStream<Uint8Array> | ArrayBuffer | null);

        return {
            body: body,
            metadata: {
                contentType: object.httpMetadata?.contentType,
                contentLength: object.size,
                etag: object.httpEtag,
                customMetadata: object.customMetadata,
            },
        };
    }

    async head(key: string): Promise<Record<string, any> | null> {
        const object = await this.bucket.head(this.getFullKey(key));
        return object;
    }

    async delete(key: string): Promise<void> {
        await this.bucket.delete(this.getFullKey(key));
    }
}

export class CloudflareD1Service implements DatabaseService {
    private db: D1Database;

    constructor(db: D1Database) {
        this.db = db;
    }

    async saveFile(record: FileMetadata): Promise<void> {
        const stmt = this.db.prepare(
            `INSERT INTO files (filename, title, description, mime_type, size, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT (filename) DO UPDATE SET title = ?, description = ?`
        );
        await stmt.bind(
            record.filename,
            record.title || null,
            record.description || null,
            record.mime_type,
            record.size,
            record.uploaded_at,
            record.title || null,
            record.description || null
        ).run();
    }

    async getFile(filename: string): Promise<FileMetadata | null> {
        const stmt = this.db.prepare('SELECT * FROM files WHERE filename = ?');
        const result = await stmt.bind(filename).first<FileMetadata | undefined>();
        return result || null;
    }

    async deleteFile(filename: string): Promise<void> {
        const stmt = this.db.prepare('DELETE FROM files WHERE filename = ?');
        await stmt.bind(filename).run();
    }

    async listFiles(options?: ListFilesOptions): Promise<FileMetadata[]> {
        let query = 'SELECT * FROM files';
        const params: any[] = [];
        const conditions: string[] = [];

        // Add WHERE conditions
        if (options?.mime_type) {
            conditions.push('mime_type LIKE ?');
            params.push(`%${options.mime_type}%`);
        }

        if (options?.search) {
            conditions.push('(title LIKE ? OR description LIKE ?)');
            const searchPattern = `%${options.search}%`;
            params.push(searchPattern, searchPattern);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Add ORDER BY
        if (options?.sort_by) {
            const sortColumn = options.sort_by === 'uploaded_at' ? 'uploaded_at' : 'size';
            const sortOrder = options.sort === 'desc' ? 'DESC' : 'ASC';
            query += ` ORDER BY ${sortColumn} ${sortOrder}`;
        } else {
            // Default sort by upload time, newest first
            query += ' ORDER BY uploaded_at DESC';
        }

        // Add LIMIT and OFFSET for pagination
        if (options?.limit) {
            query += ' LIMIT ?';
            params.push(options.limit);

            if (options?.offset) {
                query += ' OFFSET ?';
                params.push(options.offset);
            }
        }

        const stmt = this.db.prepare(query);
        const result = await stmt.bind(...params).all<FileMetadata>();
        return result.results || [];
    }
}

export class CloudFlareImageService implements ImageProcessingService {
    private imagesBinding: ImagesBinding;

    constructor(imagesBinding: ImagesBinding) {
        this.imagesBinding = imagesBinding;
    }

    async compress(imageData: ArrayBuffer, level: ImageCompressionLevel): Promise<{ data: ArrayBuffer, mimeType: string } | null> {
        try {
            // Convert ArrayBuffer to ReadableStream for Images API
            const imageStream = new ReadableStream({
                start(controller) {
                    controller.enqueue(new Uint8Array(imageData));
                    controller.close();
                }
            });

            // Get transformation parameters based on compression level
            const transformParams = this.getTransformParams(level);

            // Transform image using Cloudflare Images API
            const transformedImageResponse = (
                await this.imagesBinding.input(imageStream)
                    .transform(transformParams.transform)
                    .output(transformParams.output)
            ).response();

            const transformedImageData = await transformedImageResponse.arrayBuffer();
            const outputFormat = transformedImageResponse.headers.get('content-type') || transformParams.output.format;

            console.log(`Successfully compressed image with CloudFlare Images: level=${level}, originalSize=${imageData.byteLength}, compressedSize=${transformedImageData.byteLength}, outputFormat=${outputFormat}`);

            return {
                data: transformedImageData,
                mimeType: outputFormat
            };

        } catch (error) {
            console.error('CloudFlare Images compression failed:', error);
            return null;
        }
    }

    private getTransformParams(level: ImageCompressionLevel): { transform: ImageTransform, output: ImageOutputOptions } {
        switch (level) {
            case 'low':
                return {
                    transform: {
                        width: 720,
                        height: 720,
                        fit: 'scale-down',
                    },
                    output: {
                        format: 'image/jpeg',
                        quality: 24,
                    },
                };
            case 'mid':
                return {
                    transform: {
                        width: 1080,
                        height: 1080,
                        fit: 'scale-down',
                    },
                    output: {
                        format: 'image/jpeg',
                        quality: 42,
                    },
                };
            default:
                return {
                    transform: {
                        width: 2160,
                        height: 2160,
                        fit: 'scale-down',
                    },
                    output: {
                        format: 'image/jpeg',
                        quality: 84,
                    },
                };
        }
    }
} 