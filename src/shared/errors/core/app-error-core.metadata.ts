import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import type { AppErrorSchema } from "@/shared/errors/core/app-error.schema";

/**
 * Core metadata shared by all errors.
 *
 * @remarks
 * This is intentionally aligned with {@link AppErrorSchema} so adding a field
 * to the registry schema is reflected here automatically.
 */
export type AppErrorCoreMetadata = Readonly<
  AppErrorSchema & {
    readonly key: AppErrorKey;
  }
>;
