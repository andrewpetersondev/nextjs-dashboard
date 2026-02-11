import "server-only";

/**
 * Shared tokens for transaction logging contexts.
 * Used to ensure consistency across infrastructure and application layers.
 */
export const TRANSACTION_LOGGING_CONTEXT = {
  authRepo: "auth:repo",
  authServiceSession: "auth:service:session",
  authTx: "auth:tx",
  invoicesRepo: "invoices:repo",
  invoicesService: "invoices:service",
  usersUseCase: "users:useCase",
} as const;

export type TransactionLoggingContext =
  (typeof TRANSACTION_LOGGING_CONTEXT)[keyof typeof TRANSACTION_LOGGING_CONTEXT];
