import { PrismaClient } from '@prisma/client';

// Lazy initialization to ensure DATABASE_URL is loaded from .env first
let _prisma: PrismaClient | null = null;

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!_prisma) {
      _prisma = new PrismaClient();
    }
    return (_prisma as any)[prop];
  },
});
