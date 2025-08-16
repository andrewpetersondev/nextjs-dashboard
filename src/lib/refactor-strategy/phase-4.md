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
