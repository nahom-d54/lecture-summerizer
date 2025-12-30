import OpenAI from 'openai';

const token = process.env.GITHUB_TOKEN;
const endpoint = process.env.OPENAI_BASE_URL || 'https://models.github.ai/inference';

if (!token) {
  console.warn('GITHUB_TOKEN is not defined in environment variables');
}

// Initialize OpenAI client with GitHub Models endpoint
export const openai = new OpenAI({
  baseURL: endpoint,
  apiKey: token || 'dummy-key',
});

export const MODEL_NAME = process.env.OPENAI_MODEL || 'gpt-4o-mini';
