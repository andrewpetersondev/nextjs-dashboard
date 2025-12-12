export const TRANSACTION_LOGGING_CONTEXT = {
  authRepo: "auth:repo",
  authServiceSession: "auth:service:session",
  invoicesRepo: "invoices:repo",
  invoicesService: "invoices:service",
  usersUseCase: "users:useCase",
} as const;

export type TransactionLoggingContext =
  (typeof TRANSACTION_LOGGING_CONTEXT)[keyof typeof TRANSACTION_LOGGING_CONTEXT];
