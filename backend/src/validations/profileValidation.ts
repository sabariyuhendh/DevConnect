import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  github: z.string().max(50).optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  twitter: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  skills: z.array(z.string()).max(50).optional(),
  yearsOfExp: z.number().int().min(0).max(70).optional(),
  availability: z.enum(['available', 'not-available', 'open-to-offers']).optional(),
  timezone: z.string().optional(),
  locale: z.string().optional()
});

export const updateProfilePictureSchema = z.object({
  profilePicture: z.string().url()
});

export const updateCoverPictureSchema = z.object({
  coverPicture: z.string().url()
});

export const updatePreferencesSchema = z.object({
  preferences: z.object({
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional()
    }).optional(),
    privacy: z.object({
      profileVisibility: z.enum(['public', 'private', 'connections']).optional(),
      showEmail: z.boolean().optional(),
      showPhone: z.boolean().optional()
    }).optional(),
    theme: z.object({
      mode: z.enum(['light', 'dark', 'system']).optional(),
      accentColor: z.string().optional()
    }).optional()
  })
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateProfilePictureInput = z.infer<typeof updateProfilePictureSchema>;
export type UpdateCoverPictureInput = z.infer<typeof updateCoverPictureSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
