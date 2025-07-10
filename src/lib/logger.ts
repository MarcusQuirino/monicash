import winston from 'winston';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Define colors for console output
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(logColors);

// Custom format for development
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Custom format for production
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Create the logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: isProduction ? 'info' : 'debug',
  format: isProduction ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

// Helper functions for structured logging
export const logRequest = (
  method: string,
  path: string,
  userId?: string,
  requestId?: string,
  duration?: number
) => {
  logger.info('API Request', {
    method,
    path,
    userId,
    requestId,
    duration,
    type: 'request',
  });
};

export const logResponse = (
  method: string,
  path: string,
  statusCode: number,
  userId?: string,
  requestId?: string,
  duration?: number
) => {
  const level = statusCode >= 400 ? 'error' : 'info';
  logger[level]('API Response', {
    method,
    path,
    statusCode,
    userId,
    requestId,
    duration,
    type: 'response',
  });
};

export const logAuth = (
  action: string,
  email?: string,
  success: boolean = true,
  error?: string
) => {
  const level = success ? 'info' : 'warn';
  logger[level]('Authentication', {
    action,
    email,
    success,
    error,
    type: 'auth',
  });
};

export const logDatabase = (
  operation: string,
  table: string,
  recordId?: string,
  userId?: string,
  error?: string
) => {
  const level = error ? 'error' : 'info';
  logger[level]('Database Operation', {
    operation,
    table,
    recordId,
    userId,
    error,
    type: 'database',
  });
};

export const logBusinessLogic = (
  action: string,
  entity: string,
  entityId?: string,
  userId?: string,
  metadata?: Record<string, unknown>
) => {
  logger.info('Business Logic', {
    action,
    entity,
    entityId,
    userId,
    metadata,
    type: 'business',
  });
};

export const logError = (
  error: Error,
  context?: string,
  userId?: string,
  metadata?: Record<string, unknown>
) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    context,
    userId,
    metadata,
    type: 'error',
  });
};

export default logger;
