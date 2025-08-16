### Phase 3: Configuration & Logging (Days 6-7)

#### 3.1 Configuration Management (`src/lib/config/`)

```typescript
// src/lib/config/config.schema.ts
import { z } from "zod";

export const ConfigSchema = z.object({
  app: z.object({
    environment: z.enum(["development", "staging", "production", "test"]),
    logLevel: z.enum(["debug", "info", "warn", "error"]),
    port: z.number().int().positive().default(3000),
  }),
  auth: z.object({
    sessionDuration: z
      .number()
      .positive()
      .default(24 * 60 * 60 * 1000), // 24 hours
    saltRounds: z.number().int().min(8).max(15).default(12),
    jwtExpiration: z.string().default("24h"),
    jwtSecret: z.string().min(32),
  }),
  database: z.object({
    url: z.string().url(),
    maxConnections: z.number().int().positive().default(20),
    queryTimeout: z.number().int().positive().default(30000),
  }),
  cache: z.object({
    defaultTtl: z.number().int().positive().default(300), // 5 minutes
    maxSize: z.number().int().positive().default(1000),
  }),
  features: z.object({
    enableAdvancedAnalytics: z.boolean().default(false),
    enableBulkOperations: z.boolean().default(true),
    newDashboardRollout: z.number().min(0).max(100).default(0), // percentage
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

// src/lib/config/config.service.ts
import { ConfigSchema, type Config } from "./config.schema";

class ConfigService {
  private static instance: ConfigService;
  private config: Config | null = null;

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  load(): Config {
    if (this.config) return this.config;

    const envConfig = {
      app: {
        environment: process.env.NODE_ENV || "development",
        logLevel: process.env.LOG_LEVEL || "info",
        port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
      },
      auth: {
        sessionDuration: process.env.SESSION_DURATION
          ? parseInt(process.env.SESSION_DURATION, 10)
          : undefined,
        saltRounds: process.env.SALT_ROUNDS
          ? parseInt(process.env.SALT_ROUNDS, 10)
          : undefined,
        jwtExpiration: process.env.JWT_EXPIRATION,
        jwtSecret: process.env.JWT_SECRET,
      },
      database: {
        url: process.env.DATABASE_URL,
        maxConnections: process.env.DB_MAX_CONNECTIONS
          ? parseInt(process.env.DB_MAX_CONNECTIONS, 10)
          : undefined,
        queryTimeout: process.env.DB_QUERY_TIMEOUT
          ? parseInt(process.env.DB_QUERY_TIMEOUT, 10)
          : undefined,
      },
      cache: {
        defaultTtl: process.env.CACHE_DEFAULT_TTL
          ? parseInt(process.env.CACHE_DEFAULT_TTL, 10)
          : undefined,
        maxSize: process.env.CACHE_MAX_SIZE
          ? parseInt(process.env.CACHE_MAX_SIZE, 10)
          : undefined,
      },
      features: {
        enableAdvancedAnalytics:
          process.env.ENABLE_ADVANCED_ANALYTICS === "true",
        enableBulkOperations: process.env.ENABLE_BULK_OPERATIONS !== "false",
        newDashboardRollout: process.env.NEW_DASHBOARD_ROLLOUT
          ? parseInt(process.env.NEW_DASHBOARD_ROLLOUT, 10)
          : undefined,
      },
    };

    const result = ConfigSchema.safeParse(envConfig);
    if (!result.success) {
      throw new Error(
        `Configuration validation failed: ${result.error.message}`,
      );
    }

    this.config = result.data;
    return this.config;
  }

  get(): Config {
    if (!this.config) {
      throw new Error("Configuration not loaded. Call load() first.");
    }
    return this.config;
  }
}

export const configService = ConfigService.getInstance();
```

#### 3.2 Enhanced Logging System (`src/lib/logging/`)

```typescript
// src/lib/logging/logger.interface.ts
export interface LogContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  [key: string]: unknown;
}

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  child(bindings: Record<string, unknown>): ILogger;
}

// src/lib/logging/pino.logger.ts
import pino from "pino";
import { ILogger, LogContext } from "./logger.interface";
import { configService } from "../config/config.service";

class PinoLogger implements ILogger {
  private logger: pino.Logger;

  constructor(logger: pino.Logger) {
    this.logger = logger;
  }

  debug(message: string, context: LogContext = {}): void {
    this.logger.debug({ ...context }, message);
  }

  info(message: string, context: LogContext = {}): void {
    this.logger.info({ ...context }, message);
  }

  warn(message: string, context: LogContext = {}): void {
    this.logger.warn({ ...context }, message);
  }

  error(message: string, error?: Error, context: LogContext = {}): void {
    this.logger.error(
      {
        ...context,
        error: error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : undefined,
      },
      message,
    );
  }

  child(bindings: Record<string, unknown>): ILogger {
    return new PinoLogger(this.logger.child(bindings));
  }
}

// Create singleton logger instance
const config = configService.load();
const pinoLogger = pino({
  level: config.app.logLevel,
  transport:
    config.app.environment === "development"
      ? {
          target: "pino-pretty",
          options: { colorize: true },
        }
      : undefined,
});

export const logger: ILogger = new PinoLogger(pinoLogger);

// src/lib/logging/performance.logger.ts
export class PerformanceLogger {
  static startTimer(operation: string, context: LogContext = {}): () => void {
    const start = process.hrtime.bigint();

    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1_000_000; // Convert to ms

      logger.info("Operation completed", {
        ...context,
        operation,
        duration,
        unit: "ms",
      });
    };
  }

  static async timeAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    context: LogContext = {},
  ): Promise<T> {
    const endTimer = this.startTimer(operation, context);
    try {
      const result = await fn();
      endTimer();
      return result;
    } catch (error) {
      endTimer();
      throw error;
    }
  }
}
```
