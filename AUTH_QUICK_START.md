# Authentication System - Quick Start Guide

## 🚀 Quick Setup

### 1. Environment Setup
```bash
# .env file should have:
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d
NODE_ENV=development
```

### 2. Test the Implementation
```bash
npm run test         
npm run build        
npm run dev:backend   
```

---

## 📚 Using the Auth System

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Access Protected Routes
```bash
# Use the token in Authorization header
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 💻 Using in Code

### Import the Services
```typescript
import { validatePassword } from '@/utils/passwordValidation';
import { passwordService } from '@/services/password.service';
import { tokenService } from '@/services/token.service';
import { userRepository } from '@/repositories/user.repository';
import { authenticateToken } from '@/middleware/authMiddleware';
```

### Protect a Route
```typescript
import { Router } from 'express';
import { authenticateToken } from '@/middleware/authMiddleware';

const router = Router();

// This route requires valid JWT token
router.get('/profile', authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  const email = req.user?.email;
  
  // User is authenticated, proceed...
});
```

### Validate Password
```typescript
const result = validatePassword('MyPassword123');

if (!result.isValid) {
  console.log('Password errors:', result.errors);
  // ['Password must contain...']
}
```

### Hash and Compare Passwords
```typescript
// Hash a password
const hashed = await passwordService.hashPassword('MyPassword123');

// Compare later
const isMatch = await passwordService.comparePassword('MyPassword123', hashed);
console.log(isMatch); // true
```

### Work with Tokens
```typescript
// Generate token
const token = tokenService.generateToken(userId, email);

// Validate token
const result = tokenService.validateToken(token);
if (result.isValid) {
  console.log('User:', result.payload?.email);
}

// Extract from header
const token = tokenService.extractTokenFromHeader('Bearer eyJ...');
```

### User Repository
```typescript
// Find user by email
const user = await userRepository.findByEmail('user@example.com');

// Find by ID
const user = await userRepository.findById(userId);

// Create new user
const user = await userRepository.create(email, passwordHash);

// Update password
await userRepository.updatePassword(userId, newPasswordHash);

// Check if email exists
const exists = await userRepository.emailExists('user@example.com');
```

---

## 🔐 Password Requirements

Passwords must meet ALL of these:
- ✅ At least 8 characters
- ✅ At least one UPPERCASE letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)

**Valid Examples:**
- `SecurePass123`
- `MyPassword789`
- `ValidPass456`

**Invalid Examples:**
- `short` (too short, no uppercase, no number)
- `NoNumbers` (no number)
- `noupppercase123` (no uppercase)
- `NOLOWERCASE123` (no lowercase)
- `Pass1` (too short)

---

## 🧪 Running Tests

```bash
# Run all tests
npm run test

# Watch mode (rerun on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

**Current Test Results:**
```
Test Suites: 4 passed, 4 total ✅
Tests:       30 passed, 30 total ✅
Snapshots:   0 total
Time:        ~8-9 seconds
```

### Test Categories
1. **Password Validation (6 tests)**
   - Valid passwords accepted
   - Invalid passwords rejected
   - Error messages specific

2. **Token Generation (3 tests)**
   - Tokens generated correctly
   - Tokens validated successfully
   - Expiration included

3. **Security Tests (8 tests)**
   - Invalid tokens rejected
   - Tampered tokens rejected
   - Bearer header parsed correctly
   - Malformed tokens rejected

4. **Session Tests (3 tests)**
   - Expiration extracted
   - Consistency checked
   - Token format verified

5. **Storage Tests (6 tests)**
   - File uploads work
   - User-file association
   - Validation passes

6. **Integration Tests (4 tests)**
   - Middleware works
   - Routes accessible
   - Errors handled

---

## 🚨 Error Handling

### Registration Errors
```json
{
  "success": false,
  "error": "Email already registered"
}

{
  "success": false,
  "error": "Password does not meet requirements",
  "details": [
    "Password must be at least 8 characters long",
    "Password must contain at least one number"
  ]
}
```

### Login Errors
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### Authorization Errors
```json
{
  "success": false,
  "error": {
    "message": "Authorization header is missing"
  }
}

{
  "success": false,
  "error": {
    "message": "Token has expired"
  }
}
```

---

## 📊 Architecture Overview

```
Frontend (React)
    ↓
POST /api/auth/register
    ↓
authController.register()
    ├→ validatePassword()
    ├→ userRepository.findByEmail()
    ├→ passwordService.hashPassword()
    ├→ userRepository.create()
    └→ tokenService.generateToken()
    ↓
Backend (Node.js + Express)
    ↓
Database (PostgreSQL + Prisma)
```

---

## 🔄 Request/Response Flow

### Registration Flow
1. User sends `POST /api/auth/register` with email & password
2. Backend validates password strength
3. Checks if email already exists
4. Hashes password with bcrypt
5. Creates user in database
6. Generates JWT token
7. Returns userId, email, and token

### Login Flow
1. User sends `POST /api/auth/login` with email & password
2. Backend finds user by email
3. Compares password using bcrypt
4. If valid, generates JWT token
5. Returns userId, email, and token

### Protected Route Flow
1. Frontend sends request with `Authorization: Bearer <token>` header
2. Middleware extracts and validates token
3. Verifies JWT signature and expiration
4. Attaches user data to request
5. Handler processes request with authenticated user

---

## 🛠️ Troubleshooting

### "Cannot find module" errors
**Solution:** Install dependencies
```bash
npm install
```

### "JWT_SECRET using default value" warning
**Solution:** Set proper JWT_SECRET in .env
```bash
JWT_SECRET=your-complex-secret-key-here
```

### "Token has expired" error
**Solution:** Token is valid for 7 days, get a new one by logging in again

### Tests failing
**Solution:** Make sure dependencies are installed and database is configured
```bash
npm install
npm run test
```

---

## 📈 Feature Checklist

Auth System Features:
- ✅ Password validation (8+ chars, mixed case, numbers)
- ✅ User registration
- ✅ User login with JWT
- ✅ Password hashing (bcrypt)
- ✅ Token generation & validation
- ✅ Session management
- ✅ Protected routes via middleware
- ✅ User enumeration prevention
- ✅ Comprehensive error handling
- ✅ Full test coverage (30 tests)

---

## 🎯 Next: Using Auth in Features

The auth system is now ready for use in:

### Phase 4: Transcription Service
- Upload endpoint can use `req.user?.userId` to associate recordings with users
- User recordings list endpoint

### Phase 5+: Additional Features
- Protected endpoints for user-specific data
- Admin-only endpoints
- User management features

---

## 📚 Full Documentation

For detailed documentation, see:
- `backend/AUTH_SYSTEM.md` - Complete auth system documentation
- `IMPLEMENTATION_SUMMARY.md` - Full implementation overview

---

## 💬 Quick Reference

| Task | Code |
|------|------|
| Protect route | `router.use(authenticateToken)` |
| Get user ID | `req.user?.userId` |
| Get user email | `req.user?.email` |
| Hash password | `passwordService.hashPassword(pwd)` |
| Compare password | `passwordService.comparePassword(pwd, hash)` |
| Generate token | `tokenService.generateToken(uid, email)` |
| Validate token | `tokenService.validateToken(token)` |
| Find user | `userRepository.findByEmail(email)` |
| Check password | `validatePassword(pwd)` |

---

**Authentication System Ready to Use! ✅**
