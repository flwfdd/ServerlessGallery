import { z } from 'zod';

export interface FileMetadata {
    filename: string; // Corresponds to R2 key: md5sum.extension
    title?: string;
    description?: string;
    mime_type: string;
    size: number; // in bytes
    uploaded_at: string; // ISO 8601 string
}

export interface StorageService {
    put(key: string, data: ReadableStream | ArrayBuffer | Blob, metadata?: Record<string, string>): Promise<{ etag?: string }>;
    get(key: string): Promise<{ body: ReadableStream | ArrayBuffer | null, metadata?: Record<string, any> } | null>;
    delete(key: string): Promise<void>;
    head(key: string): Promise<Record<string, any> | null>; // For checking existence and metadata
}

export const ListFilesOptionsSchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
    sort: z.enum(['asc', 'desc']).default('desc'),
    sortBy: z.enum(['uploaded_at', 'size']).default('uploaded_at'),
    mime_type: z.string().optional(),
    search: z.string().optional(),
});
export type ListFilesOptions = z.infer<typeof ListFilesOptionsSchema>;

export interface DatabaseService {
    saveFile(record: FileMetadata): Promise<void>;
    getFile(filename: string): Promise<FileMetadata | null>;
    deleteFile(filename: string): Promise<void>;
    listFiles(options?: ListFilesOptions): Promise<FileMetadata[]>;
}

export const ImageCompressionLevelSchema = z.enum(['low', 'mid', 'high']);
export type ImageCompressionLevel = z.infer<typeof ImageCompressionLevelSchema>;

export interface ImageProcessingService {
    compress(imageData: ArrayBuffer, level: ImageCompressionLevel): Promise<{ data: ArrayBuffer, mimeType: string } | null>;
} 