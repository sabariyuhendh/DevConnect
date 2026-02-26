# Quick Authentication Reference

## ✅ System Status

Both services are now running:

### Backend
- **Port**: 3001
- **Status**: ✅ Running
- **URL**: http://localhost:3001 or http://10.144.12.192:3001
- **Health**: http://localhost:3001/health

### Frontend
- **Port**: 8080
- **Status**: ✅ Running
- **URL**: http://localhost:8080 or http://10.144.12.192:8080

## 🔑 Authentication Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/signup` | POST | No | Register new user |
| `/api/auth/login` | POST | No | Login user |
| `/api/auth/check-username` | GET | No | Check username availability |
| `/api/auth/me` | GET | Yes | Get current user |
| `/api/auth/logout` | POST | Yes | Logout user |

## 📝 Request Examples

### Signup
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Check Username
```bash
curl "http://localhost:3001/api/auth/check-username?username=johndoe"
```

## 🌐 Access URLs

### For Local Development
- Frontend: http://localhost:8080
- Backend: http://localhost:3001

### For Network Access (Other Devices)
- Frontend: http://10.144.12.192:8080
- Backend: http://10.144.12.192:3001

## 🔧 Configuration

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*
DATABASE_URL=prisma+postgres://...
JWT_SECRET=...
```

### Frontend (.env)
```env
# For network access
VITE_API_URL=http://10.144.12.192:3001

# For localhost
# VITE_API_URL=http://localhost:3001
```

## 🚀 Start/Stop Commands

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm run dev -- --host
```

### Stop Services
Press `Ctrl+C` in each terminal

### Restart Everything
```bash
./restart-with-network.sh
```

## 🐛 Troubleshooting

### Error: "Can't find /api/auth/login on this server!"
**Solution**: Backend not running
```bash
cd backend && npm run dev
```

### Error: ERR_BLOCKED_BY_CLIENT
**Solution**: Browser extension blocking
- Disable ad blockers
- Use Incognito mode
- Access via network IP

### Error: CORS error
**Solution**: Check CORS configuration
```bash
grep CORS_ORIGIN backend/.env
# Should be: CORS_ORIGIN=*
```

### Error: Can't connect to backend
**Solution**: Check frontend .env
```bash
cat frontend/.env
# Should match backend URL
```

### Infinite polling/requests
**Solution**: 
1. Check browser console for errors
2. Ensure backend is responding
3. Clear browser cache
4. Restart both services

## 📊 Test System Status

```bash
# Run diagnostic
./diagnose-err-blocked.sh

# Test auth endpoints
./test-auth-endpoints.sh

# Check backend health
curl http://localhost:3001/health
```

## 📚 Full Documentation

See [docs/AUTHENTICATION_WORKFLOW.md](docs/AUTHENTICATION_WORKFLOW.md) for complete details.

## ⚡ Quick Test

1. Open browser: http://localhost:8080
2. Click "Sign up"
3. Fill form and submit
4. Should redirect to /feed
5. Try logging out and logging in again

## 🎯 Current Configuration

- ✅ Backend running on port 3001
- ✅ Frontend running on port 8080
- ✅ CORS enabled for all origins
- ✅ Database connected
- ✅ JWT authentication configured
- ✅ All auth routes registered

Everything is ready to use!
