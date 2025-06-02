
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

/**
 * Centralized logging service for Hi-Bridge application
 */
class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    this.logs.push(entry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    const levelName = LogLevel[level];
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    const errorStr = error ? ` | Error: ${error.message}` : '';

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`[${levelName}] ${message}${contextStr}${errorStr}`);
        break;
      case LogLevel.INFO:
        console.info(`[${levelName}] ${message}${contextStr}${errorStr}`);
        break;
      case LogLevel.WARN:
        console.warn(`[${levelName}] ${message}${contextStr}${errorStr}`);
        break;
      case LogLevel.ERROR:
        console.error(`[${levelName}] ${message}${contextStr}${errorStr}`, error);
        break;
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();

// Set development log level
if (import.meta.env.DEV) {
  logger.setLevel(LogLevel.DEBUG);
}
