import "server-only";

import type {
  ActionError,
  DalError,
  RepositoryError,
  ServiceError,
  UiError,
} from "@/server/errors/types";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Return-style helpers using Result<T, E>.
 * These standardize non-throwing flows per layer.
 */
export const ok = <T>(value: T): Result<T, never> => Ok(value);

// Direct factories
export const uiErr = (e: UiError): Result<never, UiError> => Err(e);
export const actionErr = (e: ActionError): Result<never, ActionError> => Err(e);
export const serviceErr = (e: ServiceError): Result<never, ServiceError> =>
  Err(e);
export const repoErr = (e: RepositoryError): Result<never, RepositoryError> =>
  Err(e);
export const dalErr = (e: DalError): Result<never, DalError> => Err(e);

// UI
export const uiValidation = (message: string) =>
  uiErr({ kind: "Validation", layer: "ui", message });
export const uiUnauthorized = (message: string) =>
  uiErr({ kind: "Unauthorized", layer: "ui", message });
export const uiService = (message: string) =>
  uiErr({ kind: "Service", layer: "ui", message });

// Action
export const actionValidation = (message: string) =>
  actionErr({ kind: "Validation", layer: "action", message });
export const actionUnauthorized = (message: string) =>
  actionErr({ kind: "Unauthorized", layer: "action", message });
export const actionService = (message: string) =>
  actionErr({ kind: "Service", layer: "action", message });

// Service
export const serviceConflict = (message: string) =>
  serviceErr({ kind: "Conflict", layer: "service", message });
export const serviceValidation = (message: string) =>
  serviceErr({ kind: "Validation", layer: "service", message });
export const serviceRepository = (message: string) =>
  serviceErr({ kind: "Repository", layer: "service", message });

// Repository
export const repositoryDatabase = (message: string) =>
  repoErr({ kind: "Database", layer: "repository", message });
export const repositoryCreateFailed = (message: string) =>
  repoErr({ kind: "CreateFailed", layer: "repository", message });

// DAL
export const dalDatabase = (message: string) =>
  dalErr({ kind: "Database", layer: "dal", message });
export const dalConflict = (message: string) =>
  dalErr({ kind: "Conflict", layer: "dal", message });
