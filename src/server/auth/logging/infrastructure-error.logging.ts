// infrastructure-error.logging.ts (transaction section refactored)
import "server-only";
import type { DalResultMetadata } from "@/server/auth/logging/dal-context";
import { toSafeErrorShape } from "@/shared/logging/logger.shared";
import type { OperationData } from "@/shared/logging/logger.types";

// Extra shapes used only for logging (keeps domain types clean)
interface TransactionLogExtra extends Record<string, unknown> {
  event: "start" | "commit" | "rollback";
  timestamp: string;
  error?: unknown;
}

type TransactionLogData = OperationData<TransactionLogExtra>;

interface RepositoryLogExtra extends Record<string, unknown> {
  kind: "start" | "success" | "exception";
  error?: unknown;
}

type RepositoryLogData = OperationData<RepositoryLogExtra>;

export const INFRASTRUCTURE_CONTEXTS = {
  dal: {
    demoUserCounter: {
      context: "infrastructure.dal.demo-user-counter" as const,
      success: (role: string, count: number): DalResultMetadata => ({
        details: { count },
        identifiers: { role },
        kind: "success",
      }),
    },
    getUserByEmail: {
      context: "infrastructure.dal.get-user-by-email" as const,
      notFound: (email: string): DalResultMetadata => ({
        identifiers: { email },
        // align with repo login warning kind
        kind: "not_found",
      }),
      success: (email: string): DalResultMetadata => ({
        identifiers: { email },
        kind: "success",
      }),
    },

    insertUser: {
      context: "infrastructure.dal.insert-user" as const,
      duplicate: (email: string): DalResultMetadata => ({
        identifiers: { email },
        kind: "duplicate",
      }),
      success: (email: string): DalResultMetadata => ({
        identifiers: { email },
        kind: "success",
      }),
    },
  },

  errorMapping: {
    context: "infrastructure.error-mapping" as const,
    pgError: (code: string, detail?: string) => ({
      code,
      kind: "pg-error" as const,
      ...(detail && { detail }),
    }),
    unknownError: (err: unknown) => ({
      error: toSafeErrorShape(err),
      kind: "unknown" as const,
    }),
  },

  repository: {
    context: "infrastructure.repository.auth-user" as const,

    // New: centralized exception shape for repository operations
    operationException: (
      operation: string,
      err: unknown,
      identifiers?: Record<string, unknown>,
    ): RepositoryLogData => ({
      error: toSafeErrorShape(err),
      identifiers,
      kind: "exception",
      operation,
    }),

    operationStart: (
      operation: string,
      identifiers?: Record<string, unknown>,
    ): RepositoryLogData => ({
      identifiers,
      kind: "start",
      operation,
    }),

    operationSuccess: (
      operation: string,
      identifiers?: Record<string, unknown>,
    ): RepositoryLogData => ({
      identifiers,
      kind: "success",
      operation,
    }),

    // Back-compat: keep existing helper if it's referenced elsewhere
    transactionError: (err: unknown): RepositoryLogData => ({
      error: toSafeErrorShape(err),
      kind: "exception",
      operation: "transaction",
    }),
  },

  transaction: {
    commit: (transactionId: string): TransactionLogData => ({
      context: "db.transaction",
      event: "commit",
      identifiers: { transactionId },
      operation: "transaction",
      timestamp: new Date().toISOString(),
    }),
    context: "db.transaction" as const,

    rollback: (transactionId: string, error?: unknown): TransactionLogData => ({
      context: "db.transaction",
      event: "rollback",
      identifiers: { transactionId },
      operation: "transaction",
      timestamp: new Date().toISOString(),
      ...(error !== undefined && { error }),
    }),

    start: (transactionId: string): TransactionLogData => ({
      context: "db.transaction",
      event: "start",
      identifiers: { transactionId },
      operation: "transaction",
      timestamp: new Date().toISOString(),
    }),
  },
} as const;
