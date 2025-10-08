import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'password'>; // Exclude password from user object
    }
  }
}

// Implementation removed — type declarations to be reimplemented by the user.
