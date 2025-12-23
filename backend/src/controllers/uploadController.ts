import { Request, Response } from 'express';
import { logger } from '@/config/logger';
import { prisma } from '@/config/prisma';
import { storageService } from '@/services/storage.service';
import { validateFileFormat, validateFileSize } from '@/utils/fileValidation';

export const uploadRecording = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { mimetype, size, originalname, buffer } = req.file;

    // Validate Format
    const formatValidation = validateFileFormat(mimetype);
    if (!formatValidation.isValid) {
      return res.status(400).json({ success: false, error: formatValidation.error });
    }

    // Validate Size
    const sizeValidation = validateFileSize(size);
    if (!sizeValidation.isValid) {
      return res.status(400).json({ success: false, error: sizeValidation.error });
    }

    // Get User (Simulated for Step 2 until Auth is implemented in Step 3)
    // Try to find a demo user or create one
    let user = await prisma.user.findFirst({ where: { email: 'demo@example.com' } });
    if (!user) {
      // Create a dummy user for development testing
      user = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          passwordHash: 'dummy_hash', // Will be real later
        },
      });
    }

    const userId = user.id;

    // Save File
    const storagePath = await storageService.saveFile(userId, buffer, originalname);

    // Create DB Record
    const recording = await prisma.recording.create({
      data: {
        userId,
        title: originalname,
        originalFilename: originalname,
        fileSize: size, // BigInt in schema
        format: mimetype,
        storagePath,
        status: 'uploaded',
      },
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: recording.id,
        filename: recording.originalFilename,
        status: recording.status,
      },
    });
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during upload' });
  }
};
