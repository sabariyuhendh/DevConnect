# DevConnect Authentication Implementation Guide

## 1. Database Setup (Prisma)

### Install Dependencies
```bash
npm install prisma @prisma/client bcryptjs jsonwebtoken cors helmet express-validator
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Prisma Schema
```prisma
// backend/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  password  String?  // null for OAuth users
  firstName String?
  lastName  String?
  provider  String?  // "local" | "google" | "github"
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations (implement as needed)
  posts     Post[]
  profile   Profile?
}

model Profile {
  id       String  @id @default(cuid())
  bio      String?
  location String?
  website  String?
  userId   String  @unique
  user     User    @relation(fields: [userId], references: [id])
}
```

### Initialize Database
```bash
npx prisma generate
npx prisma migrate dev --name init
```

## 2. Backend Implementation

### Environment Variables
```env
# backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/devconnect"
JWT_SECRET="your-jwt-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
FRONTEND_URL="http://localhost:3000"
```

### Auth Middleware
```typescript
// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export const requireAuth = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new AppError('Not authenticated', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Not authenticated', 401));
  }
};
```

### Auth Controllers
```typescript
// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
  const { email, password, username, firstName, lastName } = req.body;

  const hashedPassword = await bcrypt.hash(password, 12);
  
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      provider: 'local'
    }
  });

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName
    }
  });
};

// Add other controller methods (signin, check-username, etc.)
```

### Auth Routes
```typescript
// backend/src/routes/authRoutes.ts
import express from 'express';
import { signup, signin, checkUsername } from '../controllers/authController';
import { validateSignup } from '../middleware/validators';

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/signin', signin);
router.get('/check-username', checkUsername);
router.post('/oauth/:provider/complete', oauthComplete);

export default router;
```

## 3. API Routes Mapping

### Authentication Routes

| Frontend Route | Backend Route | Method | Description | Request Body | Response |
|---------------|---------------|--------|-------------|--------------|-----------|
| `/api/auth/check-username` | `/api/auth/check-username` | GET | Check username availability | Query: ?username=value | `{ available: boolean }` |
| `/api/auth/signup` | `/api/auth/signup` | POST | Create new account | `{ email, password, username, firstName, lastName }` | `{ token, user }` |
| `/api/auth/signin` | `/api/auth/signin` | POST | Sign in | `{ email, password }` | `{ token, user }` |
| `/api/auth/oauth/google` | `/api/auth/oauth/google` | GET | Start Google OAuth | - | Redirect |
| `/api/auth/oauth/github` | `/api/auth/oauth/github` | GET | Start GitHub OAuth | - | Redirect |
| `/api/auth/oauth/:provider/complete` | `/api/auth/oauth/:provider/complete` | POST | Complete OAuth | `{ token, username? }` | `{ token, user }` |

### Protected Routes (require auth)

| Frontend Route | Backend Route | Method | Description |
|---------------|---------------|--------|-------------|
| `/api/profiles/me` | `/api/profiles/me` | GET | Get own profile |
| `/api/profiles/me` | `/api/profiles/me` | PUT | Update profile |
| `/api/users/:username` | `/api/users/:username` | GET | Get user profile |

## 4. Implementation Steps

1. **Setup Project Structure**
   ```bash
   mkdir -p backend/src/{controllers,routes,middleware,utils}
   cd backend
   npm init -y
   ```

2. **Install Dependencies**
   ```bash
   npm install express prisma @prisma/client bcryptjs jsonwebtoken cors helmet
   npm install -D typescript ts-node @types/node @types/express
   ```

3. **Initialize TypeScript**
   ```bash
   npx tsc --init
   ```

4. **Create Database Schema**
   - Run Prisma commands from earlier
   - Verify database connection

5. **Implement Backend Files in Order**
   - utils/errors.ts (AppError class)
   - middleware/authMiddleware.ts
   - middleware/validators.ts
   - controllers/authController.ts
   - routes/authRoutes.ts
   - Update server.ts

6. **Test API Endpoints**
   ```bash
   # Check username
   curl "http://localhost:5000/api/auth/check-username?username=test"

   # Signup
   curl -X POST http://localhost:5000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Password123","username":"test"}'
   ```

## 5. Frontend Integration Notes

1. **API Helper Setup**
   ```typescript
   // frontend/src/utils/api.ts
   export const apiBase = process.env.REACT_APP_API_BASE || '';
   
   export async function api(endpoint: string, options: RequestInit = {}) {
     const token = localStorage.getItem('token');
     const headers = new Headers(options.headers);
     
     if (token) {
       headers.set('Authorization', `Bearer ${token}`);
     }
     
     const res = await fetch(`${apiBase}${endpoint}`, {
       ...options,
       headers
     });
     
     if (!res.ok) throw await res.json();
     return res.json();
   }
   ```

2. **Auth Context Setup**
   ```typescript
   // frontend/src/contexts/AuthContext.tsx
   export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
     const [user, setUser] = useState(() => {
       const saved = localStorage.getItem('user');
       return saved ? JSON.parse(saved) : null;
     });

     // ... context implementation
   };
   ```

3. **Protected Route Component**
   ```typescript
   // frontend/src/components/ProtectedRoute.tsx
   export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
     const { user } = useAuth();
     if (!user) return <Navigate to="/login" />;
     return <>{children}</>;
   };
   ```

## 6. Common Issues & Solutions

1. **CORS Issues**
   - Ensure backend CORS configuration matches frontend origin
   - Check credentials handling in fetch calls

2. **Token Storage**
   - Use HttpOnly cookies for better security
   - Implement refresh token flow if needed

3. **Username Uniqueness**
   - Add database constraint
   - Implement debounced frontend check
   - Double-check on backend before creation

4. **OAuth Flow**
   - Handle state parameter for security
   - Implement proper error handling
   - Store provider tokens securely

## 7. Security Checklist

- [ ] Password hashing with bcrypt
- [ ] JWT secret in environment variables
- [ ] CORS properly configured
- [ ] Input validation on all routes
- [ ] Rate limiting on auth endpoints
- [ ] SQL injection protection (Prisma helps)
- [ ] XSS protection (helmet)
