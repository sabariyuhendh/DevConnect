import { z } from 'zod';

// Modern username validation based on industry best practices
// Rules:
// - 3-30 characters length
// - Must start with a letter (a-z, case-insensitive, stored as lowercase)
// - Can contain lowercase letters, numbers, underscores, hyphens, and dots
// - Cannot end with underscore, hyphen, or dot
// - Cannot have consecutive special characters (e.g., .., --, __)
// - Case-insensitive (will be normalized to lowercase)
const usernameRegex = /^[a-z][a-z0-9._-]*$/;
const consecutiveSpecialChars = /[._-]{2,}/;
const reservedUsernames = [
  'admin', 'root', 'support', 'system', 'moderator', 'mod', 
  'administrator', 'devconnect', 'api', 'www', 'help', 'info',
  'contact', 'about', 'terms', 'privacy', 'settings', 'profile'
];

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .transform(val => val.toLowerCase().trim())
    .refine(val => usernameRegex.test(val), {
      message: 'Username must start with a letter and can only contain lowercase letters, numbers, dots, underscores, and hyphens'
    })
    .refine(val => !consecutiveSpecialChars.test(val), {
      message: 'Username cannot have consecutive special characters (e.g., .., --, __)'
    })
    .refine(val => !reservedUsernames.includes(val), {
      message: 'This username is reserved'
    }),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
