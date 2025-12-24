import { NextFunction, Request, Response } from 'express';
import { logger } from '@/config/logger';
import { TokenPayload, tokenService } from '@/services/token.service';
import { AppError } from './errorHandler';

/**
 * Extend Express Request to include user data from JWT
 */
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to verify JWT token from Authorization header
 * Extracts token from "Bearer <token>" format
 * Validates token and attaches user to request
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.debug('No authorization header provided');
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authorization header is missing',
        },
      });
    }

    const token = tokenService.extractTokenFromHeader(authHeader);
    if (!token) {
      logger.debug('Invalid authorization header format');
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid authorization header format. Use: Bearer <token>',
        },
      });
    }

    const validationResult = tokenService.validateToken(token);

    if (!validationResult.isValid) {
      logger.warn(`Token validation failed: ${validationResult.error}`);
      return res.status(401).json({
        success: false,
        error: {
          message: validationResult.error || 'Token validation failed',
        },
      });
    }

    // Attach user data to request
    req.user = validationResult.payload;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during authentication',
      },
    });
  }
};

/**
 * Optional: Helper function to check if user is authenticated
 * Can be used for middleware that allows both authenticated and unauthenticated requests
 */
export const optionalAuthenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // No auth header is fine for optional auth
      return next();
    }

    const token = tokenService.extractTokenFromHeader(authHeader);
    if (!token) {
      // Invalid format but we don't fail for optional auth
      logger.debug('Invalid authorization header format in optional auth');
      return next();
    }

    const validationResult = tokenService.validateToken(token);

    if (validationResult.isValid) {
      req.user = validationResult.payload;
    } else {
      logger.debug(`Optional token validation failed: ${validationResult.error}`);
      // Don't fail, just continue without user
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    // Continue without user on error
    next();
  }
};
