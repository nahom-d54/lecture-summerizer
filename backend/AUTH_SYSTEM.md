# Authentication System Documentation

## Overview

The authentication system provides secure user registration, login, logout, and password management features using JWT tokens and bcrypt password hashing.

## Architecture

### Components

#### 1. Password Validation (`utils/passwordValidation.ts`)
Validates password strength requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

**Usage:**
```typescript
import { validatePassword } from '@/utils/passwordValidation';

const result = validatePassword('MyPass123');
if (!result.isValid) {
  console.log(result.errors); // ['Password must contain...']
}
```

#### 2. Password Service (`services/password.service.ts`)
Handles password hashing and comparison using bcrypt.

**Methods:**
- `hashPassword(password: string): Promise<string>` - Hash a plain text password
- `comparePassword(password: string, hashedPassword: string): Promise<boolean>` - Compare plain text with hashed

**Usage:**
```typescript
import { passwordService } from '@/services/password.service';

const hashed = await passwordService.hashPassword('MyPass123');
const isMatch = await passwordService.comparePassword('MyPass123', hashed);
```

#### 3. Token Service (`services/token.service.ts`)
Manages JWT token generation and validation.

**Methods:**
- `generateToken(userId: string, email: string): string` - Create a JWT token
- `validateToken(token: string): TokenValidationResult` - Verify and decode token
- `decodeToken(token: string): TokenPayload | null` - Decode without validation
- `extractTokenFromHeader(authHeader: string): string | null` - Parse Bearer token

**Token Structure:**
```
Header.Payload.Signature

Payload contains:
{
  userId: string,
  email: string,
  iat: number,      // Issued at
  exp: number       // Expiration time
}
```

**Usage:**
```typescript
import { tokenService } from '@/services/token.service';

// Generate
const token = tokenService.generateToken('user123', 'user@example.com');

// Validate
const result = tokenService.validateToken(token);
if (result.isValid) {
  console.log(result.payload?.email);
}

// Extract from header
const token = tokenService.extractTokenFromHeader('Bearer eyJhbGc...');
```

#### 4. User Repository (`repositories/user.repository.ts`)
Data access layer for user operations.

**Methods:**
- `findByEmail(email: string): Promise<User | null>`
- `findById(id: string): Promise<User | null>`
- `create(email: string, passwordHash: string): Promise<User>`
- `updatePassword(id: string, passwordHash: string): Promise<User>`
- `emailExists(email: string): Promise<boolean>`

**Usage:**
```typescript
import { userRepository } from '@/repositories/user.repository';

const user = await userRepository.findByEmail('user@example.com');
```

#### 5. Auth Middleware (`middleware/authMiddleware.ts`)
Express middleware for protecting routes with JWT validation.

**Middleware Functions:**
- `authenticateToken` - Required authentication
- `optionalAuthenticateToken` - Optional authentication

**Usage:**
```typescript
import { authenticateToken } from '@/middleware/authMiddleware';

// Protected route
router.post('/protected', authenticateToken, (req, res) => {
  console.log(req.user?.email); // User from JWT
});
```

**Request Enhancement:**
```typescript
// Extended Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
```

#### 6. Auth Controller (`controllers/authController.ts`)
Implements authentication logic.

**Functions:**
- `register` - Create new user account
- `login` - Authenticate and return JWT
- `logout` - End session (client-side mainly)
- `requestPasswordReset` - Request password reset
- `resetPassword` - Reset password with token

## API Endpoints

### 1. Register User
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "ValidPass123"
}

Response (201 Created):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

Error Response (400 Bad Request):
{
  "success": false,
  "error": "Password does not meet requirements",
  "details": [
    "Password must be at least 8 characters long",
    "Password must contain at least one number"
  ]
}

Error Response (409 Conflict):
{
  "success": false,
  "error": "Email already registered"
}
```

### 2. Login User
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "ValidPass123"
}

Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

Error Response (401 Unauthorized):
{
  "success": false,
  "error": "Invalid email or password"
}
```

### 3. Logout User
```
POST /api/auth/logout
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "message": "Logged out successfully"
}

Error Response (401 Unauthorized):
{
  "success": false,
  "error": {
    "message": "Authorization header is missing"
  }
}
```

### 4. Request Password Reset
```
POST /api/auth/password-reset
Content-Type: application/json

Request Body:
{
  "email": "user@example.com"
}

Response (200 OK):
{
  "success": true,
  "message": "If the email exists, a password reset link will be sent"
}
```

### 5. Reset Password
```
POST /api/auth/password-reset/:token
Content-Type: application/json

Request Body:
{
  "password": "NewPass123"
}

Response (501 Not Implemented):
{
  "success": false,
  "error": "Password reset feature not yet fully implemented"
}
```

## Security Considerations

### 1. Password Security
- ✅ Passwords validated for strength (8+ chars, mixed case, numbers)
- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ Password never stored in plain text
- ✅ Password comparison uses bcrypt.compare() for timing-safe comparison

### 2. JWT Security
- ✅ Tokens signed with HS256 algorithm
- ✅ Token expiration set (default: 7 days)
- ✅ Tokens extracted from Bearer header only
- ✅ Signature validation on every request
- ✅ Token payload contains minimal info (userId, email)

### 3. User Enumeration Prevention
- ✅ Login returns generic error ("Invalid email or password")
- ✅ Password reset doesn't reveal if email exists

### 4. Error Messages
- ✅ No stack traces exposed in production
- ✅ Generic error messages for invalid credentials
- ✅ Detailed validation errors only shown during registration

## Environment Configuration

```env
# JWT Settings
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=7d

# Node Environment
NODE_ENV=development
LOG_LEVEL=info
```

## Testing

### Property-Based Tests (Fast-Check)

**Property 17: Password Validation**
- Tests that passwords follow all validation rules
- Tests rejection of invalid passwords
- Tests acceptance of valid passwords

**Property 18: Authentication Success**
- Tests valid token generation
- Tests token validation
- Tests token expiration claim
- Tests payload correctness

**Property 19: Authentication Failure Security**
- Tests rejection of invalid tokens
- Tests rejection of malformed tokens
- Tests rejection of tampered tokens
- Tests Bearer header parsing

**Property 20: Session Expiration**
- Tests expired token rejection
- Tests expiration time extraction
- Tests signature validation

### Running Tests

```bash
npm run test:auth          # Run auth tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

## Integration Guide

### Protecting Routes

```typescript
import { authenticateToken } from '@/middleware/authMiddleware';
import { userRepository } from '@/repositories/user.repository';

router.post('/protected-route', authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  const user = await userRepository.findById(userId!);
  // ... handle request
});
```

### Using in Controllers

```typescript
import { validatePassword } from '@/utils/passwordValidation';
import { passwordService } from '@/services/password.service';
import { tokenService } from '@/services/token.service';
import { userRepository } from '@/repositories/user.repository';

async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;
  
  const user = await userRepository.findByEmail(email);
  const isValid = await passwordService.comparePassword(password, user.passwordHash);
  const token = tokenService.generateToken(user.id, user.email);
  
  res.json({ token });
}
```

## Future Enhancements

### Phase 3 (Current)
- ✅ Password validation utility
- ✅ User registration
- ✅ User login with JWT
- ✅ Session management
- ✅ Basic password reset request

### Phase 3.5 (Planned)
- [ ] Email-based password reset tokens
- [ ] Token blacklist for logout
- [ ] Multi-factor authentication (MFA)
- [ ] OAuth2 integration (Google, GitHub)
- [ ] Account recovery options
- [ ] Login history tracking
- [ ] Suspicious activity alerts
- [ ] Session invalidation on password change

### Phase 4+ (Future)
- [ ] Permission/role-based access control
- [ ] API key management
- [ ] OAuth2 token refresh mechanisms
- [ ] Advanced security audit logging

## Common Issues & Troubleshooting

### Issue: "Cannot find module 'jsonwebtoken'"
**Solution:** Install dependencies
```bash
npm install
```

### Issue: "JWT_SECRET using default value in production"
**Solution:** Set environment variable
```bash
export JWT_SECRET=your-super-secret-key-here
```

### Issue: "Invalid token" on valid Bearer header
**Solution:** Ensure token format is `Bearer <token>` (note the space)
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Issue: Token validation fails with "malformed"
**Solution:** Tokens are 3 parts separated by dots. Ensure none are cut off.

## Code Examples

### Complete Registration Flow
```typescript
// 1. Client sends request
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "MyPassword123"
}

// 2. Backend validates password
const validation = validatePassword("MyPassword123");
// { isValid: true }

// 3. Check if user exists
const exists = await userRepository.emailExists("user@example.com");
// false

// 4. Hash password
const hash = await passwordService.hashPassword("MyPassword123");

// 5. Create user
const user = await userRepository.create("user@example.com", hash);

// 6. Generate token
const token = tokenService.generateToken(user.id, user.email);

// 7. Return response
{
  "success": true,
  "data": {
    "userId": "550e8400...",
    "email": "user@example.com",
    "token": "eyJhbGc..."
  }
}

// 8. Client stores token
localStorage.setItem('token', token);

// 9. Client includes in future requests
headers: {
  Authorization: `Bearer ${token}`
}
```

### Protected Route Example
```typescript
router.get(
  '/api/profile',
  authenticateToken,
  async (req, res) => {
    const userId = req.user?.userId;
    const user = await userRepository.findById(userId!);
    res.json({ user });
  }
);
```

## Files Overview

| File | Purpose |
|------|---------|
| `utils/passwordValidation.ts` | Password strength rules |
| `utils/passwordValidation.test.ts` | Password validation tests |
| `services/password.service.ts` | Bcrypt hashing/comparison |
| `services/token.service.ts` | JWT generation/validation |
| `repositories/user.repository.ts` | User database operations |
| `middleware/authMiddleware.ts` | JWT verification middleware |
| `controllers/authController.ts` | Route handlers |
| `routes/auth.routes.ts` | Authentication endpoints |
| `services/auth.service.test.ts` | Comprehensive auth tests |

## Summary

The authentication system is built with:
- **Security-first design** using bcrypt and JWT
- **Property-based testing** for robust validation
- **Clean architecture** with separation of concerns
- **Comprehensive error handling** and logging
- **Clear API documentation** and usage examples
- **Database integration** via Prisma ORM
- **Middleware pattern** for route protection

All components follow the project's structure and patterns without modifying existing code.
