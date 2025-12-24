import bcrypt from 'bcrypt';
import { logger } from '@/config/logger';

const SALT_ROUNDS = 10;

export class PasswordService {
  /**
   * Hashes a password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      return hashedPassword;
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compares a plain text password with a hashed password
   * @param password - Plain text password
   * @param hashedPassword - Hashed password
   * @returns True if passwords match, false otherwise
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      logger.error('Error comparing passwords:', error);
      return false;
    }
  }
}

export const passwordService = new PasswordService();
