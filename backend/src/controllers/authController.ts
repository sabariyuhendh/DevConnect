import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { signToken } from '../utils/jwt';

export const signup = async (req: Request, res: Response) => {
  const { email, password, username, firstName, lastName } = req.body;

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true },
    });
    if (existing) {
      return res.status(409).json({ message: 'Email or username already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        password: hashedPassword,
        provider: 'local'
      }
    });

    const token = signToken({ id: user.id });

    // Return user data matching frontend expectations
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
  } catch (error) {
    res.status(400).json({
      message: 'Unable to create account',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user.id });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Unable to login',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const me = async (req: Request, res: Response) => {
  const user = (req as any).user;
  return res.json({ user });
};
