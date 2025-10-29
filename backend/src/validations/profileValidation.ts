import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(3).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      location: z.string().optional(),
      from: z.string(),
      to: z.string().optional(),
      current: z.boolean().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      fieldOfStudy: z.string(),
      from: z.string(),
      to: z.string().optional(),
      current: z.boolean().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  social: z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
  }).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Implementation removed — validations to be reimplemented by the user.
