import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

// Load environment variables FIRST
// Try multiple paths to handle both tsx (dev) and compiled (prod) scenarios
const envPaths = [
  path.resolve(process.cwd(), '.env'), // When running from backend/
  path.resolve(process.cwd(), 'backend/.env'), // When running from root
  path.resolve(__dirname, '../.env'), // Relative to source
  path.resolve(__dirname, '../../.env'), // Relative to dist
];

let envLoaded = false;
for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`[ENV] Loaded from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('[ENV] Warning: Could not load .env file from any expected location');
}

// Debug: Log key env vars (without sensitive values)
console.log(`[ENV] DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
console.log(`[ENV] GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET'}`);
console.log(`[ENV] JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}`);

import { logger } from '@/config/logger';
import { errorHandler } from '@/middleware/errorHandler';
import apiRoutes from '@/routes';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  // Check transcription service health
  let transcriptionServiceStatus = 'unknown';
  try {
    const transcriptionUrl = process.env.TRANSCRIPTION_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${transcriptionUrl}/health`);
    transcriptionServiceStatus = response.ok ? 'ok' : 'error';
  } catch {
    transcriptionServiceStatus = 'unavailable';
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      transcription: transcriptionServiceStatus,
    },
  });
});

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
