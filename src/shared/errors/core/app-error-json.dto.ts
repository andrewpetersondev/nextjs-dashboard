import type { AppErrorCoreMetadata } from "@/shared/errors/core/app-error-core.metadata";
import type { AppErrorMetadata } from "@/shared/errors/core/error-metadata.value";

/**
 * JSON shape for serialization.
 */
export type AppErrorJsonDto<T extends AppErrorMetadata = AppErrorMetadata> =
  Readonly<
    AppErrorCoreMetadata & {
      readonly message: string;
      readonly metadata: T;
    }
  >;
