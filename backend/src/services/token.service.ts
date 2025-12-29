import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { logger } from '@/config/logger';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface TokenValidationResult {
  isValid: boolean;
  payload?: TokenPayload;
  error?: string;
}

export class TokenService {
  private jwtSecret: string;
  private jwtExpiry: string;

  constructor() {
    this.jwtSecret =
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    this.jwtExpiry = process.env.JWT_EXPIRY || '7d';

    if (
      process.env.NODE_ENV === 'production' &&
      this.jwtSecret === 'your-super-secret-jwt-key-change-this-in-production'
    ) {
      logger.warn(
        'JWT_SECRET is using default value in production. Please set a secure JWT_SECRET environment variable.'
      );
    }
  }

  /**
   * Generates a JWT token for a user
   * @param userId - User ID
   * @param email - User email
   * @returns JWT token
   */
  generateToken(userId: string, email: string): string {
    try {
      const token = jwt.sign(
        { userId, email },
        this.jwtSecret as string,
        { expiresIn: this.jwtExpiry } as SignOptions
      );
      logger.debug(`Token generated for user ${userId}`);
      return token;
    } catch (error) {
      logger.error('Error generating token:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  /**
   * Validates a JWT token
   * @param token - JWT token to validate
   * @returns Validation result with payload if valid
   */
  validateToken(token: string): TokenValidationResult {
    try {
      const payload = jwt.verify(token, this.jwtSecret as string) as unknown as TokenPayload;

      return {
        isValid: true,
        payload,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('expired')) {
        return {
          isValid: false,
          error: 'Token has expired',
        };
      }

      if (errorMessage.includes('invalid')) {
        return {
          isValid: false,
          error: 'Invalid token',
        };
      }

      return {
        isValid: false,
        error: 'Token validation failed',
      };
    }
  }

  /**
   * Decodes a token without validation (use with caution)
   * @param token - JWT token
   * @returns Decoded payload or null
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Extracts token from Authorization header
   * @param authHeader - Authorization header value
   * @returns Token or null
   */
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || authHeader.trim() === '') {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
      return null;
    }

    return parts[1];
  }
}

export const tokenService = new TokenService();
