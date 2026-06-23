import type { LogLevel } from "@/shared/core/config/schemas/env-schemas";
import type { AppErrorSeverity } from "@/shared/core/errors/core/app-error.dto";
import { isAppError } from "@/shared/core/errors/core/app-error.entity";
import type { SafeErrorShape } from "@/shared/telemetry/logging/core/logger.dto";

/**
 * Map domain `Severity` to `LogLevel` with an exhaustive check.
 */
function _mapSeverityToLogLevel(severity: AppErrorSeverity): LogLevel {
	// biome-ignore-start lint/suspicious/noUnnecessaryConditions: Biome mis-resolves the cross-module `keyof typeof` severity union and wrongly flags these cases as unreachable; the switch is exhaustive and correct.
	switch (severity) {
		case "WARN":
			return "warn";
		case "INFO":
			return "info";
		case "ERROR":
			return "error";
		default: {
			const _exhaustive: never = severity;
			return _exhaustive;
		}
	}
	// biome-ignore-end lint/suspicious/noUnnecessaryConditions: end of exhaustive-switch suppression range
}

/**
 * Normalize any `unknown` error into a safe, structured shape for logging.
 *
 * - If it's a AppError, returns it as-is (serialized later by logger).
 * - If it's a standard Error object, returns a POJO with message, name, and stack.
 * - If it's anything else (string, number, etc.), returns the string representation.
 */
export function toSafeErrorShape(err: unknown): SafeErrorShape | unknown {
	if (isAppError(err)) {
		return err;
	}
	if (err instanceof Error) {
		return {
			message: err.message,
			name: err.name,
			...(err.stack && { stack: err.stack }),
		};
	}
	return String(err);
}
