// File: 'src/shared/core/errors/adapters/app-error-internal.ts'
// Internal helpers (frozen in dev, safe severity, and shape guards)

import { IS_PROD } from "@/shared/config/env-shared";
import type { AppError } from "@/shared/core/result/app-error";

export const freezeDev = <TObj extends object>(obj: TObj): TObj => {
  if (!IS_PROD) {
    Object.freeze(obj);
  }
  return obj;
};

export const toSeverity = (s: unknown): AppError["severity"] | undefined =>
  s === "info" || s === "warn" || s === "error" ? s : undefined;

export const pickOptionalFromLike = (
  v: Partial<AppError>,
): Readonly<Partial<AppError>> => {
  const maybeDetails = v.details !== undefined ? { details: v.details } : {};
  const maybeCause = v.cause !== undefined ? { cause: v.cause } : {};
  const maybeName = v.name ? { name: v.name } : {};
  const maybeStack = v.stack ? { stack: v.stack } : {};
  return {
    ...maybeDetails,
    ...maybeCause,
    ...maybeName,
    ...maybeStack,
  };
};

export const isAppErrorLike = (
  v: unknown,
): v is Pick<AppError, "code" | "message"> & Partial<AppError> => {
  if (typeof v !== "object" || v === null) {
    return false;
  }
  const obj = v as { readonly code?: unknown; readonly message?: unknown };
  return typeof obj.code === "string" && typeof obj.message === "string";
};
