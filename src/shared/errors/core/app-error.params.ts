import type { ErrorMetadataValue } from "@/shared/errors/core/error-metadata.value";

/**
 * Options for constructing an application error instance.
 */
export type AppErrorParams<T extends ErrorMetadataValue = ErrorMetadataValue> =
  Readonly<{
    readonly cause: unknown;
    readonly message: string;
    readonly metadata: T;
  }>;

/**
 * Options for {@link makeUnexpectedError} with caller-supplied context.
 */
export type UnexpectedErrorParams<
  T extends ErrorMetadataValue = ErrorMetadataValue,
> = Omit<AppErrorParams<T>, "cause">;
