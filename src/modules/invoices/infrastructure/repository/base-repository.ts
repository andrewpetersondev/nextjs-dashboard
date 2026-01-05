import "server-only";
import type { AppDatabase } from "@/server/db/db.connection";

/**
 * Generic base repository for CRUD operations.
 * @template TDto - The DTO type returned to the service layer
 * @template TId - The branded ID type
 * @template TCreateInput - The input type for creation
 * @template TUpdateInput - The input type for updates
 */
export abstract class BaseRepository<
  Tdto,
  Tid,
  Tcreateinput = unknown,
  Tupdateinput = unknown,
> {
  protected readonly db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  abstract create(input: Tcreateinput): Promise<Tdto>;
  abstract read(id: Tid): Promise<Tdto>;
  abstract update(id: Tid, data: Tupdateinput): Promise<Tdto>;
  abstract delete(id: Tid): Promise<Tdto>;
}
