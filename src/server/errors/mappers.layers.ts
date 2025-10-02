import "server-only";

import { DatabaseError } from "@/server/errors/infrastructure";
import type {
  ActionError,
  DalError,
  RepositoryError,
  ServiceError,
  UiError,
} from "@/server/errors/types";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain";

/**
 * Map thrown errors to return-style per layer.
 * Useful at boundaries converting throw -> return Result.
 */
export function mapThrownToUiError(e: unknown): UiError {
  if (e instanceof ValidationError) {
    return { kind: "Validation", layer: "ui", message: e.message };
  }
  if (e instanceof UnauthorizedError) {
    return { kind: "Unauthorized", layer: "ui", message: e.message };
  }
  return { kind: "Service", layer: "ui", message: "Unexpected error" };
}

export function mapThrownToActionError(e: unknown): ActionError {
  if (e instanceof ValidationError) {
    return { kind: "Validation", layer: "action", message: e.message };
  }
  if (e instanceof UnauthorizedError) {
    return { kind: "Unauthorized", layer: "action", message: e.message };
  }
  return { kind: "Service", layer: "action", message: "Action failed" };
}

export function mapThrownToServiceError(e: unknown): ServiceError {
  if (e instanceof ConflictError) {
    return { kind: "Conflict", layer: "service", message: e.message };
  }
  if (e instanceof ValidationError) {
    return { kind: "Validation", layer: "service", message: e.message };
  }
  return {
    kind: "Repository",
    layer: "service",
    message: "Repository failure",
  };
}

export function mapThrownToRepositoryError(e: unknown): RepositoryError {
  if (e instanceof DatabaseError) {
    return { kind: "Database", layer: "repository", message: e.message };
  }
  return {
    kind: "CreateFailed",
    layer: "repository",
    message: "Create failed",
  };
}

export function mapThrownToDalError(e: unknown): DalError {
  if (e instanceof ConflictError) {
    return { kind: "Conflict", layer: "dal", message: e.message };
  }
  return {
    kind: "Database",
    layer: "dal",
    message: e instanceof Error ? e.message : "Database error",
  };
}
