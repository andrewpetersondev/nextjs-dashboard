import type { AppErrorLayer } from "@/shared/errors/core/app-error.layers";
import type { Severity } from "@/shared/errors/core/app-error.severity";

/**
 * Schema representing the structure of an application-specific error.
 *
 * @remarks
 * This contract is transport-agnostic and mirrors the registry definition so changes stay in sync.
 */
export type AppErrorSchema = Readonly<{
  description: string;
  layer: AppErrorLayer;
  retryable: boolean;
  severity: Severity;
}>;
