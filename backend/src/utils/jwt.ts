import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env';

export type TokenPayload = {
  id: string;
};

export function signToken(payload: TokenPayload) {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions;
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & TokenPayload;
}

// Implementation removed — jwt helpers to be reimplemented by the user.

export {};
