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
