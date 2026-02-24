"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerInstance = exports.stream = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("./env");
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define log colors for console output
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};
// Tell winston to use colors
winston_1.default.addColors(colors);
// Define log format for development (readable, colored)
const developmentFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let log = `${timestamp} [${level}]: ${message}`;
    // Add metadata if present
    if (Object.keys(meta).length > 0 && meta.stack) {
        log += `\n${meta.stack}`;
    }
    else if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return log;
}));
// Define log format for production (JSON, structured)
const productionFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
// Create the logger
const logger = winston_1.default.createLogger({
    level: env_1.IS_DEVELOPMENT ? 'debug' : 'info',
    levels,
    format: env_1.IS_PRODUCTION ? productionFormat : developmentFormat,
    transports: [
        // Console transport (always enabled)
        new winston_1.default.transports.Console({
            format: env_1.IS_PRODUCTION ? productionFormat : developmentFormat,
        }),
        // File transport for errors (only in production)
        ...(env_1.IS_PRODUCTION
            ? [
                new winston_1.default.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    format: productionFormat,
                }),
                new winston_1.default.transports.File({
                    filename: 'logs/combined.log',
                    format: productionFormat,
                }),
            ]
            : []),
    ],
    // Don't exit on handled exceptions
    exitOnError: false,
});
// Create a stream object for HTTP request logging (if using with morgan)
exports.stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};
// Helper function to sanitize sensitive data from logs
const sanitizeData = (data) => {
    if (!data || typeof data !== 'object') {
        return data;
    }
    const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'jwt'];
    const sanitized = { ...data };
    for (const key in sanitized) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
            sanitized[key] = '[REDACTED]';
        }
        else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitizeData(sanitized[key]);
        }
    }
    return sanitized;
};
// Enhanced logger methods with sanitization
const createLoggerMethods = () => {
    const baseLogger = logger;
    return {
        error: (message, error, meta) => {
            const sanitizedMeta = sanitizeData(meta);
            if (error instanceof Error) {
                baseLogger.error(message, {
                    error: error.message,
                    stack: error.stack,
                    ...sanitizedMeta,
                });
            }
            else if (error) {
                baseLogger.error(message, {
                    error: sanitizeData(error),
                    ...sanitizedMeta,
                });
            }
            else {
                baseLogger.error(message, sanitizedMeta);
            }
        },
        warn: (message, meta) => {
            baseLogger.warn(message, sanitizeData(meta));
        },
        info: (message, meta) => {
            baseLogger.info(message, sanitizeData(meta));
        },
        http: (message, meta) => {
            baseLogger.http(message, sanitizeData(meta));
        },
        debug: (message, meta) => {
            baseLogger.debug(message, sanitizeData(meta));
        },
    };
};
// Export logger instance with enhanced methods
exports.loggerInstance = createLoggerMethods();
// Export default logger (for backward compatibility)
exports.default = exports.loggerInstance;
