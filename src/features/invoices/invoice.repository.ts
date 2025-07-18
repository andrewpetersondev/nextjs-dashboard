import "server-only";

import type { Database } from "@/db/connection";
import type { InvoiceEntity } from "@/db/models/invoice.entity";
import {
  createInvoiceDal,
  deleteInvoiceDal,
  fetchFilteredInvoices,
  readInvoiceDal,
  updateInvoiceDal,
} from "@/features/invoices/invoice.dal";
import type { InvoiceDto } from "@/features/invoices/invoice.dto";
import type {
  InvoiceCreateInput,
  InvoiceUpdateInput,
} from "@/features/invoices/invoice.types";
import type { InvoiceId } from "@/lib/definitions/brands";
import { logger } from "@/lib/utils/logger";

/**
 * Generic repository interface for CRUD operations.
 *
 * @template TEntity - The domain entity type returned by repository methods.
 * @template TCreate - The DTO type for entity creation.
 * @template TUpdate - The DTO type for entity update.
 * @template TId - The branded type for entity ID.
 *
 * @remarks
 * - All methods return Promises for async compatibility.
 * - Use this interface to enforce consistent, type-safe CRUD logic across repositories.
 */
export interface IRepository<TEntity, TCreate, TUpdate, TId> {
  /**
   * Creates a new entity in the data store.
   * @param data - DTO for entity creation.
   * @returns Promise resolving to the created entity, or null if creation fails.
   */
  create(data: TCreate): Promise<TEntity | null>;

  /**
   * Reads an entity by its branded ID.
   * @param id - Branded entity ID.
   * @returns Promise resolving to the entity, or null if not found.
   */
  read(id: TId): Promise<TEntity | null>;

  /**
   * Updates an existing entity by its branded ID.
   * @param id - Branded entity ID.
   * @param data - DTO for entity update.
   * @returns Promise resolving to the updated entity, or null if update fails.
   */
  update(id: TId, data: TUpdate): Promise<TEntity | null>;

  /**
   * Deletes an entity by its branded ID.
   * @param id - Branded entity ID.
   * @returns Promise resolving to the deleted entity, or null if deletion fails.
   */
  delete(id: TId): Promise<TEntity | null>;

  /**
   * Lists entities with optional filtering and pagination.
   * @param query - Optional search query string.
   * @param page - Optional page number for pagination (default: 1).
   * @returns Promise resolving to an array of entities.
   */
  list(query?: string, page?: number): Promise<TEntity[]>;
}

/**
 * Invoice repository implementing generic CRUD operations for the Invoice domain.
 *
 * @implements {IRepository<InvoiceDto, Omit<InvoiceEntity, "id" | "sensitiveData">, { amount: number; status: string; customerId: CustomerId }, InvoiceId>}
 *
 * @remarks
 * - Encapsulates all DAL/database logic for invoices.
 * - Accepts only branded types for safety.
 * - Returns DTOs for UI/API transport.
 * - Use dependency injection for database instance.
 *
 * @example
 * const repo = new InvoiceRepository(getDB());
 * const invoice = await repo.create({ ... });
 */
export class InvoiceRepository {
  private readonly db: Database;
  /**
   * @param db - Database instance (dependency injection for testability)
   */
  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Creates an invoice in the database.
   * @param input - Validated and transformed invoice data.
   * @returns The created InvoiceEntity or null.
   */
  async createRepo(input: InvoiceCreateInput): Promise<InvoiceEntity | null> {
    const insert = createInvoiceDal(this.db, input);
    if (!insert) {
      logger.error({
        context: "InvoiceRepository.createRepo",
        input,
        message: "Failed to create invoice",
      });
      return null;
    }
    return insert;
  }

  /**
   * Reads an invoice by its branded ID.
   * @param id - Branded InvoiceId.
   * @returns Promise resolving to the InvoiceEntity, or null if not found.
   */
  async readRepo(id: InvoiceId): Promise<InvoiceEntity | null> {
    // return readInvoiceDal(this.db, id);
    const read = readInvoiceDal(this.db, id);
    if (!read) {
      logger.error({
        context: "InvoiceRepository.readRepo",
        id,
        message: "Invoice read failed",
      });
      return null;
    }
    return read;
  }

  /**
   * Updates an existing invoice by its branded ID.
   * @param id - Branded InvoiceId.
   * @param data - DTO for invoice update (amount, status, customerId).
   * @returns Promise resolving to the updated InvoiceEntity, or null if update fails.
   */
  async updateRepo(
    id: InvoiceId,
    data: InvoiceUpdateInput,
  ): Promise<InvoiceEntity | null> {
    // return updateInvoiceDal(this.db, id, data);

    const update = updateInvoiceDal(this.db, id, data);
    if (!update) {
      logger.error({
        context: "InvoiceRepository.updateRepo",
        data,
        id,
        message: "Invoice update failed",
      });
      return null;
    }
    return update;
  }

  /**
   * Deletes an invoice by its branded ID.
   * @param id - Branded InvoiceId.
   * @returns Promise resolving to the deleted InvoiceEntity, or null if deletion fails.
   */
  async _deleteRepo(id: InvoiceId): Promise<InvoiceEntity | null> {
    const invoice = deleteInvoiceDal(this.db, id);

    if (!invoice) {
      logger.error({
        context: "InvoiceRepository.deleteRepo",
        id,
        message: "Invoice deletion failed",
      });
      return null;
    }

    return invoice;
  }

  /**
   * Lists invoices with optional filtering and pagination.
   * @param query - Optional search query string (default: "").
   * @param page - Optional page number for pagination (default: 1).
   * @returns Promise resolving to an array of InvoiceDto.
   */
  async _listRepo(query: string = "", page: number = 1): Promise<InvoiceDto[]> {
    return fetchFilteredInvoices(this.db, query, page);
  }
}
