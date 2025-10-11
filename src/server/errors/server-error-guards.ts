import "server-only";
import {
  CacheError,
  CryptoError,
  DatabaseError,
  InfrastructureError,
} from "@/server/errors/infrastructure-errors";

export const isInfrastructureError = (e: unknown): e is InfrastructureError =>
  e instanceof InfrastructureError;

export const isDatabaseError = (e: unknown): e is DatabaseError =>
  e instanceof DatabaseError;

export const isCacheError = (e: unknown): e is CacheError =>
  e instanceof CacheError;

export const isCryptoError = (e: unknown): e is CryptoError =>
  e instanceof CryptoError;

// Generic service error guard: checks for `{ kind: string; message: string }`
export function isServiceErrorLike<
  TKind extends string,
  TError extends { readonly kind: TKind; readonly message: string },
>(e: unknown): e is TError {
  return (
    typeof e === "object" &&
    e !== null &&
    "kind" in e &&
    typeof (e as { kind?: unknown }).kind === "string" &&
    "message" in e &&
    typeof (e as { message?: unknown }).message === "string"
  );
}
