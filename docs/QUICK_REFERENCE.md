# Quick Reference Card

## 🚀 Start Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🔗 URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Signup: http://localhost:5173/signup
- Login: http://localhost:5173/login
- Profile: http://localhost:5173/profile

## 📝 Test Account

Create a test account:
- Email: test@example.com
- Password: Test123!
- Username: testuser
- First Name: Test
- Last Name: User

## 🔑 API Endpoints

### Auth
```
POST   /api/auth/signup          - Create account
POST   /api/auth/login           - Login
GET    /api/auth/check-username  - Check username
GET    /api/auth/me              - Get current user
```

### Profile
```
GET    /api/profiles/me          - Get my profile
PUT    /api/profiles/me          - Update profile
GET    /api/profiles/:username   - Get user profile
```

## 💾 Data Storage

### LocalStorage Key
```javascript
localStorage.getItem('dc_user')
```

### User Data Structure
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "profilePicture": "https://...",
  "token": "jwt_token"
}
```

## 🧪 Quick Tests

### Check if logged in
```javascript
// Browser console
console.log(localStorage.getItem('dc_user'));
```

### Logout
```javascript
// Browser console
localStorage.removeItem('dc_user');
window.location.reload();
```

### Test API
```bash
# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","username":"testuser","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

## 🔧 Common Commands

### Backend
```bash
cd backend
npm install              # Install dependencies
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
npm run dev              # Start dev server
npm run build            # Build for production
```

### Frontend
```bash
cd frontend
npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Build for production
```

## 📁 Key Files

### Frontend
- `src/pages/Login.tsx` - Login page
- `src/pages/Signup.tsx` - Signup page
- `src/pages/ProfilePage.tsx` - Profile page
- `src/contexts/AuthContext.tsx` - Auth state management
- `.env` - Environment variables

### Backend
- `src/controllers/authController.ts` - Auth logic
- `src/controllers/profileController.ts` - Profile logic
- `src/routes/authRoutes.ts` - Auth endpoints
- `src/routes/profileRoutes.ts` - Profile endpoints
- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check port
lsof -i :3001

# Regenerate Prisma
npx prisma generate

# Check env
cat backend/.env
```

### Frontend can't connect
```bash
# Check backend is running
curl http://localhost:3001/health

# Check env
cat frontend/.env
```

### Login fails
1. Check backend console
2. Check browser console
3. Check network tab
4. Verify credentials

### Profile page blank
1. Check if logged in
2. Check localStorage
3. Check API response
4. Check console errors

## 📚 Documentation

- `SETUP_GUIDE.md` - Complete setup instructions
- `USER_DATA_PERSISTENCE.md` - Data persistence guide
- `IMPLEMENTATION_COMPLETE.md` - Implementation summary
- `docs/USER_MANAGEMENT_GUIDE.md` - API documentation
- `TESTING_CHECKLIST.md` - Testing guide

## ✅ Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Can access signup page
- [ ] Can create account
- [ ] Can login
- [ ] Can view profile
- [ ] Data persists on refresh
- [ ] Can logout

## 🎯 What's Working

✅ User signup
✅ User login
✅ Username validation
✅ Data persistence
✅ Profile display
✅ Session management
✅ Error handling
✅ Loading states

## 🚧 Not Implemented

❌ OAuth (needs API keys)
❌ Profile editing
❌ Password reset
❌ Email verification
❌ Picture upload

## 🔐 Security

- Passwords: bcrypt hashed (12 rounds)
- Tokens: JWT (15 min expiry)
- Storage: localStorage (XSS risk - use HTTPS)
- Validation: Zod schemas
- CORS: Configured

## 📞 Support

Issues? Check:
1. Backend console
2. Browser console
3. Network tab
4. Documentation files
5. Error messages

---

**Quick Start:** Run backend, run frontend, go to /signup, create account, done! 🎉
