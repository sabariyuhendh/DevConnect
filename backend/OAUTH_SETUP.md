# OAuth Setup Guide

## GitHub OAuth Setup

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the details:
   - **Application name:** DevConnect (or your app name)
   - **Homepage URL:** `http://localhost:5173` (or your frontend URL)
   - **Authorization callback URL:** `http://localhost:3001/api/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID**
6. Click "Generate a new client secret" and copy the **Client Secret**

### 2. Update Environment Variables

Add to `backend/.env`:
```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:3001/api/auth/github/callback
```

### 3. Production Setup

For production:
1. Create a new OAuth App with production URLs
2. Set Authorization callback URL to: `https://yourdomain.com/api/auth/github/callback`
3. Update environment variables in production

---

## Google OAuth Setup

### 1. Create Google OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API" (if not already enabled)
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Configure OAuth consent screen if prompted:
   - User Type: External
   - App name: DevConnect
   - User support email: your email
   - Developer contact: your email
6. Create OAuth client ID:
   - Application type: Web application
   - Name: DevConnect
   - Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`
7. Copy the **Client ID** and **Client Secret**

### 2. Update Environment Variables

Add to `backend/.env`:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

### 3. Production Setup

For production:
1. Add production redirect URI: `https://yourdomain.com/api/auth/google/callback`
2. Update environment variables in production
3. Verify OAuth consent screen is published

---

## Testing OAuth Locally

### Option 1: Using localhost (Recommended for Development)

Both GitHub and Google support `localhost` redirect URIs, so you can test directly:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Click "Continue with GitHub" or "Continue with Google"
4. Authorize the app
5. You'll be redirected back to your app

### Option 2: Using ngrok (For Public URLs)

If you need a public URL for testing:

1. Install [ngrok](https://ngrok.com/)
2. Start your backend: `npm run dev`
3. In another terminal: `ngrok http 3001`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Update OAuth app redirect URIs:
   - GitHub: `https://abc123.ngrok.io/api/auth/github/callback`
   - Google: `https://abc123.ngrok.io/api/auth/google/callback`
6. Update `.env`:
   ```env
   GITHUB_REDIRECT_URI=https://abc123.ngrok.io/api/auth/github/callback
   GOOGLE_REDIRECT_URI=https://abc123.ngrok.io/api/auth/google/callback
   ```

---

## Frontend Integration

### 1. Add OAuth Callback Route

Add to your router (e.g., `App.tsx`):
```tsx
import AuthCallback from './pages/AuthCallback';

// In your routes:
<Route path="/auth/callback" element={<AuthCallback />} />
```

### 2. Use Social Auth Buttons

```tsx
import SocialAuthButtons from './components/SocialAuthButtons';

// In your login/signup page:
<SocialAuthButtons />
```

### 3. Handle Token Storage

The `AuthCallback` component automatically:
1. Extracts token from URL
2. Stores it in localStorage
3. Fetches user data
4. Redirects to main app

---

## Security Best Practices

1. **Never commit secrets:** Keep `.env` in `.gitignore`
2. **Use HTTPS in production:** OAuth requires HTTPS for security
3. **Rotate secrets regularly:** Change client secrets periodically
4. **Limit OAuth scopes:** Only request necessary permissions
5. **Validate redirect URIs:** Ensure they match exactly
6. **Use state parameter:** Prevent CSRF attacks (implement if needed)

---

## Troubleshooting

### "redirect_uri_mismatch" Error

- Ensure redirect URI in OAuth app matches exactly (including protocol, port, path)
- Check for trailing slashes
- Verify environment variables are loaded correctly

### "invalid_client" Error

- Check client ID and secret are correct
- Ensure no extra spaces in environment variables
- Verify OAuth app is active

### User Not Created

- Check backend logs for errors
- Verify database connection
- Ensure Prisma schema is up to date: `npx prisma generate`

### Token Not Received

- Check browser console for errors
- Verify frontend URL in backend `.env` (`FRONTEND_URL`)
- Ensure CORS is configured correctly

---

## Environment Variables Summary

Complete `.env` file for OAuth:

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=your_database_url

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=900

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3001/api/auth/github/callback

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```
