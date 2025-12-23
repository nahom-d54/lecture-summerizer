import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  // We don't throw error immediately to allow build/test without key, but logic should handle it
  console.warn('GEMINI_API_KEY is not defined in environment variables');
}

export const gemini = new GoogleGenerativeAI(apiKey || 'dummy-key');
