import type { Database } from "@/db/connection";

/**
 * Generic base repository for CRUD operations.
 * @template TEntity - The entity type.
 * @template TId - The branded ID type.
 */
export abstract class BaseRepository<TEntity, TId> {
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  abstract create(input: unknown): Promise<TEntity>;
  abstract read(id: TId): Promise<TEntity>;
  abstract update(id: TId, data: unknown): Promise<TEntity>;
  abstract delete(id: TId): Promise<TEntity>;
}
