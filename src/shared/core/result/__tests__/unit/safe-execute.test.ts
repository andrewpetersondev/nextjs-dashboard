import { makeMockLogger } from "@test-support/mocks/logger.mock";
import { describe, expect, it } from "vitest";
import { isAppError } from "@/shared/core/errors/core/app-error.entity";
import { makeUnexpectedError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/result/result";
import { safeExecute } from "@/shared/core/result/safe-execute";

/**
 * Unit tests for `safeExecute` (`safe-execute.ts`).
 *
 * safeExecute is the async boundary wrapper: it runs a thunk returning a Result
 * and converts any *thrown* value into a logged `Err`. Contract under test:
 *  - resolved Results (Ok or Err) pass through verbatim, with NO logging;
 *  - a thrown AppError is logged and returned as-is (never re-wrapped);
 *  - an unknown throw is normalized to an 'unexpected' AppError and logged.
 */
describe("safeExecute", () => {
	const baseOptions = {
		message: "operation failed",
		operation: "test.op",
	} as const;

	it("returns an Ok result unchanged and does not log", async () => {
		const logger = makeMockLogger();

		const result = await safeExecute(() => Promise.resolve(Ok("value")), {
			...baseOptions,
			logger,
		});

		expect(result).toEqual({ ok: true, value: "value" });
		expect(logger.errorWithDetails).not.toHaveBeenCalled();
	});

	it("returns a resolved Err verbatim and does not log (only throws are caught)", async () => {
		const logger = makeMockLogger();
		const error = makeUnexpectedError(new Error("inner"), {
			message: "inner",
		});

		const result = await safeExecute(() => Promise.resolve(Err(error)), {
			...baseOptions,
			logger,
		});

		expect(result).toEqual({ error, ok: false });
		expect(logger.errorWithDetails).not.toHaveBeenCalled();
	});

	it("passes a thrown AppError through untouched and logs it once", async () => {
		const logger = makeMockLogger();
		const thrown = makeUnexpectedError(new Error("boom"), {
			message: "boom",
		});

		const result = await safeExecute(() => Promise.reject(thrown), {
			...baseOptions,
			logger,
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			// Same instance — not normalized/re-wrapped.
			expect(result.error).toBe(thrown);
		}
		expect(logger.errorWithDetails).toHaveBeenCalledTimes(1);
		expect(logger.errorWithDetails).toHaveBeenCalledWith(
			"operation failed",
			thrown,
			{ operation: "test.op" },
		);
	});

	it("normalizes an unknown thrown value into an unexpected AppError and logs it", async () => {
		const logger = makeMockLogger();

		const result = await safeExecute(
			() => Promise.reject(new Error("raw failure")),
			{ ...baseOptions, logger },
		);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(isAppError(result.error)).toBe(true);
			// message comes from options, not the raw thrown error.
			expect(result.error.message).toBe("operation failed");
			expect(result.error.metadata).toMatchObject({ operation: "test.op" });
		}
		expect(logger.errorWithDetails).toHaveBeenCalledTimes(1);
	});
});
