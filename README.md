# DevConnect

A professional developer networking platform built with React, TypeScript, Node.js, and PostgreSQL.

## Features

- 🔐 **Authentication** - Secure login/signup with JWT
- 👥 **Networking** - Connect with developers
- 💼 **Jobs** - Browse and post job opportunities
- 📅 **Events** - Discover and create tech events
- 💬 **Messaging** - Real-time chat
- 🏔️ **Developer's Cave** - Productivity workspace with focus timer, tasks, chat rooms, and more
- 📊 **Analytics** - Track your activity and engagement

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DevConnect
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:8081 or http://10.144.12.192:8081
   - Backend: http://localhost:3001 or http://10.144.12.192:3001

**Quick Start Script:**
```bash
./start-dev.sh
```

**Switch Configurations:**
```bash
./switch-env.sh local    # For localhost
./switch-env.sh network  # For network access
```

## Documentation

Complete documentation is available in the [docs](./docs) folder:

- [Auth Endpoints Fixed](./docs/AUTH_ENDPOINTS_FIXED.md) - ⭐ Latest fixes
- [Prisma Setup Complete](./docs/PRISMA_SETUP_COMPLETE.md) - Database setup
- [Quick Start Guide](./docs/QUICK_START.md)
- [Setup Guide](./docs/SETUP_GUIDE.md)
- [Authentication Guide](./docs/AUTHENTICATION_GUIDE.md)
- [CORS & Security](./docs/CORS_AUTHENTICATION_GUIDE.md)
- [Network Setup](./docs/NETWORK_SETUP_GUIDE.md)
- [All Documentation](./docs/README.md)

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- React Router
- Tanstack Query

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Socket.io

## Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=*
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## Network Access

To access from other devices on your network:

1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `frontend/.env`: `VITE_API_URL=http://YOUR_IP:3001`
3. Update `backend/.env`: `CORS_ORIGIN=*`
4. Start frontend with: `npm run dev -- --host`
5. Access from: `http://YOUR_IP:5173`

See [Network Setup Guide](./docs/NETWORK_SETUP_GUIDE.md) for details.

## Testing

```bash
# Test all auth endpoints (localhost + network)
./test-auth-endpoints.sh

# Test backend health
curl http://localhost:3001/health

# Test username availability
curl "http://localhost:3001/api/auth/check-username?username=testuser"
```

## License

MIT License
