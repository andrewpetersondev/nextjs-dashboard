import type { AppErrorLayer } from "@/shared/errors/core/app-error.layers";
import type { Severity } from "@/shared/errors/core/app-error.severity";

export type AppErrorSchema = Readonly<{
  description: string;
  layer: AppErrorLayer;
  retryable: boolean;
  severity: Severity;
}>;
