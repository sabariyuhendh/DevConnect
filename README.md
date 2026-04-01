# DevConnect - Professional Developer Network

A modern social networking platform for developers to connect, share knowledge, and find opportunities.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or bun

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
# Configure your DATABASE_URL in .env
npx prisma generate
npx prisma migrate deploy
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Configure VITE_API_URL if needed (defaults to http://localhost:3001)
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:8080 (or 8081 if 8080 is in use)
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

## 📁 Project Structure

```
DevConnect/
├── backend/              # Node.js + Express + Prisma backend
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, validation, security
│   │   ├── utils/        # Helper functions
│   │   ├── validations/  # Zod schemas
│   │   └── websocket/    # WebSocket handlers
│   ├── prisma/           # Database schema and migrations
│   └── uploads/          # File uploads storage
├── frontend/             # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
└── docs/                 # Documentation
```

## 🔑 Key Features

### ✅ Implemented
- **Authentication** - Email/password, OAuth (GitHub, Google)
- **User Profiles** - Customizable profiles with bio, skills, experience
- **Social Features** - Posts, comments, likes, bookmarks
- **Connections** - Send/accept connection requests, network building
- **Job Board** - Post jobs, apply, track applications
- **Events** - Create events, RSVP, waitlist management
- **Messaging** - Real-time direct messaging
- **Developer's Cave** - Focus sessions, tasks, notes, chat rooms
- **File Uploads** - Profile pictures, cover images, resumes
- **Admin Panel** - User management, job approval, activity logs
- **Real-time Updates** - WebSocket support for live features

### 🚧 In Progress
- Notification system
- Email integration
- Profile experience/education CRUD
- Advanced search and filtering

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT tokens, OAuth 2.0
- **Real-time:** Socket.IO
- **File Upload:** Multer
- **Validation:** Zod
- **Security:** Helmet, rate limiting, input sanitization

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Library:** shadcn/ui + Tailwind CSS
- **State Management:** React Context
- **Routing:** React Router v6
- **HTTP Client:** Fetch API
- **Real-time:** Socket.IO client

## 📚 Documentation

- [API Documentation](docs/API.md) - Complete API reference
- [API Endpoint Status](docs/API_ENDPOINT_STATUS.md) - Endpoint health and connectivity
- [Admin Setup](docs/ADMIN_SETUP.md) - Admin account configuration
- [Super Admin Guide](docs/SUPERADMIN_ACCESS_GUIDE.md) - Super admin features
- [Username Validation](docs/USERNAME_VALIDATION_FIX.md) - Username validation details
- [Recent Fixes](docs/FIXES_SUMMARY.md) - Latest bug fixes and improvements
- [Implementation Roadmap](todo.md) - Feature roadmap and progress

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/devconnect"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:8080"

# OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GITHUB_REDIRECT_URI="http://localhost:3001/api/auth/github/callback"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:3001/api/auth/google/callback"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_ENV=development
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Backend
1. Set production environment variables
2. Build: `npm run build`
3. Run migrations: `npx prisma migrate deploy`
4. Start: `npm start`

### Frontend
1. Set production API URL in .env
2. Build: `npm run build`
3. Serve the `dist` folder with any static hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Known Issues

See [todo.md](todo.md) for current issues and planned improvements.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ by the DevConnect team**
