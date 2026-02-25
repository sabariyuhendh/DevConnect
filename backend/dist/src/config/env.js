"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IS_TEST = exports.IS_DEVELOPMENT = exports.IS_PRODUCTION = exports.CORS_ORIGIN = exports.RATE_LIMIT_MAX = exports.RATE_LIMIT_WINDOW_MS = exports.PORT = exports.NODE_ENV = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.DATABASE_URL = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
// Load env vars from either:
// - process.cwd()/.env (when running inside backend/)
// - backend/.env (when running from repo root)
const cwdEnvPath = path_1.default.resolve(process.cwd(), '.env');
const backendEnvPath = path_1.default.resolve(__dirname, '../../.env');
dotenv_1.default.config({ path: cwdEnvPath });
if (!process.env.DATABASE_URL && !process.env.JWT_SECRET) {
    dotenv_1.default.config({ path: backendEnvPath });
}
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
    JWT_EXPIRES_IN: zod_1.z.string().default('15m'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('3001'),
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().default('900000'), // 15 minutes
    RATE_LIMIT_MAX: zod_1.z.string().default('100'),
    CORS_ORIGIN: zod_1.z.string().default('*'),
});
const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
});
if (!parsed.success) {
    const missingKeys = parsed.error.issues
        .map((i) => { var _a; return (_a = i.path) === null || _a === void 0 ? void 0 : _a[0]; })
        .filter(Boolean)
        .join(', ');
    // eslint-disable-next-line no-console
    console.error([
        '❌ Backend env validation failed.',
        `Missing/invalid: ${missingKeys || 'unknown'}`,
        `Looked for env files at:`,
        `- ${cwdEnvPath}`,
        `- ${backendEnvPath}`,
        `Create backend/.env (see backend/ENV_SETUP.md) and restart.`,
    ].join('\n'));
    throw parsed.error;
}
const env = parsed.data;
exports.DATABASE_URL = env.DATABASE_URL, exports.JWT_SECRET = env.JWT_SECRET, exports.JWT_EXPIRES_IN = env.JWT_EXPIRES_IN, exports.NODE_ENV = env.NODE_ENV, exports.PORT = env.PORT, exports.RATE_LIMIT_WINDOW_MS = env.RATE_LIMIT_WINDOW_MS, exports.RATE_LIMIT_MAX = env.RATE_LIMIT_MAX, exports.CORS_ORIGIN = env.CORS_ORIGIN;
exports.IS_PRODUCTION = exports.NODE_ENV === 'production';
exports.IS_DEVELOPMENT = exports.NODE_ENV === 'development';
exports.IS_TEST = exports.NODE_ENV === 'test';
