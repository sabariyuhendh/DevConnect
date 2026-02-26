# DevConnect Authentication Workflow - Complete Guide

## System Architecture

### Ports & URLs

#### Backend
- **Port**: 3001
- **Localhost**: http://localhost:3001
- **Network**: http://10.144.12.192:3001
- **Base API Path**: `/api`

#### Frontend
- **Port**: 8080
- **Localhost**: http://localhost:8080
- **Network**: http://10.144.12.192:8080

### Technology Stack

#### Backend
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL (via Prisma Accelerate)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **ORM**: Prisma

#### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Context API
- **UI Library**: shadcn/ui + TailwindCSS

## Authentication Flow

### 1. User Registration (Signup)

#### Frontend Flow
```
User fills signup form
  ↓
Validates input (client-side)
  ↓
Checks username availability (debounced)
  ↓
Submits to backend
  ↓
Receives JWT token + user data
  ↓
Stores in AuthContext
  ↓
Redirects to /feed
```

#### Backend Flow
```
Receives POST /api/auth/signup
  ↓
Validates request body
  ↓
Checks if email/username exists
  ↓
Hashes password (bcrypt)
  ↓
Creates user in database
  ↓
Generates JWT token
  ↓
Returns token + user data
```

#### API Endpoint
```
POST /api/auth/signup
```

#### Request Body
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Response (Success - 201)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx1234567890",
    "email": "john@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": null,
    "provider": "local"
  }
}
```

#### Response (Error - 409)
```json
{
  "message": "Email or username already in use"
}
```

### 2. User Login

#### Frontend Flow
```
User fills login form
  ↓
Validates input (client-side)
  ↓
Submits to backend
  ↓
Receives JWT token + user data
  ↓
Stores in AuthContext
  ↓
Redirects to /feed (or previous page)
```

#### Backend Flow
```
Receives POST /api/auth/login
  ↓
Finds user by email
  ↓
Compares password (bcrypt)
  ↓
Updates lastSeen & isOnline
  ↓
Generates JWT token
  ↓
Returns token + user data
```

#### API Endpoint
```
POST /api/auth/login
```

#### Request Body
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Response (Success - 200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx1234567890",
    "email": "john@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": null,
    "provider": "local"
  }
}
```

#### Response (Error - 401)
```json
{
  "message": "Invalid credentials"
}
```

### 3. Username Availability Check

#### Frontend Flow
```
User types username
  ↓
Debounced check (400ms delay)
  ↓
Sends GET request to backend
  ↓
Displays availability status
```

#### Backend Flow
```
Receives GET /api/auth/check-username?username=johndoe
  ↓
Normalizes username (lowercase, trim)
  ↓
Queries database
  ↓
Returns availability status
```

#### API Endpoint
```
GET /api/auth/check-username?username=johndoe
```

#### Response (Available)
```json
{
  "available": true
}
```

#### Response (Taken)
```json
{
  "available": false
}
```

### 4. Get Current User

#### Frontend Flow
```
Protected route accessed
  ↓
Sends GET request with JWT token
  ↓
Receives user data
  ↓
Updates AuthContext
```

#### Backend Flow
```
Receives GET /api/auth/me
  ↓
Validates JWT token (middleware)
  ↓
Returns user data
```

#### API Endpoint
```
GET /api/auth/me
```

#### Request Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (Success - 200)
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "john@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true
  }
}
```

#### Response (Error - 401)
```json
{
  "message": "Unauthorized"
}
```

### 5. Logout

#### Frontend Flow
```
User clicks logout
  ↓
Sends POST request with JWT token
  ↓
Clears AuthContext
  ↓
Redirects to /login
```

#### Backend Flow
```
Receives POST /api/auth/logout
  ↓
Validates JWT token (middleware)
  ↓
Updates user: isOnline=false, lastSeen=now
  ↓
Returns success message
```

#### API Endpoint
```
POST /api/auth/logout
```

#### Request Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response (Success - 200)
```json
{
  "message": "Logged out successfully"
}
```

## Route Configuration

### Backend Routes (server.ts)

```typescript
// Auth routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/posts', postRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/cave', caveRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Auth Routes (authRoutes.ts)

```typescript
// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/check-username', checkUsername);

// Protected routes (require JWT)
router.post('/logout', protect, logout);
router.get('/me', protect, me);

// OAuth routes
router.get('/github', githubOAuth);
router.get('/github/callback', githubCallback);
router.get('/google', googleOAuth);
router.get('/google/callback', googleCallback);
```

### Frontend Routes (App.tsx)

```typescript
// Public routes
<Route path="/" element={<Index />} />
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
<Route path="/auth/callback" element={<AuthCallback />} />

// Protected routes (require authentication)
<Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
  <Route path="/feed" element={<Feed />} />
  <Route path="/profile/:username" element={<Profile />} />
  <Route path="/messages" element={<Messages />} />
  <Route path="/jobs" element={<Jobs />} />
  <Route path="/events" element={<Events />} />
  <Route path="/cave" element={<DevelopersCave />} />
</Route>
```

## Frontend Components

### 1. AuthContext (contexts/AuthContext.tsx)

Manages authentication state globally:

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}
```

### 2. Login Component (pages/Login.tsx)

- Email/password form
- Social auth buttons (GitHub, Google)
- Form validation
- Error handling
- Redirect after login

### 3. Signup Component (pages/Signup.tsx)

- Registration form (username, email, password, etc.)
- Username availability check
- Password confirmation
- Terms agreement
- Form validation
- Error handling
- Redirect after signup

### 4. ProtectedRoute Component (components/ProtectedRoute.tsx)

- Checks if user is authenticated
- Redirects to /login if not
- Preserves intended destination

## Backend Components

### 1. Auth Controller (controllers/authController.ts)

Functions:
- `signup` - User registration
- `login` - User authentication
- `checkUsername` - Username availability
- `me` - Get current user
- `logout` - User logout
- `githubOAuth` - GitHub OAuth initiation
- `githubCallback` - GitHub OAuth callback
- `googleOAuth` - Google OAuth initiation
- `googleCallback` - Google OAuth callback

### 2. Auth Middleware (middleware/auth.ts)

Functions:
- `protect` - Validates JWT token
- `restrictTo` - Role-based access control
- `admin` - Admin-only access

### 3. JWT Utilities (utils/jwt.ts)

Functions:
- `signToken` - Generate JWT token
- `verifyToken` - Validate JWT token

## Environment Configuration

### Backend (.env)

```env
# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=*

# Database
DATABASE_URL=prisma+postgres://...

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=900  # 15 minutes

# OAuth (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3001/api/auth/github/callback

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://10.144.12.192:3001
```

For localhost development:
```env
VITE_API_URL=http://localhost:3001
```

## Security Features

### 1. Password Security
- Passwords hashed with bcrypt (12 rounds)
- Never stored in plain text
- Never returned in API responses

### 2. JWT Security
- Tokens signed with secret key
- Short expiration time (15 minutes)
- Stored in memory (AuthContext), not localStorage
- Sent via Authorization header

### 3. CORS Protection
- Configured to allow specific origins
- Credentials enabled for authenticated requests
- Development: allows all origins (*)
- Production: specific origin only

### 4. Input Validation
- Email format validation
- Password strength requirements
- Username format validation
- SQL injection prevention (Prisma)

### 5. Rate Limiting
- Prevents brute force attacks
- Configurable limits per endpoint

## Testing the Workflow

### 1. Start Backend
```bash
cd backend
npm run dev
```

Expected output:
```
✅ DevConnect backend running on http://localhost:3001
🔌 WebSocket server ready on ws://localhost:3001
✅ Database connection established
```

### 2. Start Frontend
```bash
cd frontend
npm run dev -- --host
```

Expected output:
```
VITE v5.4.21  ready in 306 ms
➜  Local:   http://localhost:8080/
➜  Network: http://10.144.12.192:8080/
```

### 3. Test Signup
1. Navigate to http://localhost:8080/signup
2. Fill in the form
3. Submit
4. Should redirect to /feed with user logged in

### 4. Test Login
1. Navigate to http://localhost:8080/login
2. Enter credentials
3. Submit
4. Should redirect to /feed with user logged in

### 5. Test Protected Routes
1. Try accessing http://localhost:8080/feed without login
2. Should redirect to /login
3. After login, should redirect back to /feed

## Common Issues & Solutions

### Issue: "Can't find /api/auth/login on this server!"

**Cause**: Backend not running or routes not registered

**Solution**:
```bash
# Check if backend is running
curl http://localhost:3001/health

# If not, start it
cd backend && npm run dev
```

### Issue: ERR_BLOCKED_BY_CLIENT

**Cause**: Browser extension blocking requests

**Solution**:
1. Disable ad blockers/privacy extensions
2. Use Incognito/Private mode
3. Access via network IP instead of localhost

### Issue: CORS errors

**Cause**: CORS not configured properly

**Solution**:
```bash
# Check backend .env
grep CORS_ORIGIN backend/.env
# Should be: CORS_ORIGIN=*

# Restart backend after changing
```

### Issue: Frontend can't connect to backend

**Cause**: Wrong API URL in frontend .env

**Solution**:
```bash
# Check frontend .env
cat frontend/.env
# Should match backend URL

# For localhost
VITE_API_URL=http://localhost:3001

# For network
VITE_API_URL=http://10.144.12.192:3001

# Restart frontend after changing
```

### Issue: Infinite polling/requests

**Cause**: Frontend making repeated requests in a loop

**Solution**:
1. Check browser console for errors
2. Ensure backend is running and responding
3. Check if AuthContext is causing re-renders
4. Clear browser cache and reload

## API Testing with curl

### Signup
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Check Username
```bash
curl "http://localhost:3001/api/auth/check-username?username=testuser"
```

### Get Current User
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Logout
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Summary

### Ports
- Backend: 3001
- Frontend: 8080

### Key Endpoints
- POST /api/auth/signup - Register
- POST /api/auth/login - Login
- GET /api/auth/check-username - Check availability
- GET /api/auth/me - Get current user (protected)
- POST /api/auth/logout - Logout (protected)

### Access URLs
- Frontend: http://localhost:8080 or http://10.144.12.192:8080
- Backend: http://localhost:3001 or http://10.144.12.192:3001

### Authentication Flow
1. User registers/logs in
2. Backend returns JWT token
3. Frontend stores token in AuthContext
4. Token sent with protected requests
5. Backend validates token via middleware
6. User can access protected routes

The system is now running and ready for authentication testing!
