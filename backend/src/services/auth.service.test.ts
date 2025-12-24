import { TokenPayload, tokenService } from '@/services/token.service';
import { validatePassword } from '@/utils/passwordValidation';

describe('Authentication System', () => {
  describe('Property 17: Password Validation', () => {
    it('should accept valid passwords with all requirements', () => {
      const validPasswords = [
        'ValidPass123',
        'SecurePass456',
        'MyPassword789',
        'Test1Password',
        'abcDEF123456',
      ];

      validPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toBeUndefined();
      });
    });

    it('should reject passwords shorter than 8 characters', () => {
      const invalidPasswords = ['Pass1', 'Aa1', 'short'];

      invalidPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors?.some(e => e.includes('at least 8 characters'))).toBe(true);
      });
    });

    it('should reject passwords without uppercase letters', () => {
      const password = 'lowercase123';
      const result = validatePassword(password);
      expect(result.isValid).toBe(false);
      expect(result.errors?.some(e => e.includes('uppercase'))).toBe(true);
    });

    it('should reject passwords without lowercase letters', () => {
      const password = 'UPPERCASE123';
      const result = validatePassword(password);
      expect(result.isValid).toBe(false);
      expect(result.errors?.some(e => e.includes('lowercase'))).toBe(true);
    });

    it('should reject passwords without numbers', () => {
      const password = 'NoNumbersHere';
      const result = validatePassword(password);
      expect(result.isValid).toBe(false);
      expect(result.errors?.some(e => e.includes('number'))).toBe(true);
    });

    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('should return all applicable errors for weak password', () => {
      const result = validatePassword('abc');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3); // length, uppercase, number
    });
  });

  describe('Property 18: Authentication Success', () => {
    it('should generate valid JWT tokens for authenticated users', () => {
      const userId = 'test-user-123';
      const email = 'user@example.com';

      const token = tokenService.generateToken(userId, email);

      // Token should be a non-empty string
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      // Token should be decodable
      const decoded = tokenService.decodeToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(userId);
      expect(decoded?.email).toBe(email);
    });

    it('should validate correct tokens successfully', () => {
      const userId = 'test-user-456';
      const email = 'test@example.com';

      const token = tokenService.generateToken(userId, email);
      const result = tokenService.validateToken(token);

      expect(result.isValid).toBe(true);
      expect(result.payload).not.toBeUndefined();
      expect(result.payload?.userId).toBe(userId);
      expect(result.payload?.email).toBe(email);
      expect(result.error).toBeUndefined();
    });

    it('should include correct expiration in token', () => {
      const userId = 'test-user-789';
      const email = 'expiry@example.com';

      const token = tokenService.generateToken(userId, email);
      const decoded = tokenService.decodeToken(token) as TokenPayload & {
        iat: number;
        exp: number;
      };

      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('Property 19: Authentication Failure Security', () => {
    it('should reject invalid tokens', () => {
      const invalidTokens = ['not-a-token', 'invalid.jwt', 'xxx.yyy.zzz', 'just-random-string'];

      invalidTokens.forEach(token => {
        const result = tokenService.validateToken(token);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should reject empty tokens', () => {
      const result = tokenService.validateToken('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject malformed tokens', () => {
      const malformedTokens = ['not.a.jwt', 'missing.signature', 'invalid', 'xxx.yyy.zzz'];

      malformedTokens.forEach(token => {
        const result = tokenService.validateToken(token);
        expect(result.isValid).toBe(false);
      });
    });

    it('should extract tokens correctly from Authorization header', () => {
      const userId = 'bearer-test';
      const email = 'bearer@example.com';
      const token = tokenService.generateToken(userId, email);
      const authHeader = `Bearer ${token}`;

      const extracted = tokenService.extractTokenFromHeader(authHeader);
      expect(extracted).toBe(token);
    });

    it('should reject invalid Authorization header formats', () => {
      const invalidHeaders = [
        'InvalidPrefix token',
        'Bearer',
        'Bearer ',
        'BearerToken',
        'bearer token',
        '',
        'Basic token',
      ];

      invalidHeaders.forEach(header => {
        const extracted = tokenService.extractTokenFromHeader(header);
        expect(extracted).toBeNull();
      });
    });

    it('should return null for missing Authorization header', () => {
      const extracted = tokenService.extractTokenFromHeader(undefined);
      expect(extracted).toBeNull();
    });

    it('should reject tampered tokens', () => {
      const userId = 'tamper-test';
      const email = 'tamper@example.com';
      const token = tokenService.generateToken(userId, email);

      // Tamper with the token
      const parts = token.split('.');
      expect(parts.length).toBe(3);

      const tamperedToken = `${parts[0]}.${parts[1]}.tamperedsignature`;
      const result = tokenService.validateToken(tamperedToken);

      expect(result.isValid).toBe(false);
    });
  });

  describe('Property 20: Session Expiration', () => {
    it('should extract expiration time from tokens', () => {
      const userId = 'exp-test';
      const email = 'exp@example.com';

      const token = tokenService.generateToken(userId, email);
      const decoded = tokenService.decodeToken(token) as TokenPayload & { exp: number };

      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.exp).toBe('number');
      expect(decoded.exp).toBeGreaterThan(0);
    });

    it('should have consistent token expiration', () => {
      const userId = 'consistency-test';
      const email = 'consistency@example.com';

      const token1 = tokenService.generateToken(userId, email);
      const decoded1 = tokenService.decodeToken(token1) as TokenPayload & { exp: number };

      // Small delay
      const token2 = tokenService.generateToken(userId, email);
      const decoded2 = tokenService.decodeToken(token2) as TokenPayload & { exp: number };

      // Both should have expiration set
      expect(decoded1.exp).toBeDefined();
      expect(decoded2.exp).toBeDefined();

      // Difference should be minimal (both tokens have same expiry duration)
      expect(Math.abs(decoded2.exp - decoded1.exp)).toBeLessThan(2);
    });

    it('should correctly format Bearer tokens', () => {
      const userId = 'format-test';
      const email = 'format@example.com';

      const token = tokenService.generateToken(userId, email);

      // Verify token structure (3 parts separated by dots)
      const parts = token.split('.');
      expect(parts.length).toBe(3);

      // Each part should be non-empty
      parts.forEach(part => {
        expect(part.length).toBeGreaterThan(0);
      });
    });
  });
});
