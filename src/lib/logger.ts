type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = import.meta.env.DEV;

const formatEntry = (level: LogLevel, message: string, context?: string): string => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const contextStr = context ? `[${context}]` : '';
  const levelEmoji = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌'
  }[level];
  
  return `${timestamp} ${levelEmoji} ${contextStr} ${message}`;
};

export const logger = {
  debug: (message: string, data?: unknown, context?: string): void => {
    if (isDevelopment) {
      console.log(formatEntry('debug', message, context), data !== undefined ? data : '');
    }
  },
  
  info: (message: string, data?: unknown, context?: string): void => {
    console.info(formatEntry('info', message, context), data !== undefined ? data : '');
  },
  
  warn: (message: string, data?: unknown, context?: string): void => {
    console.warn(formatEntry('warn', message, context), data !== undefined ? data : '');
  },
  
  error: (message: string, error?: unknown, context?: string): void => {
    console.error(formatEntry('error', message, context), error || '');
  },
};

export default logger;
