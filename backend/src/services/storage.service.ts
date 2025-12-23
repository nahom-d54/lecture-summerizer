import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/config/logger';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export class StorageService {
  constructor() {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
  }

  async saveFile(userId: string, fileBuffer: Buffer, originalName: string): Promise<string> {
    const extension = path.extname(originalName);
    const fileName = `${userId}_${uuidv4()}${extension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.writeFile(filePath, fileBuffer);
    logger.info(`File saved: ${filePath}`);

    return fileName;
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(UPLOAD_DIR, fileName);
    try {
      await fs.unlink(filePath);
      logger.info(`File deleted: ${filePath}`);
    } catch (error) {
      logger.error(`Error deleting file ${filePath}:`, error);
      // We might not want to throw if the file is already gone, but for now strict is okay
    }
  }

  getFilePath(fileName: string): string {
    return path.join(UPLOAD_DIR, fileName);
  }
}

export const storageService = new StorageService();
