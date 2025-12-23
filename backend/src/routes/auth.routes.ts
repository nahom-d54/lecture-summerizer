import { Request, Response, Router } from 'express';
import {
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
} from '@/controllers/authController';
import { authenticateToken } from '@/middleware/authMiddleware';

const router: Router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { email: string, password: string }
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * User login
 * Body: { email: string, password: string }
 */
router.post('/login', login);

/**
 * POST /api/auth/logout
 * User logout (requires authentication)
 * Headers: { Authorization: Bearer <token> }
 */
router.post('/logout', authenticateToken, logout);

/**
 * POST /api/auth/password-reset
 * Request password reset
 * Body: { email: string }
 */
router.post('/password-reset', requestPasswordReset);

/**
 * POST /api/auth/password-reset/:token
 * Reset password with token
 * Params: token
 * Body: { password: string }
 */
router.post('/password-reset/:token', resetPassword);

export default router;
