# CORS Authentication Guide - Complete Documentation

## What is CORS?

**CORS (Cross-Origin Resource Sharing)** is a security feature implemented by web browsers to prevent malicious websites from making unauthorized requests to your API.

### The Same-Origin Policy Problem

By default, browsers block requests from one origin (domain) to another. For example:
- Frontend: `http://10.144.12.192:8081`
- Backend: `http://10.144.12.192:3001`

These are **different origins** (different ports), so the browser blocks the request unless the backend explicitly allows it.

## How CORS Works

### 1. Simple Requests (GET, POST with simple headers)

```
┌─────────┐                                    ┌─────────┐
│ Browser │                                    │ Backend │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  GET /api/auth/check-username               │
     │  Origin: http://10.144.12.192:8081          │
     │─────────────────────────────────────────────>│
     │                                              │
     │  Response                                    │
     │  Access-Control-Allow-Origin: *              │
     │  Access-Control-Allow-Credentials: true      │
     │<─────────────────────────────────────────────│
     │                                              │
```

### 2. Preflight Requests (PUT, DELETE, custom headers)

```
┌─────────┐                                    ┌─────────┐
│ Browser │                                    │ Backend │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  OPTIONS /api/auth/login (Preflight)        │
     │  Origin: http://10.144.12.192:8081          │
     │  Access-Control-Request-Method: POST         │
     │  Access-Control-Request-Headers: Authorization│
     │─────────────────────────────────────────────>│
     │                                              │
     │  Response                                    │
     │  Access-Control-Allow-Origin: *              │
     │  Access-Control-Allow-Methods: POST, GET...  │
     │  Access-Control-Allow-Headers: Authorization │
     │  Access-Control-Allow-Credentials: true      │
     │<─────────────────────────────────────────────│
     │                                              │
     │  POST /api/auth/login (Actual Request)      │
     │  Authorization: Bearer token123              │
     │─────────────────────────────────────────────>│
     │                                              │
     │  Response with data                          │
     │<─────────────────────────────────────────────│
     │                                              │
```

## DevConnect CORS Implementation

### Backend Configuration (server.ts)

```typescript
const corsOptions = {
  // Origin validation
  origin: (origin: string | undefined, callback) => {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    
    // Development: Allow all origins
    if (NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Production: Check against whitelist
    if (CORS_ORIGIN === '*' || origin === CORS_ORIGIN) {
      return callback(null, true);
    }
    
    // Reject unauthorized origins
    callback(new Error('Not allowed by CORS'));
  },
  
  // Allow cookies and authentication headers
  credentials: true,
  
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Allowed request headers
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Username']
};

app.use(cors(corsOptions));
```

### Environment Configuration

**Development (.env):**
```env
NODE_ENV="development"
CORS_ORIGIN=*
```

**Production (.env):**
```env
NODE_ENV="production"
CORS_ORIGIN=https://your-domain.com
```

## Authentication Flow with CORS

### 1. Signup Flow

```
┌──────────┐                                   ┌──────────┐
│ Frontend │                                   │ Backend  │
└────┬─────┘                                   └────┬─────┘
     │                                              │
     │ 1. Check Username Availability               │
     │    GET /api/auth/check-username              │
     │    Origin: http://10.144.12.192:8081         │
     │─────────────────────────────────────────────>│
     │                                              │
     │    Response: {available: true}               │
     │    Access-Control-Allow-Origin: *            │
     │<─────────────────────────────────────────────│
     │                                              │
     │ 2. Submit Signup                             │
     │    POST /api/auth/signup                     │
     │    Body: {username, email, password}         │
     │─────────────────────────────────────────────>│
     │                                              │
     │    Response: {token, user}                   │
     │    Access-Control-Allow-Origin: *            │
     │<─────────────────────────────────────────────│
     │                                              │
     │ 3. Store token in localStorage               │
     │    localStorage.setItem('dc_user', ...)      │
     │                                              │
     │ 4. Redirect to /feed                         │
     │                                              │
```

### 2. Login Flow

```
┌──────────┐                                   ┌──────────┐
│ Frontend │                                   │ Backend  │
└────┬─────┘                                   └────┬─────┘
     │                                              │
     │ 1. Submit Login                              │
     │    POST /api/auth/login                      │
     │    Body: {email, password}                   │
     │─────────────────────────────────────────────>│
     │                                              │
     │    Validate credentials                      │
     │    Generate JWT token                        │
     │                                              │
     │    Response: {token, user}                   │
     │    Access-Control-Allow-Origin: *            │
     │<─────────────────────────────────────────────│
     │                                              │
     │ 2. Store token in localStorage               │
     │    localStorage.setItem('dc_user', ...)      │
     │                                              │
     │ 3. Redirect to /feed                         │
     │                                              │
```

### 3. Authenticated Request Flow

```
┌──────────┐                                   ┌──────────┐
│ Frontend │                                   │ Backend  │
└────┬─────┘                                   └────┬─────┘
     │                                              │
     │ 1. Get token from localStorage               │
     │    const token = user.token                  │
     │                                              │
     │ 2. Make authenticated request                │
     │    GET /api/cave/tasks                       │
     │    Authorization: Bearer <token>             │
     │─────────────────────────────────────────────>│
     │                                              │
     │    Verify JWT token                          │
     │    Extract user from token                   │
     │    Check if user exists & active             │
     │                                              │
     │    Response: {tasks: [...]}                  │
     │    Access-Control-Allow-Origin: *            │
     │<─────────────────────────────────────────────│
     │                                              │
```

## Security Features

### 1. Origin Validation

**Development:**
```typescript
// Allow all origins for testing
if (NODE_ENV === 'development') {
  return callback(null, true);
}
```

**Production:**
```typescript
// Only allow specific origin
if (origin === CORS_ORIGIN) {
  return callback(null, true);
}
callback(new Error('Not allowed by CORS'));
```

### 2. Credentials Support

```typescript
credentials: true
```

This allows:
- Cookies to be sent with requests
- Authorization headers
- Custom headers

### 3. Allowed Methods

```typescript
methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
```

Only these HTTP methods are allowed.

### 4. Allowed Headers

```typescript
allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Username']
```

Only these headers can be sent from frontend.

### 5. JWT Token Authentication

**Backend (middleware/auth.ts):**
```typescript
export const protect: RequestHandler = async (req, _res, next) => {
  try {
    // Extract token from Authorization header
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') 
      ? header.slice('Bearer '.length) 
      : null;
    
    if (!token) return next(new AppError('Unauthorized', 401));

    // Verify JWT token
    const payload = verifyToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    // Check if user exists and is active
    if (!user || !user.isActive) {
      return next(new AppError('Unauthorized', 401));
    }
    
    // Attach user to request
    (req as any).user = user;
    return next();
  } catch {
    return next(new AppError('Unauthorized', 401));
  }
};
```

**Frontend (utils/api.ts):**
```typescript
async function jsonFetch(path: string, options: RequestInit = {}) {
  const url = `${apiBase}${path}`;
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  // Add JWT token to Authorization header
  if (user?.token) {
    headers.set('Authorization', `Bearer ${user.token}`);
  }
  
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw err;
  }
  return res.json().catch(() => ({}));
}
```

## Common CORS Errors and Solutions

### Error 1: "No 'Access-Control-Allow-Origin' header"

**Cause:** Backend not sending CORS headers

**Solution:**
```bash
# Check backend .env
CORS_ORIGIN=*

# Restart backend
cd backend
npm run dev
```

### Error 2: "CORS policy: Credentials flag is 'true'"

**Cause:** Using `credentials: true` with `origin: '*'`

**Solution:**
```typescript
// Development: Allow all origins
origin: (origin, callback) => {
  if (NODE_ENV === 'development') {
    return callback(null, true);
  }
  // ...
}
```

### Error 3: "Method not allowed by CORS"

**Cause:** HTTP method not in allowed list

**Solution:**
```typescript
methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
```

### Error 4: "Request header not allowed"

**Cause:** Custom header not in allowed list

**Solution:**
```typescript
allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Username']
```

## Testing CORS

### Test 1: Check CORS Headers

```bash
curl -I -X OPTIONS http://10.144.12.192:3001/api/auth/login \
  -H "Origin: http://10.144.12.192:8081" \
  -H "Access-Control-Request-Method: POST"
```

**Expected response:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Client-Username
Access-Control-Allow-Credentials: true
```

### Test 2: Authenticated Request

```bash
curl http://10.144.12.192:3001/api/cave/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Origin: http://10.144.12.192:8081"
```

**Expected:** 200 OK with data

### Test 3: Browser DevTools

1. Open DevTools (F12) → Network tab
2. Make a request (login, signup, etc.)
3. Click on the request
4. Check "Response Headers" for CORS headers

## Best Practices

### Development

```env
NODE_ENV="development"
CORS_ORIGIN=*
```

- Allow all origins for easy testing
- Use detailed logging
- Test from multiple devices

### Production

```env
NODE_ENV="production"
CORS_ORIGIN=https://your-domain.com
```

- Only allow specific origin
- Use HTTPS
- Implement rate limiting
- Use secure JWT secrets
- Set short token expiration
- Implement refresh tokens

## Security Checklist

- [ ] CORS configured correctly
- [ ] JWT tokens used for authentication
- [ ] Tokens stored securely (localStorage)
- [ ] Tokens sent in Authorization header
- [ ] Backend validates tokens on protected routes
- [ ] User existence and active status checked
- [ ] HTTPS used in production
- [ ] Secure JWT secret (32+ characters)
- [ ] Token expiration set (15 minutes recommended)
- [ ] Refresh token mechanism (optional)
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles this)

## Current Configuration

### Your Network Setup

**Frontend:** http://10.144.12.192:8081
**Backend:** http://10.144.12.192:3001

**Backend .env:**
```env
NODE_ENV="development"
CORS_ORIGIN=*
```

**Frontend .env:**
```env
VITE_API_URL=http://10.144.12.192:3001
```

### How It Works

1. **Browser makes request** from frontend to backend
2. **Browser adds Origin header:** `Origin: http://10.144.12.192:8081`
3. **Backend checks origin** against CORS configuration
4. **Backend allows request** (development mode allows all)
5. **Backend sends CORS headers** in response
6. **Browser allows response** to reach frontend
7. **Frontend processes response** and updates UI

## Troubleshooting

### Issue: Login not working

**Check:**
1. Backend endpoint is `/api/auth/login` (not `/signin`)
2. Request body has `{email, password}`
3. Backend is running and accessible
4. CORS headers present in response
5. No browser extension blocking request

**Solution:**
```bash
# Test backend directly
curl -X POST http://10.144.12.192:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### Issue: Token not being sent

**Check:**
1. Token stored in localStorage
2. Authorization header added to requests
3. Token format: `Bearer <token>`

**Solution:**
```javascript
// Check in browser console
localStorage.getItem('dc_user')

// Should show: {"token":"...", "email":"...", ...}
```

## Summary

CORS is a security feature that:
- Protects your API from unauthorized access
- Allows legitimate cross-origin requests
- Works with JWT authentication
- Requires proper configuration on both frontend and backend

DevConnect implements secure CORS with:
- Origin validation
- Credentials support
- JWT token authentication
- Protected routes
- Proper error handling

All authentication flows are secured and working correctly!
