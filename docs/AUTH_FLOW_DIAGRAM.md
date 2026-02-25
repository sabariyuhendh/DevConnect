# Authentication Flow Diagrams

## Local Authentication Flow

```
┌─────────────┐
│   Frontend  │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. POST /api/auth/signup
       │    { email, password, username }
       │
       ▼
┌─────────────────────────────────────┐
│          Backend API                │
│                                     │
│  2. Validate input (Zod)           │
│  3. Check email/username unique    │
│  4. Hash password (bcrypt)         │
│  5. Create user in database        │
│  6. Generate JWT token             │
│                                     │
└──────────┬──────────────────────────┘
           │
           │ 7. Return { token, user }
           │
           ▼
┌─────────────────────────────────────┐
│          Frontend                   │
│                                     │
│  8. Store token in localStorage    │
│  9. Update auth context            │
│  10. Redirect to /feed             │
│                                     │
└─────────────────────────────────────┘
```

## GitHub OAuth Flow

```
┌─────────────┐
│   Frontend  │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Click "Continue with GitHub"
       │    Redirect to: /api/auth/github
       │
       ▼
┌─────────────────────────────────────┐
│          Backend API                │
│                                     │
│  2. Redirect to GitHub OAuth        │
│     with client_id & redirect_uri   │
│                                     │
└──────────┬──────────────────────────┘
           │
           │ 3. Redirect to GitHub
           │
           ▼
┌─────────────────────────────────────┐
│          GitHub                     │
│                                     │
│  4. User authorizes app             │
│  5. Redirect back with code         │
│                                     │
└──────────┬──────────────────────────┘
           │
           │ 6. GET /api/auth/github/callback?code=xxx
           │
           ▼
┌─────────────────────────────────────┐
│          Backend API                │
│                                     │
│  7. Exchange code for access token  │
│  8. Fetch user data from GitHub     │
│  9. Find or create user in DB       │
│  10. Generate JWT token             │
│  11. Redirect to frontend           │
│      /auth/callback?token=xxx       │
│                                     │
└──────────┬──────────────────────────┘
           │
           │ 12. Redirect with token
           │
           ▼
┌─────────────────────────────────────┐
│          Frontend                   │
│      /auth/callback                 │
│                                     │
│  13. Extract token from URL         │
│  14. Store in localStorage          │
│  15. Fetch user data with token     │
│  16. Update auth context            │
│  17. Redirect to /feed              │
│                                     │
└─────────────────────────────────────┘
```

## Google OAuth Flow

```
┌─────────────┐
│   Frontend  │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Click "Continue with Google"
       │    Redirect to: /api/auth/google
       │
       ▼
┌─────────────────────────────────────┐
│          Backend API                │
│                                     │
│  2. Redirect to Google OAuth        │
│     with client_id & redirect_uri   │
│                                     │
└──────────┬──────────────────────────┘
           │
           │ 3. Redirect to Google
           │
           ▼
┌─────────────────────────────────────┐
│          Google                     │
│                                     │
│  4. User authorizes app             │
│  5. Redirect back with code         │
│                                     │
└──────────┬──────────────────────────┘
           │
           │ 6. GET /api/auth/google/callback?code=xxx
           │
           ▼
┌─────────────────────────────────────┐
│          Backend API                │
│                                     │
│  7. Exchange code for access token  │
│  8. Fetch user data from Google     │
│  9. Find or create user in DB       │
│  10. Generate JWT token             │
│  11. Redirect to frontend           │
│      /auth/callback?token=xxx       │
│                                     │
└──────────┬──────────────────────────┘
           │
           │ 12. Redirect with token
           │
           ▼
┌─────────────────────────────────────┐
│          Frontend                   │
│      /auth/callback                 │
│                                     │
│  13. Extract token from URL         │
│  14. Store in localStorage          │
│  15. Fetch user data with token     │
│  16. Update auth context            │
│  17. Redirect to /feed              │
│                                     │
└─────────────────────────────────────┘
```

## Protected Route Access

```
┌─────────────┐
│   Frontend  │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. GET /api/profiles/me
       │    Headers: { Authorization: "Bearer <token>" }
       │
       ▼
┌─────────────────────────────────────┐
│          Backend API                │
│                                     │
│  2. Extract token from header       │
│  3. Verify JWT signature            │
│  4. Decode user ID from token       │
│  5. Fetch user from database        │
│                                     │
└──────────┬──────────────────────────┘
           │
           │ If valid:
           │ 6. Return user data
           │
           │ If invalid:
           │ 6. Return 401 Unauthorized
           │
           ▼
┌─────────────────────────────────────┐
│          Frontend                   │
│                                     │
│  7. Handle response                 │
│     - Success: Display data         │
│     - Error: Redirect to login      │
│                                     │
└─────────────────────────────────────┘
```

## User Profile Update Flow

```
┌─────────────┐
│   Frontend  │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. PUT /api/profiles/me
       │    Headers: { Authorization: "Bearer <token>" }
       │    Body: { bio, title, skills, ... }
       │
       ▼
┌─────────────────────────────────────┐
│          Backend API                │
│                                     │
│  2. Authenticate user (JWT)         │
│  3. Validate input (Zod schema)     │
│  4. Update user in database         │
│  5. Return updated user data        │
│                                     │
└──────────┬──────────────────────────┘
           │
           │ 6. Return { user, message }
           │
           ▼
┌─────────────────────────────────────┐
│          Frontend                   │
│                                     │
│  7. Update local state              │
│  8. Show success message            │
│  9. Refresh UI                      │
│                                     │
└─────────────────────────────────────┘
```

## Follow User Flow

```
┌─────────────┐
│   Frontend  │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. POST /api/profiles/:username/follow
       │    Headers: { Authorization: "Bearer <token>" }
       │
       ▼
┌─────────────────────────────────────┐
│          Backend API                │
│                                     │
│  2. Authenticate user (JWT)         │
│  3. Find target user by username    │
│  4. Check if already following      │
│  5. Create Follow record            │
│  6. Return success message          │
│                                     │
└──────────┬──────────────────────────┘
           │
           │ 7. Return { message }
           │
           ▼
┌─────────────────────────────────────┐
│          Frontend                   │
│                                     │
│  8. Update follow button state      │
│  9. Increment follower count        │
│  10. Show success notification      │
│                                     │
└─────────────────────────────────────┘
```

## Database Schema Relationships

```
┌─────────────────────────────────────┐
│              User                   │
├─────────────────────────────────────┤
│ id (PK)                             │
│ email (unique)                      │
│ username (unique)                   │
│ password (hashed)                   │
│ provider (local/github/google)      │
│ providerId                          │
│ firstName, lastName                 │
│ bio, title, company                 │
│ profilePicture, coverPicture        │
│ skills[], yearsOfExp                │
│ github, linkedin, twitter           │
│ isOnline, lastSeen                  │
│ profileViews                        │
│ preferences (JSON)                  │
│ createdAt, updatedAt                │
└──────────┬──────────────────────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────────────────────┐
│            Follow                   │
├─────────────────────────────────────┤
│ id (PK)                             │
│ followerId (FK → User.id)           │
│ followingId (FK → User.id)          │
│ createdAt                           │
│                                     │
│ Unique: (followerId, followingId)   │
└─────────────────────────────────────┘

User.followers ← Follow.followingId
User.following ← Follow.followerId
```

## Security Flow

```
┌─────────────────────────────────────┐
│         Password Security           │
├─────────────────────────────────────┤
│                                     │
│  Plain Password                     │
│       ↓                             │
│  bcrypt.hash(password, 12)          │
│       ↓                             │
│  Hashed Password                    │
│  (stored in database)               │
│                                     │
│  Login Attempt:                     │
│  bcrypt.compare(input, stored)      │
│       ↓                             │
│  Boolean (match/no match)           │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          JWT Token Flow             │
├─────────────────────────────────────┤
│                                     │
│  User Data { id, email }            │
│       ↓                             │
│  jwt.sign(data, secret, options)    │
│       ↓                             │
│  JWT Token                          │
│  (sent to frontend)                 │
│                                     │
│  Protected Request:                 │
│  jwt.verify(token, secret)          │
│       ↓                             │
│  Decoded User Data                  │
│                                     │
└─────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────┐
│          Request Flow               │
└──────────┬──────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │  Validation  │
    │   (Zod)      │
    └──────┬───────┘
           │
           ├─── Invalid ──→ 400 Bad Request
           │
           ▼ Valid
    ┌──────────────┐
    │ Auth Check   │
    │   (JWT)      │
    └──────┬───────┘
           │
           ├─── Invalid ──→ 401 Unauthorized
           │
           ▼ Valid
    ┌──────────────┐
    │  Business    │
    │   Logic      │
    └──────┬───────┘
           │
           ├─── Error ──→ 500 Internal Error
           │
           ▼ Success
    ┌──────────────┐
    │   Response   │
    │   200 OK     │
    └──────────────┘
```
