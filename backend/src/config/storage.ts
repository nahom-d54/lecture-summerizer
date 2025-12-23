import path from 'path';

export const storageConfig = {
  uploadDir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
  maxFileSize: 500 * 1024 * 1024, // 500MB
  allowedFormats: ['mp3', 'wav', 'm4a', 'webm'],
};
