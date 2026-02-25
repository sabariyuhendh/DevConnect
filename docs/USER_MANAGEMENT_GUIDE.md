# User Management & Authentication Guide

## Overview
This guide covers the complete user management system including authentication, profiles, and OAuth integration.

## Database Schema

### User Model
The User model includes comprehensive profile fields:

**Authentication Fields:**
- `id`: Unique identifier (CUID)
- `email`: Unique email address
- `username`: Unique username
- `password`: Hashed password (null for OAuth users)
- `provider`: Authentication provider ("local", "google", "github")
- `providerId`: OAuth provider user ID
- `emailVerified`: Email verification status
- `isVerified`: Account verification status

**Profile Fields:**
- `firstName`, `lastName`: User's name
- `bio`: User biography (text)
- `title`: Job title
- `company`: Company name
- `location`: Geographic location
- `website`: Personal website URL
- `github`: GitHub username
- `linkedin`: LinkedIn profile URL
- `twitter`: Twitter handle
- `phone`: Phone number
- `profilePicture`: Avatar URL
- `coverPicture`: Cover/banner image URL

**Professional Details:**
- `skills`: Array of skills
- `yearsOfExp`: Years of experience (integer)
- `availability`: "available" | "not-available" | "open-to-offers"

**Settings:**
- `timezone`: User timezone (default: "UTC")
- `locale`: User locale (default: "en")
- `preferences`: JSON object for user preferences

**Status:**
- `isActive`: Account active status
- `isOnline`: Current online status
- `lastSeen`: Last activity timestamp
- `profileViews`: Profile view count

## Authentication Endpoints

### Local Authentication

#### POST /api/auth/signup
Create a new account with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": null,
    "provider": "local"
  }
}
```

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as signup

#### GET /api/auth/me
Get current authenticated user (requires Bearer token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "johndoe",
    // ... all user fields
  }
}
```

#### POST /api/auth/logout
Logout current user (requires Bearer token).

#### GET /api/auth/check-username
Check if username is available.

**Query Parameters:**
- `username`: Username to check

**Response:**
```json
{
  "available": true
}
```

### OAuth Authentication

#### GitHub OAuth

**Initiate:** GET /api/auth/github
- Redirects to GitHub authorization page

**Callback:** GET /api/auth/github/callback
- Handles GitHub callback
- Creates or links user account
- Redirects to frontend with token: `{FRONTEND_URL}/auth/callback?token={jwt_token}`

**Environment Variables Required:**
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3001/api/auth/github/callback
```

**Setup GitHub OAuth App:**
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL to: `http://localhost:3001/api/auth/github/callback`
4. Copy Client ID and Client Secret to .env

#### Google OAuth

**Initiate:** GET /api/auth/google
- Redirects to Google authorization page

**Callback:** GET /api/auth/google/callback
- Handles Google callback
- Creates or links user account
- Redirects to frontend with token

**Environment Variables Required:**
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

**Setup Google OAuth:**
1. Go to Google Cloud Console
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
4. Copy Client ID and Client Secret to .env

## Profile Endpoints

### GET /api/profiles/me
Get current user's full profile (protected).

### PUT /api/profiles/me
Update current user's profile (protected).

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Full-stack developer passionate about React and Node.js",
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "website": "https://johndoe.com",
  "github": "johndoe",
  "linkedin": "https://linkedin.com/in/johndoe",
  "twitter": "johndoe",
  "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
  "yearsOfExp": 5,
  "availability": "open-to-offers",
  "timezone": "America/Los_Angeles",
  "locale": "en"
}
```

### PUT /api/profiles/me/picture
Update profile picture (protected).

**Request Body:**
```json
{
  "profilePicture": "https://example.com/avatar.jpg"
}
```

### PUT /api/profiles/me/cover
Update cover picture (protected).

**Request Body:**
```json
{
  "coverPicture": "https://example.com/cover.jpg"
}
```

### PUT /api/profiles/me/preferences
Update user preferences (protected).

**Request Body:**
```json
{
  "preferences": {
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    },
    "privacy": {
      "profileVisibility": "public",
      "showEmail": false,
      "showPhone": false
    },
    "theme": {
      "mode": "dark",
      "accentColor": "#3b82f6"
    }
  }
}
```

### GET /api/profiles/:username
Get user profile by username (public).

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Full-stack developer...",
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "profilePicture": "https://...",
    "coverPicture": "https://...",
    "skills": ["JavaScript", "React"],
    "isOnline": true,
    "lastSeen": "2024-01-15T10:30:00Z",
    "profileViews": 150,
    "createdAt": "2023-01-01T00:00:00Z",
    "isFollowing": false,
    "followersCount": 250,
    "followingCount": 180,
    "postsCount": 45
  }
}
```

### POST /api/profiles/:username/follow
Follow a user (protected).

### DELETE /api/profiles/:username/follow
Unfollow a user (protected).

### GET /api/profiles/:username/followers
Get user's followers.

### GET /api/profiles/:username/following
Get users that the user follows.

### GET /api/profiles/search
Search users.

**Query Parameters:**
- `q`: Search query (required)
- `limit`: Results limit (default: 20)

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "profilePicture": "https://...",
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "isOnline": true
    }
  ]
}
```

## Frontend Integration

### OAuth Flow

1. User clicks "Continue with GitHub" or "Continue with Google"
2. Frontend redirects to backend OAuth endpoint
3. Backend redirects to OAuth provider
4. User authorizes on provider's site
5. Provider redirects back to backend callback
6. Backend creates/updates user and generates JWT
7. Backend redirects to frontend: `/auth/callback?token={jwt}`
8. Frontend stores token and fetches user data
9. Frontend redirects to main app

### Auth Context

The frontend should maintain an auth context with:
- Current user data
- JWT token
- Login/logout functions
- OAuth redirect handlers

### Protected Routes

Use the JWT token in Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Security Considerations

1. **Password Hashing:** Passwords are hashed with bcrypt (12 rounds)
2. **JWT Tokens:** Short-lived tokens (15 minutes by default)
3. **OAuth Security:** Client secrets stored in environment variables
4. **Input Validation:** All inputs validated with Zod schemas
5. **Rate Limiting:** Implement rate limiting on auth endpoints
6. **HTTPS:** Always use HTTPS in production

## Database Migration

After updating the schema, run:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name add_user_profile_enhancements
```

## Testing OAuth Locally

1. Set up OAuth apps on GitHub/Google
2. Add credentials to `.env`
3. Use ngrok or similar for public callback URL in development
4. Update redirect URIs in OAuth app settings

## Next Steps

1. Implement email verification
2. Add password reset functionality
3. Implement refresh tokens
4. Add two-factor authentication
5. Implement session management
6. Add user blocking/reporting
7. Implement profile privacy settings
