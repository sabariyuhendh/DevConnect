# Quick Start Guide - User Management & Authentication

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend (if needed)
cd ../frontend
npm install
```

### Step 2: Configure Environment

Edit `backend/.env` and add your OAuth credentials:

```env
# Required for OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Don't have OAuth credentials yet?** That's okay! Local authentication (email/password) works without them.

### Step 3: Generate Prisma Client
```bash
cd backend
npx prisma generate
```

### Step 4: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Test It Out

1. Open browser to `http://localhost:5173`
2. Go to `/signup` to create an account
3. Try logging in with your credentials
4. Test OAuth by clicking "Continue with GitHub" (if configured)

## 🎯 What's Working Now

### ✅ Authentication
- Email/password signup and login
- GitHub OAuth (when configured)
- Google OAuth (when configured)
- JWT token-based authentication
- Username availability checking

### ✅ User Profiles
- Comprehensive profile fields
- Profile pictures and cover images
- Skills, experience, and availability
- Social links (GitHub, LinkedIn, Twitter)
- User preferences

### ✅ Social Features
- Follow/unfollow users
- View followers and following lists
- Search users
- Profile view tracking
- Online status

## 📝 Quick API Test

### Create Account
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "username": "testuser",
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
    "password": "Test123!"
  }'
```

Save the token from the response!

### Get Your Profile
```bash
curl http://localhost:3001/api/profiles/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Setting Up OAuth (Optional)

### GitHub OAuth
1. Go to https://github.com/settings/developers
2. Create new OAuth App
3. Set callback URL: `http://localhost:3001/api/auth/github/callback`
4. Copy Client ID and Secret to `.env`

### Google OAuth
1. Go to https://console.cloud.google.com/
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `http://localhost:3001/api/auth/google/callback`
4. Copy Client ID and Secret to `.env`

**Full instructions:** See `backend/OAUTH_SETUP.md`

## 📚 Documentation

- **Complete API Docs:** `docs/USER_MANAGEMENT_GUIDE.md`
- **OAuth Setup:** `backend/OAUTH_SETUP.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`

## 🐛 Troubleshooting

**Backend won't start:**
- Check if port 3001 is available
- Verify DATABASE_URL in .env
- Run `npx prisma generate`

**OAuth not working:**
- Verify credentials in .env
- Check redirect URIs match exactly
- See `backend/OAUTH_SETUP.md`

**Can't create user:**
- Check database connection
- Verify Prisma client is generated
- Check backend console for errors

## 🎉 You're All Set!

The user management system is now fully functional with:
- ✅ Local authentication
- ✅ OAuth support (GitHub & Google)
- ✅ Comprehensive user profiles
- ✅ Social features (follow, search)
- ✅ Secure JWT authentication

**Next:** Start building your features on top of this foundation!
