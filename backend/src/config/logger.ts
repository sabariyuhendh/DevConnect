import winston from 'winston';
import { IS_DEVELOPMENT, IS_PRODUCTION } from './env';

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
winston.addColors(colors);

// Define log format for development (readable, colored)
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0 && meta.stack) {
      log += `\n${meta.stack}`;
    } else if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Define log format for production (JSON, structured)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: IS_DEVELOPMENT ? 'debug' : 'info',
  levels,
  format: IS_PRODUCTION ? productionFormat : developmentFormat,
  transports: [
    // Console transport (always enabled)
    new winston.transports.Console({
      format: IS_PRODUCTION ? productionFormat : developmentFormat,
    }),
    
    // File transport for errors (only in production)
    ...(IS_PRODUCTION
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: productionFormat,
          }),
          new winston.transports.File({
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
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper function to sanitize sensitive data from logs
const sanitizeData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'jwt'];
  const sanitized = { ...data };

  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }

  return sanitized;
};

// Enhanced logger methods with sanitization
const createLoggerMethods = () => {
  const baseLogger = logger;

  return {
    error: (message: string, error?: Error | any, meta?: any) => {
      const sanitizedMeta = sanitizeData(meta);
      
      if (error instanceof Error) {
        baseLogger.error(message, {
          error: error.message,
          stack: error.stack,
          ...sanitizedMeta,
        });
      } else if (error) {
        baseLogger.error(message, {
          error: sanitizeData(error),
          ...sanitizedMeta,
        });
      } else {
        baseLogger.error(message, sanitizedMeta);
      }
    },

    warn: (message: string, meta?: any) => {
      baseLogger.warn(message, sanitizeData(meta));
    },

    info: (message: string, meta?: any) => {
      baseLogger.info(message, sanitizeData(meta));
    },

    http: (message: string, meta?: any) => {
      baseLogger.http(message, sanitizeData(meta));
    },

    debug: (message: string, meta?: any) => {
      baseLogger.debug(message, sanitizeData(meta));
    },
  };
};

// Export logger instance with enhanced methods
export const loggerInstance = createLoggerMethods();

// Export default logger (for backward compatibility)
export default loggerInstance;