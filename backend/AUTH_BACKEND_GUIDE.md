# DevConnect — Backend Authentication & User Flow Guide

This guide walks through implementing backend auth and user flow from scratch:
- data model (Prisma)
- migrations
- auth controllers (signup, signin, check-username, oauth-complete)
- JWT middleware and protected routes
- where frontend expects endpoints

Prerequisites
- Node >= 16, npm/yarn
- Prisma (ORM), PostgreSQL (or MySQL), dotenv

1) Prisma schema (example)
- File: backend/prisma/schema.prisma

```prisma
// example schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id         String   @id @default(cuid())
  email      String   @unique
  username   String   @unique
  password   String?  // hashed password, null for OAuth users
  provider   String?  // e.g. "local", "google", "github"
  providerId String?  // provider-specific id
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  // add relations for posts, profiles, chats as needed
}
```

Commands:
- npm install prisma @prisma/client
- npx prisma migrate dev --name init
- npx prisma generate

2) Environment
- .env: DATABASE_URL, JWT_SECRET, FRONTEND_URL, etc.

3) Install backend deps
- npm i express bcryptjs jsonwebtoken prisma @prisma/client express-validator cors helmet dotenv

4) Utility: hashing and JWT helpers (example)
- File: backend/src/utils/auth.ts

```ts
// pseudocode example
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
export function signToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });
}
export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET as string);
}
```

5) Middleware: protect routes
- File: backend/src/middleware/authMiddleware.ts

```ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function requireAuth(req: Request & { user?: any }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization?.split(' ')[1];
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload: any = verifyToken(auth);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
```

6) Controllers / Routes (examples)
- File: backend/src/routes/auth.ts

```ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, signToken } from '../utils/auth';
const prisma = new PrismaClient();
const router = express.Router();

// POST /api/auth/check-username?username=...
router.get('/check-username', async (req, res) => {
  const username = String(req.query.username || '').trim();
  if (!username) return res.json({ available: false });
  const exists = await prisma.user.findUnique({ where: { username } });
  return res.json({ available: !Boolean(exists) });
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) return res.status(400).json({ message: 'Missing fields' });
  // server-side uniqueness check
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) return res.status(409).json({ message: 'Email or username already in use' });
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, username, password: hashed, provider: 'local' }
  });
  const token = signToken({ id: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  const { email, password, username: clientUsername } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  // Optional: if client supplied username and user doesn't have one, persist it
  if (clientUsername && user.username !== clientUsername) {
    // check uniqueness before persisting
    const stillFree = !(await prisma.user.findUnique({ where: { username: clientUsername } }));
    if (stillFree) {
      await prisma.user.update({ where: { id: user.id }, data: { username: clientUsername } });
      user.username = clientUsername;
    }
  }
  const token = signToken({ id: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
});

// OAuth entry/complete endpoints are app-specific. Example complete:
// POST /api/auth/oauth/:provider/complete { token, username }
router.post('/oauth/:provider/complete', async (req, res) => {
  const { provider } = req.params;
  const { token: providerToken, username } = req.body;
  // verify providerToken with provider, obtain providerId and email
  // Example: get providerId and email from provider
  // if user with providerId exists -> signin
  // else if user with email exists -> link accounts
  // else create user with provider, providerId, username
  // return JWT token and user
  return res.status(501).json({ message: 'Implement provider verification flow' });
});

export default router;
```

7) Profiles and other endpoints
- Use requireAuth middleware to protect endpoints.

Example: GET /api/profiles/me

```ts
router.get('/profiles/me', requireAuth, async (req, res) => {
  const user = req.user;
  // return profile data; ensure to include username
  res.json({ id: user.id, email: user.email, username: user.username, bio: user.bio || '' });
});
```

8) Websockets / Chats
- On send, accept a message payload; server should set authoritative authorUsername from user.username (from token) before broadcasting.
- Frontend can optimistically show client-side username in chat messages; server will broadcast canonical username.

9) Security & validation
- Always validate input on server.
- Hash passwords.
- Rate-limit endpoints (signup/signin).
- Sanitize usernames (allowed chars, length).
- Ensure username uniqueness at DB level (unique index) to avoid race conditions.

10) Testing & migration
- After schema change: npx prisma migrate dev --name add-username
- Seed sample users via a script or Prisma Studio.

11) Where to implement in your repo
- Place Prisma schema under backend/prisma.
- Put Express app files under backend/src (controllers, routes, middleware).
- Add route mounts in server.ts (you already have server.ts in backend). Example:
  app.use('/api/auth', authRoutes);
  app.use('/api/profiles', profileRoutes);

12) Example flow summary
- Signup (frontend): POST /api/auth/signup { email, password, username } -> server verifies unique, creates user, returns token+user.
- Signin (frontend): POST /api/auth/signin { email, password, username? } -> server verifies creds, optionally persist username, return token+user.
- Check username (frontend): GET /api/auth/check-username?username=foo -> { available: true/false }
- OAuth: start OAuth redirect -> complete endpoint POST /api/auth/oauth/:provider/complete { token, username } -> server verifies provider token, creates/links user, returns token+user.

Use this guide to implement the backend endpoints the frontend expects. If you want, implement the check-username endpoint first so the signup page's availability check works immediately.
