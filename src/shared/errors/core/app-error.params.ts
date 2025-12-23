import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import type { AppError } from "@/shared/errors/core/app-error.entity";
import type { AppErrorMetadata } from "@/shared/errors/core/error-metadata.value";

export type AppErrorParams<T extends AppErrorMetadata = AppErrorMetadata> =
  Readonly<{
    readonly cause: AppError | Error | string;
    readonly key: AppErrorKey;
    readonly message: string;
    readonly metadata: T;
  }>;

export type UnexpectedErrorParams<
  T extends AppErrorMetadata = AppErrorMetadata,
> = Omit<AppErrorParams<T>, "cause" | "key">;
