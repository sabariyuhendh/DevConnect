# Backend Implementation Guide
## DevConnect - Professional Backend Architecture

This guide provides a step-by-step approach to implementing the backend following industry best practices. Follow the file flow in order for a systematic, professional implementation.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Implementation Phases](#implementation-phases)
3. [File Flow Structure](#file-flow-structure)
4. [Detailed Implementation Steps](#detailed-implementation-steps)
5. [Crucial Implementation Points](#crucial-implementation-points)
6. [Testing Checklist](#testing-checklist)

---

## 🏗️ Architecture Overview

### Layered Architecture Pattern

```
┌─────────────────────────────────────┐
│        Entry Point (server.ts)      │
│  Express App Setup & Route Mounting │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Routes Layer                 │
│  authRoutes, profileRoutes, etc.    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Middleware Layer                │
│  auth, validate, errorHandler, etc. │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Controllers Layer               │
│  authController, profileController   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Utilities Layer                │
│  jwt, apiResponse, errors, etc.     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Database Layer (Prisma)        │
│  schema.prisma → NeonDB PostgreSQL  │
└─────────────────────────────────────┘
```

### Why This Structure?

- **Separation of Concerns**: Each layer has a single responsibility
- **Maintainability**: Easy to locate and modify code
- **Testability**: Each layer can be tested independently
- **Scalability**: Easy to add new features without breaking existing code
- **Team Collaboration**: Multiple developers can work on different layers

---

## 🚀 Implementation Phases

### Phase 1: Foundation Layer (Start Here)
**Goal**: Set up the core infrastructure that everything else depends on.

**Files to Implement**:
1. Configuration files (env, database, logger)
2. Utility functions (errors, apiResponse, jwt)
3. Type definitions
4. Prisma schema

**Why First**: Without these, nothing else can function properly.

---

### Phase 2: Authentication System
**Goal**: Enable user registration, login, and token management.

**Files to Implement**:
1. Validation schemas (authValidation)
2. JWT utilities
3. Auth middleware (protect routes)
4. Auth controller (signup, signin, logout)
5. Auth routes (connect endpoints)

**Why Second**: Authentication is the gateway to all protected features.

---

### Phase 3: Protected Routes & Profile System
**Goal**: Allow authenticated users to manage their profiles.

**Files to Implement**:
1. Profile validation
2. Profile controller
3. Profile routes
4. File upload utilities (for profile pictures)

**Why Third**: Profiles are the core user data after authentication.

---

### Phase 4: Content Layer (Posts, Comments)
**Goal**: Enable users to create and interact with content.

**Files to Implement**:
1. Post/Comment models in schema
2. Post/Comment validations
3. Post/Comment controllers
4. Post/Comment routes

**Why Fourth**: Content is the main feature of the social platform.

---

### Phase 5: Advanced Features (Jobs, Events, Gamification)
**Goal**: Add professional networking features.

**Files to Implement**:
1. Job/Event models
2. Job/Event controllers
3. Job/Event routes
4. Gamification models and logic

**Why Last**: These features build on the foundation of auth and profiles.

---

## 📁 File Flow Structure

### Implementation Order (Bottom-Up Approach)

```
FOUNDATION LAYER (Do First)
├── 1. backend/prisma/schema.prisma
├── 2. backend/src/config/env.ts
├── 3. backend/src/config/database.ts
├── 4. backend/src/config/logger.ts
├── 5. backend/src/types/express.d.ts
├── 6. backend/src/types/auth.ts
├── 7. backend/src/utils/errors.ts
├── 8. backend/src/utils/apiResponse.ts
└── 9. backend/src/utils/jwt.ts

AUTHENTICATION SYSTEM (Do Second)
├── 10. backend/src/utils/jwt.ts (complete implementation)
├── 11. backend/src/validations/authValidation.ts
├── 12. backend/src/middleware/validate.ts
├── 13. backend/src/middleware/auth.ts
├── 14. backend/src/controllers/authController.ts
└── 15. backend/src/routes/authRoutes.ts

PROFILE SYSTEM (Do Third)
├── 16. backend/src/utils/fileUpload.ts
├── 17. backend/src/validations/profileValidation.ts
├── 18. backend/src/controllers/profileController.ts
└── 19. backend/src/routes/profileRoutes.ts

MIDDLEWARE & ERROR HANDLING (Do Fourth)
├── 20. backend/src/middleware/errorHandler.ts
├── 21. backend/src/middleware/rateLimit.ts
└── 22. backend/src/middleware/security.ts

ENTRY POINT (Do Last)
└── 23. backend/server.ts
```

---

## 📝 Detailed Implementation Steps

### PHASE 1: FOUNDATION LAYER

---

#### Step 1: `backend/prisma/schema.prisma`
**Purpose**: Define your database structure - the foundation of all data operations.

**What to Do**:
1. Define all models (User, Post, Comment, Like, Follow, etc.)
2. Set up relationships between models
3. Add indexes for performance
4. Configure Prisma client generation

**Key Points**:
- Use `@id @default(cuid())` for unique IDs
- Use `@unique` for fields like email, username
- Set up proper relationships (`@relation`)
- Add `createdAt` and `updatedAt` timestamps to all models
- Use nullable fields (`String?`) for optional data
- Add indexes on frequently queried fields (email, username, userId)

**Crucial Parts**:
- ✅ User model must have `provider` field (for OAuth later)
- ✅ Password should be nullable (OAuth users don't have passwords)
- ✅ Add `Session` and `RefreshToken` models for token management
- ✅ Set up proper cascade deletes (e.g., when user deletes, delete their posts)

**Next File**: `backend/src/config/env.ts`

---

#### Step 2: `backend/src/config/env.ts`
**Purpose**: Centralized environment variable management with validation.

**What to Do**:
1. Import `dotenv` and `zod`
2. Create a Zod schema for all environment variables
3. Parse and validate environment variables
4. Export typed constants for use throughout the app

**Key Points**:
- Validate ALL required environment variables
- Provide sensible defaults where appropriate
- Use Zod for type-safe validation
- Export boolean flags (IS_PRODUCTION, IS_DEVELOPMENT)
- Validate JWT_SECRET length (minimum 32 characters)

**Environment Variables Needed**:
```typescript
DATABASE_URL          // PostgreSQL connection string
JWT_SECRET           // Secret for signing tokens (min 32 chars)
JWT_EXPIRES_IN       // Token expiration (default: '15m')
JWT_REFRESH_EXPIRES_IN // Refresh token expiration (default: '7d')
NODE_ENV             // 'development' | 'production' | 'test'
PORT                 // Server port (default: 3001)
CORS_ORIGIN          // Allowed frontend origin
RATE_LIMIT_WINDOW_MS // Rate limit window
RATE_LIMIT_MAX       // Max requests per window
```

**Crucial Parts**:
- ✅ Validate JWT_SECRET is at least 32 characters
- ✅ Fail fast if required variables are missing
- ✅ Export typed values, not raw process.env

**Next File**: `backend/src/config/database.ts`

---

#### Step 3: `backend/src/config/database.ts`
**Purpose**: Single Prisma Client instance for the entire application.

**What to Do**:
1. Import PrismaClient from `@prisma/client`
2. Create a singleton instance of PrismaClient
3. Configure logging based on environment
4. Handle connection lifecycle
5. Export the prisma instance

**Key Points**:
- Use singleton pattern (only one Prisma instance)
- Configure logging: `['query', 'error', 'warn']` in development, `['error']` in production
- Add connection error handling
- Export a single `prisma` instance

**Crucial Parts**:
- ✅ Always use the exported `prisma` instance, never create new PrismaClient()
- ✅ Handle Prisma connection errors gracefully
- ✅ Configure appropriate logging levels per environment

**Next File**: `backend/src/config/logger.ts`

---

#### Step 4: `backend/src/config/logger.ts`
**Purpose**: Structured logging for debugging and monitoring.

**What to Do**:
1. Set up Winston logger
2. Configure different log levels (error, warn, info, debug)
3. Set up log formats (JSON for production, readable for development)
4. Configure log destinations (console, file)
5. Export logger functions

**Key Points**:
- Use Winston for structured logging
- Different formats for dev vs production
- Log levels: error, warn, info, debug
- Export convenient functions: `logger.error()`, `logger.info()`, etc.

**Crucial Parts**:
- ✅ Log errors with stack traces
- ✅ Use structured logging (JSON) in production
- ✅ Don't log sensitive data (passwords, tokens)

**Next File**: `backend/src/types/express.d.ts`

---

#### Step 5: `backend/src/types/express.d.ts`
**Purpose**: Extend Express Request type to include user information.

**What to Do**:
1. Import User type from Prisma
2. Extend Express namespace
3. Add `user` property to Request interface
4. Exclude password from user object

**Key Points**:
- Use TypeScript module augmentation
- Extend `Express.Request` interface
- Use `Omit<User, 'password'>` to exclude sensitive fields
- This makes `req.user` available throughout your app

**Crucial Parts**:
- ✅ Always exclude password from user type
- ✅ Make user optional (`user?:`) since not all routes are authenticated

**Next File**: `backend/src/types/auth.ts`

---

#### Step 6: `backend/src/types/auth.ts`
**Purpose**: Type definitions for authentication-related operations.

**What to Do**:
1. Define request interfaces (SignupRequest, SigninRequest)
2. Define response interfaces (AuthResponse, UserResponse)
3. Define token payload interface
4. Export all types

**Key Points**:
- Type all request/response shapes
- Use consistent naming (Request/Response suffix)
- Include all fields that frontend expects
- Make optional fields explicitly nullable

**Crucial Parts**:
- ✅ Match frontend expectations exactly
- ✅ Include all user fields in UserResponse
- ✅ Define token payload structure

**Next File**: `backend/src/utils/errors.ts`

---

#### Step 7: `backend/src/utils/errors.ts`
**Purpose**: Custom error classes and global error handler.

**What to Do**:
1. Create `AppError` class extending Error
2. Add `statusCode` property
3. Create `globalErrorHandler` middleware
4. Handle different error types (Prisma, JWT, Validation)
5. Format error responses consistently

**Key Points**:
- Custom error class for application errors
- Global error handler catches all errors
- Different handling for development vs production
- Don't expose stack traces in production
- Handle Prisma errors (unique constraint, foreign key, etc.)
- Handle JWT errors (expired, invalid, etc.)

**Error Types to Handle**:
- Prisma errors (unique constraint, foreign key, not found)
- JWT errors (expired, invalid, missing)
- Validation errors (Zod errors)
- Custom AppError
- Unknown errors

**Crucial Parts**:
- ✅ Always return consistent error format
- ✅ Don't leak sensitive information in production
- ✅ Log errors with full details (server-side)
- ✅ Handle Prisma unique constraint errors (user-friendly messages)

**Next File**: `backend/src/utils/apiResponse.ts`

---

#### Step 8: `backend/src/utils/apiResponse.ts`
**Purpose**: Standardized API response format for success and error cases.

**What to Do**:
1. Define response types (SuccessResponse, ErrorResponse)
2. Create `successResponse()` helper
3. Create `errorResponse()` helper
4. Create specific helpers (notFoundResponse, unauthorizedResponse, etc.)
5. Create `asyncHandler` wrapper for async route handlers

**Key Points**:
- Consistent response format across all endpoints
- Include status, data/message, and optional metadata
- Support pagination metadata
- Helper functions reduce code duplication
- `asyncHandler` catches async errors automatically

**Response Format**:
```typescript
// Success
{
  status: 'success',
  data: {...},
  message?: string,
  meta?: { total, page, limit, totalPages }
}

// Error
{
  status: 'error',
  message: string,
  error?: any, // Only in development
  errors?: Array<{ field: string; message: string }>
}
```

**Crucial Parts**:
- ✅ Always use these helpers (don't use res.json directly)
- ✅ Include error details only in development
- ✅ Use asyncHandler for all async controllers

**Next File**: `backend/src/utils/jwt.ts`

---

#### Step 9: `backend/src/utils/jwt.ts`
**Purpose**: JWT token generation, verification, and refresh token management.

**What to Do**:
1. Create `signToken()` function (signs JWT with user ID)
2. Create `verifyToken()` function (verifies and decodes JWT)
3. Create `signRefreshToken()` function
4. Create `verifyRefreshToken()` function
5. Export all functions

**Key Points**:
- Use jsonwebtoken library
- Access token: short-lived (15 minutes)
- Refresh token: long-lived (7 days)
- Sign with user ID in payload
- Use JWT_SECRET from env config
- Handle token expiration

**Token Payload Structure**:
```typescript
{
  id: string, // User ID
  iat: number, // Issued at
  exp: number // Expiration
}
```

**Crucial Parts**:
- ✅ Use different secrets/expiration for access vs refresh tokens
- ✅ Always verify token signature
- ✅ Handle expired tokens gracefully
- ✅ Don't include sensitive data in token payload

**Next File**: `backend/src/validations/authValidation.ts` (Phase 2)

---

### PHASE 2: AUTHENTICATION SYSTEM

---

#### Step 10: `backend/src/validations/authValidation.ts`
**Purpose**: Validate incoming authentication requests using Zod.

**What to Do**:
1. Import Zod
2. Create `signupSchema` (email, password, username, firstName, lastName)
3. Create `signinSchema` (email, password)
4. Create `refreshTokenSchema` (refreshToken)
5. Export validation middleware functions

**Key Points**:
- Email: must be valid email format
- Password: minimum 8 characters, include strength requirements
- Username: alphanumeric + underscore, 3-30 characters
- First/Last name: 1-50 characters, optional
- Use Zod's `.refine()` for custom validations

**Validation Rules**:
- Email: valid format, lowercase
- Password: min 8 chars, at least one letter and one number
- Username: 3-30 chars, alphanumeric + underscore, no spaces
- Name fields: 1-50 chars, optional

**Crucial Parts**:
- ✅ Sanitize email (trim, lowercase)
- ✅ Validate password strength
- ✅ Check username format (no special chars except underscore)
- ✅ Return clear validation error messages

**Next File**: `backend/src/middleware/validate.ts`

---

#### Step 11: `backend/src/middleware/validate.ts`
**Purpose**: Generic validation middleware that uses Zod schemas.

**What to Do**:
1. Create `validate()` higher-order function
2. Accept Zod schema as parameter
3. Validate req.body against schema
4. Call next() if valid, return error if invalid
5. Format validation errors consistently

**Key Points**:
- Higher-order function (returns middleware)
- Validate request body
- Use Zod's error formatting
- Return 400 status for validation errors
- Include field-level error messages

**Usage Pattern**:
```typescript
router.post('/signup', validate(signupSchema), signup);
```

**Crucial Parts**:
- ✅ Validate before controller logic runs
- ✅ Return user-friendly error messages
- ✅ Include field names in error responses
- ✅ Handle async validation if needed

**Next File**: `backend/src/middleware/auth.ts`

---

#### Step 12: `backend/src/middleware/auth.ts`
**Purpose**: Protect routes by verifying JWT tokens and attaching user to request.

**What to Do**:
1. Create `protect` middleware
2. Extract token from Authorization header
3. Verify token using jwt utils
4. Fetch user from database
5. Attach user to req.user
6. Call next() if valid, return error if invalid

**Key Points**:
- Check for Authorization header
- Extract Bearer token
- Verify token signature and expiration
- Fetch user from database (ensure user still exists)
- Attach user to req (without password)
- Handle missing/invalid/expired tokens

**Middleware Flow**:
1. Check if Authorization header exists
2. Extract token (remove "Bearer " prefix)
3. Verify token (throws if invalid/expired)
4. Get user ID from token payload
5. Fetch user from database
6. Check if user exists
7. Attach user to req.user
8. Call next()

**Crucial Parts**:
- ✅ Always verify token signature
- ✅ Check if user still exists in database
- ✅ Handle token expiration gracefully
- ✅ Never attach password to req.user
- ✅ Return 401 for authentication failures

**Next File**: `backend/src/controllers/authController.ts`

---

#### Step 13: `backend/src/controllers/authController.ts`
**Purpose**: Handle authentication business logic (signup, signin, logout, refresh).

**What to Do**:
1. Implement `signup` controller
2. Implement `signin` controller
3. Implement `logout` controller (optional, for refresh token invalidation)
4. Implement `refreshToken` controller
5. Implement `checkUsername` controller
6. Use utilities (hash password, sign tokens, apiResponse)

**signup Controller**:
1. Hash password using bcrypt
2. Create user in database
3. Sign access and refresh tokens
4. Save refresh token to database (if using RefreshToken model)
5. Return tokens and user data (without password)

**signin Controller**:
1. Find user by email
2. Check if user exists
3. Compare password with bcrypt
4. Sign new tokens
5. Save refresh token
6. Return tokens and user data

**refreshToken Controller**:
1. Verify refresh token
2. Find refresh token in database
3. Check if token is valid/not revoked
4. Generate new access token
5. Return new access token

**checkUsername Controller**:
1. Check if username exists
2. Return availability status

**Key Points**:
- Use bcrypt for password hashing (12 rounds)
- Always hash passwords before storing
- Compare passwords securely
- Generate both access and refresh tokens
- Save refresh tokens to database
- Use apiResponse helpers for responses
- Handle errors with try-catch
- Use asyncHandler wrapper

**Crucial Parts**:
- ✅ Hash password with bcrypt (minimum 12 rounds)
- ✅ Never return password in response
- ✅ Handle duplicate email/username errors
- ✅ Generate refresh tokens for long-term sessions
- ✅ Validate user input before database operations
- ✅ Use transactions for multi-step operations (if needed)

**Next File**: `backend/src/routes/authRoutes.ts`

---

#### Step 14: `backend/src/routes/authRoutes.ts`
**Purpose**: Define authentication endpoints and connect them to controllers.

**What to Do**:
1. Import Express Router
2. Import controllers
3. Import validation middleware
4. Import rate limiting middleware
5. Define routes with appropriate HTTP methods
6. Apply middleware in correct order
7. Export router

**Route Definitions**:
```typescript
POST   /api/auth/signup       → signup (validate, rateLimit)
POST   /api/auth/signin       → signin (validate, rateLimit)
POST   /api/auth/refresh      → refreshToken (validate)
POST   /api/auth/logout       → logout (protect)
GET    /api/auth/check-username/:username → checkUsername
GET    /api/auth/me           → getCurrentUser (protect)
```

**Middleware Order**:
1. Rate limiting (if applicable)
2. Validation
3. Controller

**Key Points**:
- Use RESTful conventions
- Apply rate limiting to auth routes
- Use validation middleware
- Protect routes that require authentication
- Use appropriate HTTP methods (POST for mutations, GET for queries)

**Crucial Parts**:
- ✅ Apply rate limiting to signup/signin (prevent brute force)
- ✅ Use POST for signup/signin (credentials in body, not URL)
- ✅ Validate all inputs
- ✅ Protect /me endpoint with auth middleware

**Next File**: `backend/src/utils/fileUpload.ts` (Phase 3)

---

### PHASE 3: PROFILE SYSTEM

---

#### Step 15: `backend/src/utils/fileUpload.ts`
**Purpose**: Handle file uploads for profile pictures and cover images.

**What to Do**:
1. Configure multer for file uploads
2. Set up storage (memory or disk)
3. Configure file filters (image types, size limits)
4. Create upload middleware
5. Handle file validation
6. Optional: Upload to cloud storage (S3, Cloudinary)

**Key Points**:
- Use multer for file handling
- Limit file size (e.g., 5MB for images)
- Validate file types (only images: jpg, png, webp)
- Store files securely (cloud storage recommended)
- Generate unique filenames
- Handle upload errors

**Configuration**:
- Max file size: 5MB
- Allowed types: image/jpeg, image/png, image/webp
- Storage: memory (for cloud upload) or disk (for local)
- Generate unique filenames (UUID + timestamp)

**Crucial Parts**:
- ✅ Validate file type (prevent malicious uploads)
- ✅ Limit file size (prevent DoS)
- ✅ Generate unique filenames (prevent overwrites)
- ✅ Delete old files when updating
- ✅ Handle upload errors gracefully

**Next File**: `backend/src/validations/profileValidation.ts`

---

#### Step 16: `backend/src/validations/profileValidation.ts`
**Purpose**: Validate profile update requests.

**What to Do**:
1. Create `updateProfileSchema`
2. Define validation rules for all profile fields
3. Make all fields optional (partial updates)
4. Validate URLs (website, github, linkedin)
5. Validate bio length
6. Export validation middleware

**Validation Rules**:
- Bio: max 500 characters
- Location: max 100 characters
- Website/GitHub/LinkedIn: valid URL format
- All fields optional (for partial updates)

**Crucial Parts**:
- ✅ All fields optional (allow partial updates)
- ✅ Validate URL format
- ✅ Limit bio length
- ✅ Sanitize input (trim, etc.)

**Next File**: `backend/src/controllers/profileController.ts`

---

#### Step 17: `backend/src/controllers/profileController.ts`
**Purpose**: Handle profile-related business logic.

**What to Do**:
1. Implement `getProfile` (get current user's profile)
2. Implement `getProfileByUsername` (get any user's public profile)
3. Implement `updateProfile` (update current user's profile)
4. Implement `uploadProfilePicture` (upload profile picture)
5. Implement `uploadCoverPicture` (upload cover picture)

**getProfile Controller**:
- Use req.user.id (from auth middleware)
- Fetch user from database
- Exclude password
- Return user data

**getProfileByUsername Controller**:
- Get username from params
- Fetch user from database
- Return public profile (exclude sensitive data)
- Handle user not found

**updateProfile Controller**:
- Use req.user.id
- Update only provided fields (partial update)
- Validate data
- Update database
- Return updated user

**uploadProfilePicture Controller**:
- Use fileUpload middleware
- Get file from req.file
- Upload to cloud storage (or save locally)
- Update user's profilePicture field
- Delete old picture if exists
- Return updated user

**Key Points**:
- Use req.user from auth middleware
- Handle partial updates
- Exclude passwords from responses
- Handle file uploads
- Validate ownership (user can only update their own profile)

**Crucial Parts**:
- ✅ Always use req.user.id (from auth middleware)
- ✅ Validate user exists before operations
- ✅ Handle partial updates (only update provided fields)
- ✅ Delete old files when updating pictures
- ✅ Return consistent user object format

**Next File**: `backend/src/routes/profileRoutes.ts`

---

#### Step 18: `backend/src/routes/profileRoutes.ts`
**Purpose**: Define profile endpoints.

**What to Do**:
1. Import Router, controllers, middleware
2. Define routes
3. Apply middleware (protect for authenticated routes)
4. Export router

**Route Definitions**:
```typescript
GET    /api/profiles/me              → getProfile (protect)
GET    /api/profiles/:username       → getProfileByUsername
PATCH  /api/profiles/me              → updateProfile (protect, validate)
POST   /api/profiles/me/picture      → uploadProfilePicture (protect, fileUpload)
POST   /api/profiles/me/cover        → uploadCoverPicture (protect, fileUpload)
```

**Crucial Parts**:
- ✅ Protect routes that modify user data
- ✅ Use PATCH for updates (partial updates)
- ✅ Apply file upload middleware for picture routes

**Next File**: `backend/src/middleware/errorHandler.ts` (Phase 4)

---

### PHASE 4: MIDDLEWARE & ERROR HANDLING

---

#### Step 19: `backend/src/middleware/errorHandler.ts`
**Purpose**: Global error handling middleware (if not already in errors.ts).

**What to Do**:
1. Check if errorHandler is in errors.ts or separate file
2. If separate, import AppError and logger
3. Handle different error types
4. Format error responses
5. Log errors appropriately

**Note**: This might already be implemented in `errors.ts` as `globalErrorHandler`. If so, ensure it's comprehensive.

**Key Points**:
- Catch all errors
- Format consistently
- Log for debugging
- Don't expose sensitive info in production

**Next File**: `backend/src/middleware/rateLimit.ts`

---

#### Step 20: `backend/src/middleware/rateLimit.ts`
**Purpose**: Rate limiting to prevent abuse and DoS attacks.

**What to Do**:
1. Use express-rate-limit library
2. Create different rate limiters for different routes
3. Configure window and max requests
4. Apply to appropriate routes
5. Handle rate limit errors

**Rate Limiters**:
- Global: 100 requests / 15 minutes
- Auth routes: 20 requests / 15 minutes (stricter)
- Sensitive operations: 5 requests / 1 hour
- File uploads: 10 requests / 1 hour

**Key Points**:
- Different limits for different route types
- Stricter limits for auth routes
- Very strict for sensitive operations
- Return clear error messages

**Crucial Parts**:
- ✅ Apply stricter limits to auth routes
- ✅ Use different limits based on operation sensitivity
- ✅ Return 429 status code
- ✅ Include retry-after information

**Next File**: `backend/src/middleware/security.ts`

---

#### Step 21: `backend/src/middleware/security.ts`
**Purpose**: Additional security headers and request sanitization.

**What to Do**:
1. Set security HTTP headers
2. Sanitize request body and query params
3. Remove potentially dangerous characters
4. Configure CORS properly (in server.ts, but validate here)

**Security Headers**:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: restrict permissions

**Sanitization**:
- Remove HTML tags from strings
- Sanitize user input
- Prevent XSS attacks

**Crucial Parts**:
- ✅ Set all security headers
- ✅ Sanitize user input
- ✅ Remove HTML tags from strings
- ✅ Note: Helmet already handles most headers (check server.ts)

**Next File**: `backend/server.ts` (Final Step)

---

### PHASE 5: ENTRY POINT

---

#### Step 22: `backend/server.ts`
**Purpose**: Application entry point - sets up Express app and connects all pieces.

**What to Do**:
1. Import all dependencies
2. Initialize Express app
3. Connect to database (Prisma)
4. Load environment variables
5. Set up middleware (in order):
   - Logging (morgan)
   - Body parsers (express.json, express.urlencoded)
   - CORS
   - Security (helmet)
   - Rate limiting
   - Request logging
6. Mount routes
7. Add health check endpoint
8. Add 404 handler
9. Add global error handler
10. Start server
11. Handle graceful shutdown

**Middleware Order** (Critical):
```typescript
1. Logging (morgan)
2. Body parsers
3. CORS
4. Security (helmet)
5. Rate limiting
6. Routes
7. 404 handler
8. Global error handler
```

**Key Points**:
- Import all routes
- Apply middleware in correct order
- Set up error handling last
- Handle graceful shutdown (SIGTERM, SIGINT)
- Connect to database on startup
- Validate environment on startup

**Crucial Parts**:
- ✅ Middleware order matters (body parser before routes, error handler last)
- ✅ Handle graceful shutdown (close database connections)
- ✅ Validate environment variables on startup
- ✅ Health check endpoint for monitoring
- ✅ 404 handler catches unmatched routes
- ✅ Global error handler catches all errors
- ✅ Don't expose error details in production

**Server Startup**:
```typescript
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${NODE_ENV}`);
});
```

---

## ⚠️ Crucial Implementation Points

### 1. Password Security
- **ALWAYS** hash passwords with bcrypt (minimum 12 rounds)
- **NEVER** store passwords in plain text
- **NEVER** return passwords in API responses
- **ALWAYS** validate password strength on signup

### 2. JWT Token Management
- Use short-lived access tokens (15 minutes)
- Use long-lived refresh tokens (7 days)
- Store refresh tokens in database (for revocation)
- Verify token signature on every request
- Handle token expiration gracefully

### 3. Error Handling
- **ALWAYS** use try-catch in async controllers
- **ALWAYS** use asyncHandler wrapper
- **ALWAYS** return consistent error format
- **NEVER** expose stack traces in production
- **ALWAYS** log errors server-side

### 4. Database Operations
- **ALWAYS** use the exported prisma instance (singleton)
- **ALWAYS** handle Prisma errors (unique constraint, foreign key)
- **ALWAYS** validate data before database operations
- **ALWAYS** exclude passwords from query results
- Use transactions for multi-step operations

### 5. Authentication Flow
- **ALWAYS** verify tokens in auth middleware
- **ALWAYS** check if user exists after token verification
- **ALWAYS** attach user to req.user (without password)
- **ALWAYS** protect routes that modify data

### 6. Validation
- **ALWAYS** validate input before processing
- **ALWAYS** use Zod schemas for validation
- **ALWAYS** sanitize user input
- **ALWAYS** return clear validation error messages

### 7. File Uploads
- **ALWAYS** validate file types
- **ALWAYS** limit file sizes
- **ALWAYS** generate unique filenames
- **ALWAYS** delete old files when updating
- **ALWAYS** store files securely (cloud storage recommended)

### 8. Rate Limiting
- **ALWAYS** apply rate limiting to auth routes
- **ALWAYS** use stricter limits for sensitive operations
- **ALWAYS** return 429 status for rate limit errors

### 9. Environment Variables
- **ALWAYS** validate all environment variables on startup
- **ALWAYS** use typed environment variables
- **NEVER** hardcode secrets
- **NEVER** commit .env files

### 10. Response Format
- **ALWAYS** use apiResponse helpers
- **ALWAYS** return consistent response format
- **ALWAYS** exclude sensitive data
- **ALWAYS** include proper status codes

---

## ✅ Testing Checklist

After implementing each phase, test the following:

### Phase 1 (Foundation)
- [ ] Environment variables load correctly
- [ ] Database connection works
- [ ] Logger outputs correctly
- [ ] Error handler catches errors
- [ ] API responses are formatted correctly

### Phase 2 (Authentication)
- [ ] Signup creates user with hashed password
- [ ] Signin returns valid tokens
- [ ] Protected routes reject requests without tokens
- [ ] Protected routes accept valid tokens
- [ ] Refresh token generates new access token
- [ ] Username check endpoint works

### Phase 3 (Profile)
- [ ] Get profile returns user data (without password)
- [ ] Update profile works (partial updates)
- [ ] Profile picture upload works
- [ ] Cover picture upload works
- [ ] Users can only update their own profile

### Phase 4 (Middleware)
- [ ] Rate limiting works
- [ ] Security headers are set
- [ ] Input sanitization works
- [ ] Error handler catches all errors

### Phase 5 (Server)
- [ ] Server starts successfully
- [ ] All routes are accessible
- [ ] 404 handler works
- [ ] Health check endpoint works
- [ ] Graceful shutdown works

---

## 🎯 Quick Reference: File Dependencies

### What Each File Depends On:

```
schema.prisma
  └─> (nothing - foundation)

env.ts
  └─> dotenv, zod

database.ts
  └─> env.ts, @prisma/client

logger.ts
  └─> winston, env.ts

express.d.ts
  └─> @prisma/client

auth.ts (types)
  └─> (standalone types)

errors.ts
  └─> express

apiResponse.ts
  └─> express

jwt.ts
  └─> jsonwebtoken, env.ts, database.ts

authValidation.ts
  └─> zod

validate.ts
  └─> zod, express, apiResponse.ts

auth.ts (middleware)
  └─> express, jwt.ts, database.ts, errors.ts, env.ts

authController.ts
  └─> express, bcryptjs, jwt.ts, database.ts, apiResponse.ts, errors.ts

authRoutes.ts
  └─> express, authController.ts, validate.ts, authValidation.ts, rateLimit.ts

fileUpload.ts
  └─> multer, express

profileValidation.ts
  └─> zod

profileController.ts
  └─> express, database.ts, apiResponse.ts, fileUpload.ts, errors.ts

profileRoutes.ts
  └─> express, profileController.ts, validate.ts, profileValidation.ts, auth.ts (middleware)

errorHandler.ts
  └─> express, errors.ts, logger.ts

rateLimit.ts
  └─> express-rate-limit, express, apiResponse.ts

security.ts
  └─> express

server.ts
  └─> EVERYTHING (final assembly)
```

---

## 📚 Additional Resources

### Prisma Documentation
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

### Express Best Practices
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)

### JWT Best Practices
- [JWT.io](https://jwt.io/)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)

### TypeScript with Express
- [TypeScript Express Setup](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

---

## 🚨 Common Pitfalls to Avoid

1. **Creating multiple PrismaClient instances** - Always use singleton
2. **Not handling async errors** - Always use asyncHandler
3. **Exposing passwords in responses** - Always exclude from queries
4. **Not validating input** - Always validate before processing
5. **Weak password hashing** - Always use bcrypt with 12+ rounds
6. **Not handling Prisma errors** - Always catch unique constraint errors
7. **Incorrect middleware order** - Body parser before routes, error handler last
8. **Not sanitizing input** - Always sanitize user input
9. **Hardcoded secrets** - Always use environment variables
10. **Not testing error cases** - Test all error scenarios

---

## 🎓 Learning Path

Follow this implementation order to understand:
1. **Foundation** → How configuration and utilities work
2. **Authentication** → How security and token management works
3. **Protected Routes** → How middleware protects endpoints
4. **Content Management** → How CRUD operations work
5. **Error Handling** → How to handle errors gracefully

Each phase builds on the previous one, so don't skip ahead!

---

**Good luck with your implementation! 🚀**

Remember: Take it one file at a time, test as you go, and don't rush. The foundation you build now will support everything else.

