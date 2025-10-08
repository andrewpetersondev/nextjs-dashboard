// File: src/server/auth/types/session-action.types.ts
import "server-only";

export type EstablishSessionInput = {
  readonly id: string;
  readonly role: string;
};
