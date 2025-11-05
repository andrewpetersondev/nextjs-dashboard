export interface LoggerPort {
  withContext(context: string): LoggerPort;
  withRequest(requestId: string): LoggerPort;
  trace<T = unknown>(message: string, data?: T): void;
  debug<T = unknown>(message: string, data?: T): void;
  info<T = unknown>(message: string, data?: T): void;
  warn<T = unknown>(message: string, data?: T): void;
  error<T = unknown>(message: string, data?: T): void;
}
