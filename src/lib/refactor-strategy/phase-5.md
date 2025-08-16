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
