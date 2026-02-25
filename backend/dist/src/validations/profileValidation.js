"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePreferencesSchema = exports.updateCoverPictureSchema = exports.updateProfilePictureSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(50).optional(),
    lastName: zod_1.z.string().min(1).max(50).optional(),
    bio: zod_1.z.string().max(500).optional(),
    title: zod_1.z.string().max(100).optional(),
    company: zod_1.z.string().max(100).optional(),
    location: zod_1.z.string().max(100).optional(),
    website: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    github: zod_1.z.string().max(50).optional(),
    linkedin: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    twitter: zod_1.z.string().max(50).optional(),
    phone: zod_1.z.string().max(20).optional(),
    skills: zod_1.z.array(zod_1.z.string()).max(50).optional(),
    yearsOfExp: zod_1.z.number().int().min(0).max(70).optional(),
    availability: zod_1.z.enum(['available', 'not-available', 'open-to-offers']).optional(),
    timezone: zod_1.z.string().optional(),
    locale: zod_1.z.string().optional()
});
exports.updateProfilePictureSchema = zod_1.z.object({
    profilePicture: zod_1.z.string().url()
});
exports.updateCoverPictureSchema = zod_1.z.object({
    coverPicture: zod_1.z.string().url()
});
exports.updatePreferencesSchema = zod_1.z.object({
    preferences: zod_1.z.object({
        notifications: zod_1.z.object({
            email: zod_1.z.boolean().optional(),
            push: zod_1.z.boolean().optional(),
            sms: zod_1.z.boolean().optional()
        }).optional(),
        privacy: zod_1.z.object({
            profileVisibility: zod_1.z.enum(['public', 'private', 'connections']).optional(),
            showEmail: zod_1.z.boolean().optional(),
            showPhone: zod_1.z.boolean().optional()
        }).optional(),
        theme: zod_1.z.object({
            mode: zod_1.z.enum(['light', 'dark', 'system']).optional(),
            accentColor: zod_1.z.string().optional()
        }).optional()
    })
});
