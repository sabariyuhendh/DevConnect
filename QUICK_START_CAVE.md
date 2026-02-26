# Developer's Cave - Quick Start Guide 🚀

## Prerequisites
- Node.js 18+
- PostgreSQL database
- DevConnect backend running

## 5-Minute Setup

### Step 1: Install Socket.IO
```bash
cd backend
npm install socket.io @types/socket.io
```

### Step 2: Run Database Migration
```bash
npx prisma migrate dev --name add_developers_cave
npx prisma generate
```

### Step 3: Start Backend
```bash
npm run dev
```

You should see:
```
✅ DevConnect backend running on http://localhost:3001
🔌 WebSocket server ready on ws://localhost:3001
```

### Step 4: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 5: Access Developer's Cave
1. Open browser: `http://localhost:5173`
2. Login to DevConnect
3. Click "Developer's Cave" in navigation
4. Start using! 🎉

## Quick Test

### Test Focus Session
```bash
curl -X POST http://localhost:3001/api/cave/focus/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "POMODORO", "duration": 1500}'
```

### Test Task Creation
```bash
curl -X POST http://localhost:3001/api/cave/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "priority": "HIGH"}'
```

### Test Room Creation
```bash
curl -X POST http://localhost:3001/api/cave/chat/rooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "test-room", "description": "Test room"}'
```

## Features Available

✅ **Focus Mode** - Start Pomodoro timer
✅ **Tasks** - Create and manage tasks
✅ **Chat** - Real-time messaging in rooms
✅ **Notes** - Create and edit notes
✅ **Trends** - Browse tech articles
✅ **Memes** - View developer memes
✅ **Reputation** - Track points and levels
✅ **Soundboard** - Ambient sounds

## Default Chat Rooms

After migration, these rooms are available:
- #frontend-devs
- #backend
- #ai-ml
- #system-design

## Troubleshooting

### Migration Fails
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### WebSocket Won't Connect
- Check JWT token is valid
- Verify CORS settings
- Check firewall/network

### Database Connection Error
- Verify DATABASE_URL in .env
- Ensure PostgreSQL is running
- Check credentials

## What's Next?

1. **Create a task** - Click Tasks module, add your first task
2. **Start focusing** - Open Focus module, start a Pomodoro
3. **Join a chat** - Open Chat module, select a room
4. **Take notes** - Open Notes module, create a note
5. **Earn reputation** - Complete tasks and focus sessions

## Need Help?

- Check `CAVE_FULL_IMPLEMENTATION.md` for complete details
- See `backend/CAVE_BACKEND_SETUP.md` for API docs
- Read `CAVE_FEATURES_GUIDE.md` for user guide

## Production Deployment

### Backend
```bash
npm run build
npm start
```

### Environment Variables
```env
DATABASE_URL="your-production-db-url"
JWT_SECRET="secure-random-secret"
NODE_ENV="production"
CORS_ORIGIN="https://your-domain.com"
```

### Database
```bash
npx prisma migrate deploy
```

---

**That's it!** Developer's Cave is now running. Happy coding! 🏔️
