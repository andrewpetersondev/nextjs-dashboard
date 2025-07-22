import "server-only";

import type { Database } from "@/db/connection";

/**
 * Generic base repository for CRUD operations.
 * @template TDto - The DTO type returned to the service layer
 * @template TId - The branded ID type
 * @template TCreateInput - The input type for creation
 * @template TUpdateInput - The input type for updates
 */
export abstract class BaseRepository<
  TDto,
  TId,
  TCreateInput = unknown,
  TUpdateInput = unknown,
> {
  protected readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  abstract create(input: TCreateInput): Promise<TDto>;
  abstract read(id: TId): Promise<TDto>;
  abstract update(id: TId, data: TUpdateInput): Promise<TDto>;
  abstract delete(id: TId): Promise<TDto>;
}
