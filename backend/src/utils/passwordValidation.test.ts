import fc from 'fast-check';
import { validatePassword } from './passwordValidation';

describe('Password Validation', () => {
  describe('Property 17: Password validation rules', () => {
    it('should reject passwords shorter than 8 characters', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 7 }), (password: string) => {
          const result = validatePassword(password);
          // Either invalid or has length error
          if (password.length > 0) {
            return (
              !result.isValid &&
              result.errors?.some(e => e.includes('at least 8 characters')) === true
            );
          }
          return !result.isValid;
        })
      );
    });

    it('should reject passwords without uppercase letters', () => {
      fc.assert(
        fc.property(
          fc.tuple(fc.string({ minLength: 8 }), fc.integer({ min: 1 })),
          ([password, _]: [string, number]) => {
            const noUpperPassword = password.toLowerCase();
            // Ensure no uppercase
            if (!/[A-Z]/.test(noUpperPassword)) {
              const result = validatePassword(noUpperPassword);
              return !result.isValid && result.errors?.some(e => e.includes('uppercase')) === true;
            }
            return true;
          }
        )
      );
    });

    it('should reject passwords without lowercase letters', () => {
      fc.assert(
        fc.property(
          fc.tuple(fc.string({ minLength: 8 }), fc.integer({ min: 1 })),
          ([password, _]: [string, number]) => {
            const noLowerPassword = password.toUpperCase();
            // Ensure no lowercase
            if (!/[a-z]/.test(noLowerPassword)) {
              const result = validatePassword(noLowerPassword);
              return !result.isValid && result.errors?.some(e => e.includes('lowercase')) === true;
            }
            return true;
          }
        )
      );
    });

    it('should reject passwords without numbers', () => {
      fc.assert(
        fc.property(
          fc.tuple(fc.string({ minLength: 8 }), fc.integer({ min: 1 })),
          ([password, _]: [string, number]) => {
            const noDigitPassword = password.replace(/\d/g, 'a');
            // Ensure no digits
            if (!/\d/.test(noDigitPassword)) {
              const result = validatePassword(noDigitPassword);
              return !result.isValid && result.errors?.some(e => e.includes('number')) === true;
            }
            return true;
          }
        )
      );
    });

    it('should accept valid passwords', () => {
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

    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('should return all applicable errors', () => {
      const result = validatePassword('abc');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3); // length, uppercase, number
    });
  });
});
