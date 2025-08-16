// src/lib/errors/base.error.ts
/**
 * Base class for all application errors.
 * Provides structured error handling with context and HTTP status codes.
 *
 * Documentation (conceptual, minimal code):
 * docs/lib/refactor-strategy/phase-1/1-2-error-handling.md
 */
export abstract class BaseError extends Error {
    abstract readonly code: string;
    abstract readonly statusCode: number;
    public readonly timestamp: Date;

    constructor(
        message: string,
        public readonly context: Record<string, unknown> = {},
        cause?: Error,
    ) {
        // Use native cause when available
        // @ts-expect-error cause is not in some TS libs
        super(message, { cause });
        this.name = new.target.name;
        this.timestamp = new Date();
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, new.target);
        }
    }

    toJSON(): Record<string, unknown> {
        const causeMsg = (this as unknown as { cause?: unknown })?.cause instanceof Error
            ? (this as unknown as { cause: Error }).cause.message
            : undefined;

        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            context: this.context,
            timestamp: this.timestamp.toISOString(),
            ...(causeMsg && { cause: causeMsg }),
        };
    }
}
