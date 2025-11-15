import "server-only";
import { toSafeErrorShape } from "@/shared/logging/logger.shared";

/* -------------------------------------------------------------------------- */
/*                            INFRASTRUCTURE CONTEXTS                         */
/* -------------------------------------------------------------------------- */

export const INFRASTRUCTURE_CONTEXTS = {
  dal: {
    demoUserCounter: {
      context: "infrastructure.dal.demo-user-counter" as const,
      success: (role: string, count: number) => ({
        count,
        kind: "success",
        role,
      }),
      updateFailed: (role: string) => ({ kind: "error", role }),
    },
    getUserByEmail: {
      context: "infrastructure.dal.get-user-by-email" as const,
      notFound: (email: string) => ({ email, kind: "not-found" }),
      success: (email: string) => ({ email, kind: "success" }),
    },

    insertUser: {
      context: "infrastructure.dal.insert-user" as const,
      duplicate: (email: string) => ({ email, kind: "duplicate" }),
      success: (email: string) => ({ email, kind: "success" }),
    },
  },

  errorMapping: {
    context: "infrastructure.error-mapping" as const,
    pgError: (code: string, detail?: string) => ({
      code,
      kind: "pg-error",
      ...(detail && { detail }),
    }),
    unknownError: (err: unknown) => ({
      error: toSafeErrorShape(err),
      kind: "unknown",
    }),
  },
  repository: {
    context: "infrastructure.repository.auth-user" as const,

    operationStart: (
      operation: string,
      identifiers?: Record<string, unknown>,
    ) => ({
      kind: "start",
      operation,
      ...identifiers,
    }),

    operationSuccess: (
      operation: string,
      identifiers?: Record<string, unknown>,
    ) => ({
      kind: "success",
      operation,
      ...identifiers,
    }),

    transactionError: (err: unknown) => ({
      error: toSafeErrorShape(err),
      kind: "exception",
    }),
  },
} as const;

export type InfrastructureContext =
  (typeof INFRASTRUCTURE_CONTEXTS)[keyof typeof INFRASTRUCTURE_CONTEXTS];
