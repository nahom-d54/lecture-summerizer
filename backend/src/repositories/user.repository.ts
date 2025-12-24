import { User } from '@prisma/client';
import { logger } from '@/config/logger';
import { prisma } from '@/config/prisma';

export class UserRepository {
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      return user;
    } catch (error) {
      logger.error(`Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      return user;
    } catch (error) {
      logger.error(`Error finding user by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async create(email: string, passwordHash: string): Promise<User> {
    try {
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
        },
      });
      logger.info(`User created: ${email}`);
      return user;
    } catch (error) {
      logger.error(`Error creating user ${email}:`, error);
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, passwordHash: string): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });
      logger.info(`Password updated for user ${id}`);
      return user;
    } catch (error) {
      logger.error(`Error updating password for user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check if email already exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      return !!user;
    } catch (error) {
      logger.error(`Error checking if email exists ${email}:`, error);
      throw error;
    }
  }
}

export const userRepository = new UserRepository();
