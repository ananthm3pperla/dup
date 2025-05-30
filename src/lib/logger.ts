import { LogLevel } from '../types';

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = 'info';
  private logBuffer: Array<{ level: LogLevel; message: string; data?: any; timestamp: string }> = [];
  private readonly MAX_BUFFER_SIZE = 1000;

  private constructor() {
    // Initialize error reporting
    window.addEventListener('error', (event) => {
      this.error('Uncaught error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection:', {
        reason: event.reason
      });
    });
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataString = data ? `\nData: ${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataString}`;
  }

  private addToBuffer(level: LogLevel, message: string, data?: any) {
    this.logBuffer.push({
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    });

    // Keep buffer size in check
    if (this.logBuffer.length > this.MAX_BUFFER_SIZE) {
      this.logBuffer.shift();
    }
  }

  error(message: string, error?: any) {
    if (this.shouldLog('error')) {
      const formattedMessage = this.formatMessage('error', message, error);
      console.error(formattedMessage);
      this.addToBuffer('error', message, error);

      // Send to error reporting service if available
      if (window.errorReportingService) {
        window.errorReportingService.captureError(error);
      }
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      const formattedMessage = this.formatMessage('warn', message, data);
      console.warn(formattedMessage);
      this.addToBuffer('warn', message, data);
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      const formattedMessage = this.formatMessage('info', message, data);
      console.info(formattedMessage);
      this.addToBuffer('info', message, data);
    }
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      const formattedMessage = this.formatMessage('debug', message, data);
      console.debug(formattedMessage);
      this.addToBuffer('debug', message, data);
    }
  }

  // Get logs for a specific level
  getLogs(level?: LogLevel): Array<{ level: LogLevel; message: string; data?: any; timestamp: string }> {
    return level 
      ? this.logBuffer.filter(log => log.level === level)
      : this.logBuffer;
  }

  // Clear logs
  clearLogs() {
    this.logBuffer = [];
  }

  // Export logs
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }
}

export const logger = Logger.getInstance();