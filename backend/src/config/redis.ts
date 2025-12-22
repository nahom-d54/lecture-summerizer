import Redis from 'ioredis';
import { logger } from './logger';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const redisClient = new Redis(redisConfig);

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', err => {
  logger.error('Redis client error:', err);
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

export default redisClient;
