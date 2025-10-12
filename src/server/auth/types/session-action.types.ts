// File: src/server/auth/types/session-action.types.ts
import "server-only";

/**
 * Input to establishSession action. Shared across auth actions to avoid inline types.
 */
export type EstablishSessionInput = {
  readonly id: string;
  readonly role: string;
};
