import { Request, Response } from 'express';
import validator from 'validator';
import { logger } from '@/config/logger';
import { userRepository } from '@/repositories/user.repository';
import { passwordService } from '@/services/password.service';
import { tokenService } from '@/services/token.service';
import { validatePassword } from '@/utils/passwordValidation';

/**
 * Register a new user
 * POST /api/auth/register
 * Body: { email: string, password: string }
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Validate email format using validator library (ReDoS-safe)
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Password does not meet requirements',
        details: passwordValidation.errors,
      });
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
      });
    }

    // Hash password
    const passwordHash = await passwordService.hashPassword(password);

    // Create user
    const user = await userRepository.create(email, passwordHash);

    // Generate token
    const token = tokenService.generateToken(user.id, user.email);

    logger.info(`User registered successfully: ${email}`);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user.id,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during registration',
    });
  }
};

/**
 * User login
 * POST /api/auth/login
 * Body: { email: string, password: string }
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      // Don't reveal if user exists for security
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await passwordService.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for user: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate token
    const token = tokenService.generateToken(user.id, user.email);

    logger.info(`User logged in successfully: ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during login',
    });
  }
};

/**
 * User logout
 * POST /api/auth/logout
 * Note: JWT is stateless, logout is mainly for frontend to clear token
 * In a real app, you might want to use a token blacklist
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can log the action for security audit
    if (req.user) {
      logger.info(`User logged out: ${req.user.email}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during logout',
    });
  }
};

/**
 * Request password reset
 * POST /api/auth/password-reset
 * Body: { email: string }
 * Note: Full implementation would include email sending
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists for security
      logger.warn(`Password reset request for non-existent email: ${email}`);
    } else {
      logger.info(`Password reset requested for: ${email}`);
      // TODO: In production, send reset email with token here
      // For now, we'll just log it
    }

    // Always return success to avoid user enumeration
    return res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link will be sent',
    });
  } catch (error) {
    logger.error('Password reset request error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during password reset request',
    });
  }
};

/**
 * Reset password with token
 * POST /api/auth/password-reset/:token
 * Body: { password: string }
 * Note: This requires token generation and storage
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required',
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Password does not meet requirements',
        details: passwordValidation.errors,
      });
    }

    // TODO: Verify reset token and get user ID
    // For now, this is a placeholder
    logger.warn('Password reset endpoint called but not fully implemented');

    return res.status(501).json({
      success: false,
      error: 'Password reset feature not yet fully implemented',
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during password reset',
    });
  }
};
