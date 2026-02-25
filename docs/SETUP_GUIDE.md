# DevConnect Setup Guide

## Prerequisites
- Node.js 16+ installed
- PostgreSQL database (or Prisma Accelerate connection)
- npm or yarn package manager

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
The `.env` file is already configured. Verify these settings:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=900
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Database Migrations (if needed)
```bash
npx prisma migrate dev
```

### 5. Start Backend Server
```bash
npm run dev
```

Backend will run on `http://localhost:3001`

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
The `.env` file is already created with:

```env
VITE_API_URL=http://localhost:3001
```

### 3. Start Frontend Development Server
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Testing the Application

### 1. Create an Account
1. Open browser to `http://localhost:5173`
2. Click "Sign up for free" or go to `/signup`
3. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Username: johndoe
   - Password: Test123!
   - Confirm Password: Test123!
4. Check "I agree to the Terms of Service"
5. Click "Create account"

### 2. Login
1. Go to `/login`
2. Enter your email and password
3. Click "Continue"

### 3. View Profile
1. After logging in, navigate to `/profile`
2. Your profile data will be displayed
3. Click "Edit Profile" to update (feature to be implemented)

## User Data Persistence

User data is persisted in multiple ways:

### 1. Database (Backend)
- All user data is stored in PostgreSQL via Prisma
- Includes: email, username, password (hashed), profile info, etc.

### 2. LocalStorage (Frontend)
- User session data stored in `localStorage` under key `dc_user`
- Includes: id, email, username, firstName, lastName, profilePicture, token
- Persists across page refreshes
- Cleared on logout

### 3. Auth Context (Frontend)
- React Context provides user data throughout the app
- Automatically loads from localStorage on app start
- Updates localStorage when user data changes

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/check-username` - Check username availability
- `GET /api/auth/me` - Get current user (requires auth)

### Profile
- `GET /api/profiles/me` - Get current user's full profile (requires auth)
- `PUT /api/profiles/me` - Update profile (requires auth)
- `GET /api/profiles/:username` - Get user profile by username

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify DATABASE_URL in `.env`
- Run `npx prisma generate`

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check `VITE_API_URL` in `frontend/.env`
- Check browser console for CORS errors

### Login/Signup not working
- Check backend console for errors
- Verify database connection
- Check network tab in browser DevTools

### Profile page shows "Please log in"
- Verify you're logged in (check localStorage for `dc_user`)
- Check if token is valid
- Try logging out and logging in again

### Username check not working
- Verify backend is running
- Check `/api/auth/check-username` endpoint
- Check browser console for errors

## Development Tips

### Viewing User Data
Open browser DevTools > Application > Local Storage > `http://localhost:5173` > `dc_user`

### Clearing User Session
```javascript
localStorage.removeItem('dc_user');
window.location.reload();
```

### Testing API Endpoints
```bash
# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","username":"testuser","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Get Profile (replace TOKEN with actual token)
curl http://localhost:3001/api/profiles/me \
  -H "Authorization: Bearer TOKEN"
```

## Next Steps

1. Implement profile editing functionality
2. Add OAuth integration (GitHub, Google)
3. Implement password reset
4. Add email verification
5. Implement profile picture upload
6. Add more profile fields

## Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire after 15 minutes (configurable)
- Always use HTTPS in production
- Never commit `.env` files to version control
- Keep JWT_SECRET secure and random

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET
3. Configure production database
4. Set up HTTPS
5. Configure CORS for production frontend URL

### Frontend
1. Update `VITE_API_URL` to production backend URL
2. Build: `npm run build`
3. Deploy `dist` folder to hosting service
4. Configure environment variables on hosting platform

## Support

For issues or questions:
1. Check this guide
2. Review documentation in `docs/` folder
3. Check backend console logs
4. Check browser console logs
5. Review `IMPLEMENTATION_SUMMARY.md`
