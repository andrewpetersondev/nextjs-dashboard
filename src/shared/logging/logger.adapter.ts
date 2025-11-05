import type { LoggerPort } from "@/shared/logging/logger.port";
import {
  logger as concreteLogger,
  type Logger,
} from "@/shared/logging/logger.shared";

export class LoggerAdapter implements LoggerPort {
  private readonly impl: Logger;

  constructor(impl: Logger = concreteLogger) {
    this.impl = impl;
  }

  withContext(context: string): LoggerPort {
    return new LoggerAdapter(this.impl.withContext(context));
  }

  withRequest(requestId: string): LoggerPort {
    return new LoggerAdapter(this.impl.withRequest(requestId));
  }

  trace<T = unknown>(message: string, data?: T): void {
    this.impl.trace(message, data);
  }

  debug<T = unknown>(message: string, data?: T): void {
    this.impl.debug(message, data);
  }

  info<T = unknown>(message: string, data?: T): void {
    this.impl.info(message, data);
  }

  warn<T = unknown>(message: string, data?: T): void {
    this.impl.warn(message, data);
  }

  error<T = unknown>(message: string, data?: T): void {
    this.impl.error(message, data);
  }
}
