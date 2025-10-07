import "server-only";

import type {
  CacheError,
  CryptoError,
  DatabaseError,
} from "@/server/errors/infrastructure-errors";
import type {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-errors";

/**
 * Layer identifiers for diagnostics.
 */
export type LayerKind = "ui" | "action" | "service" | "repository" | "dal";

/**
 * Common, layer-tagged error shape (throwing style).
 */
export type LayerError =
  | ValidationError
  | ConflictError
  | UnauthorizedError
  | DatabaseError
  | CacheError
  | CryptoError;

/**
 * Return-style error discriminated unions per layer.
 * Keep them narrow and serializable for client edges.
 */
export type UiError =
  | { layer: "ui"; kind: "Validation"; message: string }
  | { layer: "ui"; kind: "Unauthorized"; message: string }
  | { layer: "ui"; kind: "Service"; message: string };

export type ActionError =
  | { layer: "action"; kind: "Validation"; message: string }
  | { layer: "action"; kind: "Unauthorized"; message: string }
  | { layer: "action"; kind: "Service"; message: string };

export type ServiceError =
  | { layer: "service"; kind: "Conflict"; message: string }
  | { layer: "service"; kind: "Validation"; message: string }
  | { layer: "service"; kind: "Repository"; message: string };

export type RepositoryError =
  | { layer: "repository"; kind: "Database"; message: string }
  | { layer: "repository"; kind: "CreateFailed"; message: string }
  | { layer: "repository"; kind: "Infrastructure"; message: "REDACTED" };

export type DalError =
  | { layer: "dal"; kind: "Database"; message: string }
  | { layer: "dal"; kind: "Conflict"; message: string };
