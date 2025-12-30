import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not defined in environment variables');
}

// Initialize with the new Google GenAI SDK
export const gemini = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
