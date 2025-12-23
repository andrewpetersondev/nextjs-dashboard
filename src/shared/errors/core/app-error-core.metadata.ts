import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import type { AppErrorSchema } from "@/shared/errors/core/app-error.schema";

export type AppErrorCoreMetadata = Readonly<
  AppErrorSchema & {
    readonly key: AppErrorKey;
  }
>;
