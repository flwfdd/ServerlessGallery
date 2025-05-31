-- Migration number: 0001 	 2024-05-22_16_00_00_create_files_table.sql
DROP TABLE IF EXISTS files;

CREATE TABLE files (
    filename TEXT PRIMARY KEY,    -- R2 key, e.g., md5sum.extension
    title TEXT,
    description TEXT,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,        -- File size in bytes
    uploaded_at TEXT NOT NULL   -- ISO 8601 datetime string, e.g., YYYY-MM-DDTHH:MM:SSZ
);

-- Create indexes for columns that will be frequently searched or sorted
CREATE INDEX IF NOT EXISTS idx_files_title ON files (title);
CREATE INDEX IF NOT EXISTS idx_files_description ON files (description);
CREATE INDEX IF NOT EXISTS idx_files_mime_type ON files (mime_type);
CREATE INDEX IF NOT EXISTS idx_files_size ON files (size);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files (uploaded_at);