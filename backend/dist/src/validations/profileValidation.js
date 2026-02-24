"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(3).max(100).optional(),
    bio: zod_1.z.string().max(500).optional(),
    avatar: zod_1.z.string().optional(),
    website: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    location: zod_1.z.string().max(100).optional(),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
    experience: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        company: zod_1.z.string(),
        location: zod_1.z.string().optional(),
        from: zod_1.z.string(),
        to: zod_1.z.string().optional(),
        current: zod_1.z.boolean().optional(),
        description: zod_1.z.string().optional(),
    })).optional(),
    education: zod_1.z.array(zod_1.z.object({
        school: zod_1.z.string(),
        degree: zod_1.z.string(),
        fieldOfStudy: zod_1.z.string(),
        from: zod_1.z.string(),
        to: zod_1.z.string().optional(),
        current: zod_1.z.boolean().optional(),
        description: zod_1.z.string().optional(),
    })).optional(),
    social: zod_1.z.object({
        twitter: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        linkedin: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        github: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    }).optional(),
});
// Implementation removed — validations to be reimplemented by the user.
