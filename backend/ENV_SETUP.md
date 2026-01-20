# Backend Environment Setup

Create a file named `.env` inside `backend/` with the following keys:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/devconnect?schema=public"

# Auth (must be at least 32 characters)
JWT_SECRET="CHANGE_ME_TO_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS"
JWT_EXPIRES_IN="7d"

# Server
NODE_ENV="development"
PORT="3001"

# CORS
CORS_ORIGIN="http://localhost:8080"

# Rate limiting
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX="100"
```

Then run:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run dev
```
