/**
 * Logger utility for MCP server
 * CRITICAL: Never write to stdout in stdio transport - only use stderr
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
}

/**
 * Log a message to stderr
 * @param level Log level
 * @param message Log message
 * @param context Additional context data
 */
export function log(level: LogLevel, message: string, context?: any): void {
  const timestamp = new Date().toISOString();
  const logEntry: LogEntry = {
    timestamp,
    level,
    message,
    ...(context && { context })
  };

  // CRITICAL: Use console.error() to write to stderr, never stdout
  console.error(JSON.stringify(logEntry));
}

/**
 * Log debug message
 */
export function debug(message: string, context?: any): void {
  log(LogLevel.DEBUG, message, context);
}

/**
 * Log info message
 */
export function info(message: string, context?: any): void {
  log(LogLevel.INFO, message, context);
}

/**
 * Log warning message
 */
export function warn(message: string, context?: any): void {
  log(LogLevel.WARN, message, context);
}

/**
 * Log error message
 */
export function error(message: string, context?: any): void {
  log(LogLevel.ERROR, message, context);
}
