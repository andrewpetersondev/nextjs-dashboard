I'll refine your refactor strategy with a logical implementation order and comprehensive details for guiding your refactor process.

# Complete Refactor Strategy for src/lib/

## Current Assessment

**Current Rating: 60/100**

**Strengths:**

- Good TypeScript usage with `as const` assertions
- Clear JSDoc documentation in some areas
- Logical constant grouping
- Basic event system foundation

**Critical Issues:**

- Inconsistent error handling patterns
- Missing comprehensive type safety
- No dependency injection framework
- Limited reusability and testability
- Fragmented utility organization
- No centralized configuration management

## Refactor Implementation Plan

### Phase 1: Foundation Infrastructure (Days 1-3)

Start with the absolute core utilities that everything else depends on.

#### 1.1 Core Types & Result Pattern (`src/lib/core/`)

```typescript
// src/lib/core/result.ts
/**
 * Represents the result of an operation that can either succeed or fail.
 * This replaces throwing exceptions for expected error cases.
 */
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export const Ok = <T>(data: T): Result<T, never> =>
  ({
    success: true,
    data,
  }) as const;

export const Err = <E>(error: E): Result<never, E> =>
  ({
    success: false,
    error,
  }) as const;

/**
 * Utility to safely unwrap a Result, throwing if it's an error.
 * Use sparingly - prefer pattern matching with success/error checks.
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.success) return result.data;
  throw result.error;
};

/**
 * Maps over the success value of a Result.
 */
export const mapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> => {
  return result.success ? Ok(fn(result.data)) : result;
};

/**
 * Chains Results together, useful for sequential operations that can fail.
 */
export const flatMapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> => {
  return result.success ? fn(result.data) : result;
};
```

#### 1.2 Brand Types System (`src/lib/core/brand.ts`)

```typescript
// src/lib/core/brand.ts
/**
 * Creates a branded type to prevent mixing incompatible values.
 * Example: UserId vs InvoiceId are both strings but shouldn't be interchangeable.
 */
export type Brand<T, B> = T & { readonly __brand: B };

export const brand = <T, B>(value: T): Brand<T, B> => value as Brand<T, B>;

/**
 * Type guard to check if a value is of a specific brand.
 */
export const isBrand = <T, B>(
  value: unknown,
  validator: (v: unknown) => v is T,
): value is Brand<T, B> => validator(value);
```

#### 1.3 Enhanced Brand Definitions (`src/lib/types/brands.ts`)

```typescript
// src/lib/types/brands.ts
import { Brand, brand } from "../core/brand";
import { Result, Ok, Err } from "../core/result";

// Domain-specific branded types
export type UserId = Brand<string, "UserId">;
export type Email = Brand<string, "Email">;
export type InvoiceId = Brand<string, "InvoiceId">;
export type TaskId = Brand<string, "TaskId">;
export type CustomerId = Brand<string, "CustomerId">;
export type SessionId = Brand<string, "SessionId">;

// Validation errors
export class BrandValidationError extends Error {
  constructor(
    public readonly brandType: string,
    public readonly value: unknown,
    public readonly reason: string,
  ) {
    super(`Invalid ${brandType}: ${reason}`);
    this.name = "BrandValidationError";
  }
}

// Factory functions with validation
export const createUserId = (
  value: string,
): Result<UserId, BrandValidationError> => {
  if (!value || value.trim().length === 0) {
    return Err(new BrandValidationError("UserId", value, "cannot be empty"));
  }
  if (value.length > 50) {
    return Err(
      new BrandValidationError("UserId", value, "cannot exceed 50 characters"),
    );
  }
  return Ok(brand<string, "UserId">(value.trim()));
};

export const createEmail = (
  value: string,
): Result<Email, BrandValidationError> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return Err(
      new BrandValidationError("Email", value, "invalid email format"),
    );
  }
  return Ok(brand<string, "Email">(value.toLowerCase()));
};

export const createInvoiceId = (
  value: string,
): Result<InvoiceId, BrandValidationError> => {
  if (!value.startsWith("INV-")) {
    return Err(
      new BrandValidationError("InvoiceId", value, "must start with INV-"),
    );
  }
  return Ok(brand<string, "InvoiceId">(value));
};
```

### Phase 2: Error Handling & Validation (Days 4-5)

#### 2.1 Enhanced Error System (`src/lib/errors/`)

```typescript
// src/lib/errors/base.error.ts
/**
 * Base class for all application errors.
 * Provides structured error handling with context and HTTP status codes.
 */
export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  public readonly timestamp: Date;

  constructor(
    message: string,
    public readonly context: Record<string, unknown> = {},
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializes error for logging/API responses.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      ...(this.cause && { cause: this.cause.message }),
    };
  }
}

// src/lib/errors/domain.errors.ts
export class ValidationError extends BaseError {
  readonly code = "VALIDATION_ERROR";
  readonly statusCode = 400;
}

export class NotFoundError extends BaseError {
  readonly code = "NOT_FOUND";
  readonly statusCode = 404;
}

export class UnauthorizedError extends BaseError {
  readonly code = "UNAUTHORIZED";
  readonly statusCode = 401;
}

export class DatabaseError extends BaseError {
  readonly code = "DATABASE_ERROR";
  readonly statusCode = 500;
}

export class CacheError extends BaseError {
  readonly code = "CACHE_ERROR";
  readonly statusCode = 500;
}

export class CryptoError extends BaseError {
  readonly code = "CRYPTO_ERROR";
  readonly statusCode = 500;
}
```

#### 2.2 Validation Framework (`src/lib/validation/`)

```typescript
// src/lib/validation/validator.interface.ts
import { Result } from "../core/result";
import { ValidationError } from "../errors/domain.errors";

export interface Validator<T> {
  validate(value: unknown): Result<T, ValidationError>;
}

export interface ValidationRule<T> {
  test(value: T): boolean;
  message: string;
}

// src/lib/validation/common.validators.ts
export class StringValidator implements Validator<string> {
  constructor(private readonly rules: ValidationRule<string>[] = []) {}

  static required(): ValidationRule<string> {
    return {
      test: (value) => value.trim().length > 0,
      message: "Field is required",
    };
  }

  static minLength(min: number): ValidationRule<string> {
    return {
      test: (value) => value.length >= min,
      message: `Must be at least ${min} characters`,
    };
  }

  static maxLength(max: number): ValidationRule<string> {
    return {
      test: (value) => value.length <= max,
      message: `Must not exceed ${max} characters`,
    };
  }

  validate(value: unknown): Result<string, ValidationError> {
    if (typeof value !== "string") {
      return Err(new ValidationError("Value must be a string"));
    }

    for (const rule of this.rules) {
      if (!rule.test(value)) {
        return Err(new ValidationError(rule.message, { value }));
      }
    }

    return Ok(value);
  }
}
```

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

### Phase 4: Dependency Injection & Security (Days 8-9)

#### 4.1 Dependency Injection Container (`src/lib/di/`)

```typescript
// src/lib/di/container.types.ts
export type ServiceToken<T = unknown> =
  | string
  | symbol
  | (new (...args: any[]) => T);

export type Factory<T> = (...args: any[]) => T;
export type AsyncFactory<T> = (...args: any[]) => Promise<T>;

export interface Registration<T> {
  token: ServiceToken<T>;
  factory: Factory<T> | AsyncFactory<T>;
  singleton?: boolean;
  dependencies?: ServiceToken[];
}

// src/lib/di/container.ts
export class DIError extends Error {
  constructor(
    message: string,
    public readonly token?: ServiceToken,
  ) {
    super(message);
    this.name = "DIError";
  }
}

export class Container {
  private services = new Map<ServiceToken, any>();
  private registrations = new Map<ServiceToken, Registration<any>>();
  private singletons = new Map<ServiceToken, any>();

  register<T>(registration: Registration<T>): void {
    this.registrations.set(registration.token, registration);
  }

  resolve<T>(token: ServiceToken<T>): T {
    // Check if already instantiated singleton
    if (this.singletons.has(token)) {
      return this.singletons.get(token);
    }

    // Check if manually registered
    if (this.services.has(token)) {
      return this.services.get(token);
    }

    // Get registration
    const registration = this.registrations.get(token);
    if (!registration) {
      throw new DIError(`Service not registered: ${String(token)}`, token);
    }

    // Resolve dependencies
    const dependencies =
      registration.dependencies?.map((dep) => this.resolve(dep)) || [];

    // Create instance
    const instance = registration.factory(...dependencies);

    // Cache if singleton
    if (registration.singleton) {
      this.singletons.set(token, instance);
    }

    return instance;
  }

  registerValue<T>(token: ServiceToken<T>, value: T): void {
    this.services.set(token, value);
  }

  clear(): void {
    this.services.clear();
    this.registrations.clear();
    this.singletons.clear();
  }
}

// Global container instance
export const container = new Container();
```

#### 4.2 Security Utilities (`src/lib/security/`)

```typescript
// src/lib/security/crypto.service.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Result, Ok, Err } from "../core/result";
import { CryptoError } from "../errors/domain.errors";
import { configService } from "../config/config.service";

export class CryptoService {
  static async hashPassword(
    password: string,
  ): Promise<Result<string, CryptoError>> {
    try {
      const config = configService.get();
      const hash = await bcrypt.hash(password, config.auth.saltRounds);
      return Ok(hash);
    } catch (error) {
      return Err(new CryptoError("Password hashing failed", { error }));
    }
  }

  static async comparePassword(
    password: string,
    hash: string,
  ): Promise<Result<boolean, CryptoError>> {
    try {
      const isValid = await bcrypt.compare(password, hash);
      return Ok(isValid);
    } catch (error) {
      return Err(new CryptoError("Password comparison failed", { error }));
    }
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  static generateUUID(): string {
    return crypto.randomUUID();
  }

  static async hashData(
    data: string,
    algorithm: string = "sha256",
  ): Promise<string> {
    return crypto.createHash(algorithm).update(data).digest("hex");
  }
}

// src/lib/security/sanitizer.service.ts
export class SanitizerService {
  /**
   * Sanitize string input to prevent XSS attacks
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, "") // Remove basic HTML brackets
      .replace(/javascript:/gi, "") // Remove javascript: protocols
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim();
  }

  /**
   * Sanitize object keys and string values recursively
   */
  static sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = this.sanitizeString(key);

      if (typeof value === "string") {
        sanitized[sanitizedKey] = this.sanitizeString(value);
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        sanitized[sanitizedKey] = this.sanitizeObject(
          value as Record<string, unknown>,
        );
      } else {
        sanitized[sanitizedKey] = value;
      }
    }

    return sanitized;
  }
}
```

### Phase 5: Data Layer & Caching (Days 10-12)

#### 5.1 Enhanced Repository Pattern (`src/lib/repository/`)

```typescript
// src/lib/repository/interfaces.ts
import { Result } from "../core/result";
import { DatabaseError } from "../errors/domain.errors";

export interface Repository<TEntity, TId> {
  findById(id: TId): Promise<Result<TEntity | null, DatabaseError>>;
  findMany(
    criteria?: Partial<TEntity>,
  ): Promise<Result<TEntity[], DatabaseError>>;
  save(entity: TEntity): Promise<Result<TEntity, DatabaseError>>;
  update(
    id: TId,
    updates: Partial<TEntity>,
  ): Promise<Result<TEntity, DatabaseError>>;
  delete(id: TId): Promise<Result<void, DatabaseError>>;
}

export interface UnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}

export interface QueryBuilder<T> {
  where(field: keyof T, operator: string, value: unknown): QueryBuilder<T>;
  orderBy(field: keyof T, direction: "ASC" | "DESC"): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  offset(count: number): QueryBuilder<T>;
  execute(): Promise<Result<T[], DatabaseError>>;
}

// src/lib/repository/base.repository.ts
export abstract class BaseRepository<TEntity, TId>
  implements Repository<TEntity, TId>
{
  constructor(
    protected readonly tableName: string,
    protected readonly db: any, // Replace with your DB client type
  ) {}

  abstract findById(id: TId): Promise<Result<TEntity | null, DatabaseError>>;
  abstract findMany(
    criteria?: Partial<TEntity>,
  ): Promise<Result<TEntity[], DatabaseError>>;
  abstract save(entity: TEntity): Promise<Result<TEntity, DatabaseError>>;
  abstract update(
    id: TId,
    updates: Partial<TEntity>,
  ): Promise<Result<TEntity, DatabaseError>>;
  abstract delete(id: TId): Promise<Result<void, DatabaseError>>;

  protected handleDbError(error: unknown, operation: string): DatabaseError {
    return new DatabaseError(`Database operation failed: ${operation}`, {
      tableName: this.tableName,
      originalError: error,
    });
  }
}
```

#### 5.2 Cache Abstraction Layer (`src/lib/cache/`)

```typescript
// src/lib/cache/cache.interface.ts
import { Result } from "../core/result";
import { CacheError } from "../errors/domain.errors";

export interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export interface ICache {
  get<T>(key: string): Promise<Result<T | null, CacheError>>;
  set<T>(
    key: string,
    value: T,
    ttlMs?: number,
  ): Promise<Result<void, CacheError>>;
  delete(key: string): Promise<Result<void, CacheError>>;
  clear(): Promise<Result<void, CacheError>>;
  invalidatePattern(pattern: string): Promise<Result<void, CacheError>>;
}

// src/lib/cache/memory.cache.ts
export class MemoryCache implements ICache {
  private readonly store = new Map<string, CacheEntry>();
  private readonly maxSize: number;
  private readonly defaultTtl: number;

  constructor(maxSize: number = 1000, defaultTtlMs: number = 300_000) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtlMs;
  }

  async get<T>(key: string): Promise<Result<T | null, CacheError>> {
    try {
      const entry = this.store.get(key);

      if (!entry) {
        return Ok(null);
      }

      if (this.isExpired(entry)) {
        this.store.delete(key);
        return Ok(null);
      }

      return Ok(entry.value as T);
    } catch (error) {
      return Err(new CacheError("Cache get operation failed", { key, error }));
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttlMs?: number,
  ): Promise<Result<void, CacheError>> {
    try {
      // Enforce size limit
      if (this.store.size >= this.maxSize && !this.store.has(key)) {
        this.evictOldest();
      }

      const now = Date.now();
      const expiresAt = now + (ttlMs ?? this.defaultTtl);

      this.store.set(key, {
        value,
        expiresAt,
        createdAt: now,
      });

      return Ok(undefined);
    } catch (error) {
      return Err(new CacheError("Cache set operation failed", { key, error }));
    }
  }

  async delete(key: string): Promise<Result<void, CacheError>> {
    try {
      this.store.delete(key);
      return Ok(undefined);
    } catch (error) {
      return Err(
        new CacheError("Cache delete operation failed", { key, error }),
      );
    }
  }

  async clear(): Promise<Result<void, CacheError>> {
    try {
      this.store.clear();
      return Ok(undefined);
    } catch (error) {
      return Err(new CacheError("Cache clear operation failed", { error }));
    }
  }

  async invalidatePattern(pattern: string): Promise<Result<void, CacheError>> {
    try {
      const regex = new RegExp(pattern);
      const keysToDelete: string[] = [];

      for (const key of this.store.keys()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        this.store.delete(key);
      }

      return Ok(undefined);
    } catch (error) {
      return Err(
        new CacheError("Cache pattern invalidation failed", { pattern, error }),
      );
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.store.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
    }
  }
}
```

### Phase 6: Advanced Features (Days 13-15)

#### 6.1 Feature Flag System (`src/lib/features/`)

```typescript
// src/lib/features/feature-flags.ts
export const FEATURE_FLAGS = {
  ADVANCED_ANALYTICS: "advanced_analytics",
  NEW_DASHBOARD: "new_dashboard",
  BULK_OPERATIONS: "bulk_operations",
  REAL_TIME_NOTIFICATIONS: "real_time_notifications",
} as const;

export type FeatureFlag = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

export interface FeatureFlagContext {
  userId?: string;
  userRole?: string;
  environment?: string;
  [key: string]: unknown;
}

export interface IFeatureFlagService {
  isEnabled(flag: FeatureFlag, context?: FeatureFlagContext): Promise<boolean>;
  getEnabledFeatures(context?: FeatureFlagContext): Promise<FeatureFlag[]>;
}

// src/lib/features/config-based-feature-flags.ts
export class ConfigBasedFeatureFlagService implements IFeatureFlagService {
  constructor(private readonly config: Config) {}

  async isEnabled(
    flag: FeatureFlag,
    context?: FeatureFlagContext,
  ): Promise<boolean> {
    switch (flag) {
      case FEATURE_FLAGS.ADVANCED_ANALYTICS:
        return this.config.features.enableAdvancedAnalytics;

      case FEATURE_FLAGS.BULK_OPERATIONS:
        return this.config.features.enableBulkOperations;

      case FEATURE_FLAGS.NEW_DASHBOARD:
        // Percentage rollout based on user ID hash
        if (!context?.userId) return false;
        const hash = await this.hashUserId(context.userId);
        const percentage = hash % 100;
        return percentage < this.config.features.newDashboardRollout;

      default:
        return false;
    }
  }

  async getEnabledFeatures(
    context?: FeatureFlagContext,
  ): Promise<FeatureFlag[]> {
    const enabled: FeatureFlag[] = [];

    for (const flag of Object.values(FEATURE_FLAGS)) {
      if (await this.isEnabled(flag, context)) {
        enabled.push(flag);
      }
    }

    return enabled;
  }

  private async hashUserId(userId: string): Promise<number> {
    const hash = await CryptoService.hashData(userId);
    return parseInt(hash.slice(0, 8), 16);
  }
}
```

#### 6.2 Health Check System (`src/lib/health/`)

```typescript
// src/lib/health/health-check.interface.ts
export interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  message?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export interface HealthCheck {
  name: string;
  timeout?: number; // milliseconds
  check(): Promise<HealthStatus>;
}

// src/lib/health/health-check.service.ts
export class HealthCheckService {
  private readonly checks = new Map<string, HealthCheck>();
  private readonly defaultTimeout = 5000; // 5 seconds

  register(check: HealthCheck): void {
    this.checks.set(check.name, check);
  }

  unregister(name: string): void {
    this.checks.delete(name);
  }

  async checkSingle(name: string): Promise<HealthStatus> {
    const check = this.checks.get(name);
    if (!check) {
      return {
        status: "unhealthy",
        message: `Health check '${name}' not found`,
        timestamp: new Date(),
      };
    }

    return this.executeWithTimeout(check);
  }

  async checkAll(): Promise<{
    status: "healthy" | "unhealthy" | "degraded";
    checks: Record<string, HealthStatus>;
    timestamp: Date;
  }> {
    const results: Record<string, HealthStatus> = {};
    const promises: Promise<void>[] = [];

    for (const [name, check] of this.checks) {
      promises.push(
        this.executeWithTimeout(check).then((status) => {
          results[name] = status;
        }),
      );
    }

    await Promise.all(promises);

    const overallStatus = this.determineOverallStatus(Object.values(results));

    return {
      status: overallStatus,
      checks: results,
      timestamp: new Date(),
    };
  }

  private async executeWithTimeout(check: HealthCheck): Promise<HealthStatus> {
    const timeout = check.timeout ?? this.defaultTimeout;

    try {
      const promise = check.check();
      const timeoutPromise = new Promise<HealthStatus>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `Health check '${check.name}' timed out after ${timeout}ms`,
            ),
          );
        }, timeout);
      });

      return await Promise.race([promise, timeoutPromise]);
    } catch (error) {
      return {
        status: "unhealthy",
        message: `Health check '${check.name}' failed`,
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
          timeout: timeout,
        },
        timestamp: new Date(),
      };
    }
  }

  private determineOverallStatus(
    statuses: HealthStatus[],
  ): "healthy" | "unhealthy" | "degraded" {
    if (statuses.every((s) => s.status === "healthy")) {
      return "healthy";
    }

    if (statuses.some((s) => s.status === "unhealthy")) {
      return "unhealthy";
    }

    return "degraded";
  }
}

// src/lib/health/checks/database.health-check.ts
export class DatabaseHealthCheck implements HealthCheck {
  readonly name = "database";
  readonly timeout = 3000;

  constructor(private readonly db: any) {} // Replace with your DB client type

  async check(): Promise<HealthStatus> {
    try {
      // Simple query to test database connectivity
      await this.db.raw("SELECT 1");

      return {
        status: "healthy",
        message: "Database connection is healthy",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        message: "Database connection failed",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date(),
      };
    }
  }
}
```

### Phase 7: Migration & Cleanup (Days 16-18)

#### 7.1 Migration Strategy

1. **Update existing files gradually**:
   - Replace error throwing with Result pattern
   - Update imports to use new branded types
   - Integrate with DI container where beneficial

2. **Maintain backward compatibility**:
   - Create adapter functions for existing APIs
   - Add deprecation warnings where appropriate
   - Provide clear migration paths

3. **Update tests**:
   - Refactor existing tests to use new patterns
   - Add comprehensive test coverage for new utilities
   - Create integration tests for complex scenarios

#### 7.2 Updated Constants (`src/lib/constants/`)

```typescript
// src/lib/constants/app.constants.ts
export const APP_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 1,
  },
  TIMEOUTS: {
    API_REQUEST: 30_000,
    DATABASE_QUERY: 10_000,
    CACHE_TTL: 300_000,
    HEALTH_CHECK: 5_000,
  },
  LIMITS: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_BULK_OPERATIONS: 1000,
    MAX_CACHE_SIZE: 1000,
  },
  SECURITY: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  },
} as const;

// Validation functions with Result pattern
export const validatePageSize = (
  size: number,
): Result<number, ValidationError> => {
  if (
    size < APP_CONSTANTS.PAGINATION.MIN_PAGE_SIZE ||
    size > APP_CONSTANTS.PAGINATION.MAX_PAGE_SIZE
  ) {
    return Err(
      new ValidationError(
        `Page size must be between ${APP_CONSTANTS.PAGINATION.MIN_PAGE_SIZE} and ${APP_CONSTANTS.PAGINATION.MAX_PAGE_SIZE}`,
        { pageSize: size },
      ),
    );
  }
  return Ok(size);
};
```

## Testing Strategy

```typescript
// src/lib/__tests__/test-utils.ts
export const createMockLogger = (): ILogger => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn().mockReturnThis(),
});

export const createTestContainer = (): Container => {
  const container = new Container();
  container.registerValue("logger", createMockLogger());
  return container;
};

export const createMockConfig = (overrides: Partial<Config> = {}): Config => ({
  app: {
    environment: "test",
    logLevel: "error",
    port: 3000,
  },
  auth: {
    sessionDuration: 24 * 60 * 60 * 1000,
    saltRounds: 10,
    jwtExpiration: "24h",
    jwtSecret: "test-secret-key-that-is-long-enough",
  },
  database: {
    url: "postgres://test:test@localhost:5432/test",
    maxConnections: 5,
    queryTimeout: 5000,
  },
  cache: {
    defaultTtl: 300,
    maxSize: 100,
  },
  features: {
    enableAdvancedAnalytics: false,
    enableBulkOperations: true,
    newDashboardRollout: 0,
  },
  ...overrides,
});
```

## Documentation Requirements

- **TSDoc for all public APIs**: Every public function, class, and interface
- **Architecture Decision Records (ADRs)**: Document major architectural decisions
- **Migration guides**: Step-by-step guides for breaking changes
- **Performance benchmarks**: Critical path performance measurements
- **Security documentation**: Security best practices and threat model

## Final Implementation Checklist

- [ ] Phase 1: Core infrastructure (Result, Brand types)
- [ ] Phase 2: Error handling & validation framework
- [ ] Phase 3: Configuration management & enhanced logging
- [ ] Phase 4: Dependency injection & security utilities
- [ ] Phase 5: Repository pattern & caching layer
- [ ] Phase 6: Feature flags & health checks
- [ ] Phase 7: Migration of existing code & comprehensive testing
- [ ] Documentation update
- [ ] Performance benchmarking
- [ ] Security audit

## Expected Final Rating: 95+/100

This comprehensive refactor will transform your `src/lib/` folder into an enterprise-grade foundation with:

- **Type Safety**: Comprehensive branded types and Result pattern
- **Error Handling**: Structured error hierarchy with proper context
- **Configuration**: Environment-based configuration with validation
- **Logging**: Structured logging with performance monitoring
- **Security**: Cryptographic utilities and input sanitization
- **Testability**: Dependency injection and comprehensive test utilities
- **Maintainability**: Clear separation of concerns and SOLID principles
- **Performance**: Efficient caching and monitoring systems

Each phase builds upon the previous ones, ensuring a systematic and manageable refactoring process that maintains system stability throughout the transition.

---

This refined strategy provides a detailed, phase-by-phase implementation plan with comprehensive code examples, implementation priorities, and clear success criteria. Each phase is designed to be completed independently while building toward the complete enterprise-grade library structure.
