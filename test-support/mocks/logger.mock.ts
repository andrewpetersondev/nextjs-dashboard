import { type Mocked, vi } from "vitest";
import type { LoggingClientContract } from "@/shared/telemetry/logging/core/logging-client.contract";

/**
 * A typed mock of `LoggingClientContract`. The chainable methods
 * (`child` / `withContext` / `withRequest`) return the same mock by default, so
 * `logger.child({...}).info(...)` works without per-test wiring.
 */
export function makeMockLogger(): Mocked<LoggingClientContract> {
	const logger = {
		child: vi.fn(),
		debug: vi.fn(),
		error: vi.fn(),
		errorWithDetails: vi.fn(),
		info: vi.fn(),
		operation: vi.fn(),
		trace: vi.fn(),
		warn: vi.fn(),
		withContext: vi.fn(),
		withRequest: vi.fn(),
	} as unknown as Mocked<LoggingClientContract>;

	logger.child.mockReturnValue(logger);
	logger.withContext.mockReturnValue(logger);
	logger.withRequest.mockReturnValue(logger);

	return logger;
}
