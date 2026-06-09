import { describe, expect, it } from "vitest";
import { isAppError } from "@/shared/core/errors/core/app-error.entity";
import {
	makeAppError,
	makeUnexpectedError,
	normalizeUnknownError,
} from "@/shared/core/errors/core/factories/app-error.factory";

/**
 * Unit tests for the AppError factories (app-error.factory.ts).
 *
 * These are the supported construction paths: makeAppError (the primary one),
 * normalizeUnknownError (catch-block normalization that preserves an existing
 * AppError), and makeUnexpectedError (bug wrapper).
 */
describe("AppError factories", () => {
	describe("makeAppError", () => {
		it("builds an AppError for the given key with registry-derived fields", () => {
			const error = makeAppError("not_found", {
				cause: "ctx",
				message: "missing",
				metadata: {},
			});

			expect(isAppError(error)).toBe(true);
			expect(error.key).toBe("not_found");
			expect(error.layer).toBe("API");
			expect(error.severity).toBe("INFO");
		});
	});

	describe("normalizeUnknownError", () => {
		it("returns an existing AppError unchanged (same instance)", () => {
			const existing = makeAppError("conflict", {
				cause: "c",
				message: "dup",
				metadata: { pgCode: "23505" },
			});

			expect(normalizeUnknownError(existing, "unexpected")).toBe(existing);
		});

		it("wraps a native Error, keeping its message and attaching it as cause", () => {
			const err = new Error("kaboom");

			const normalized = normalizeUnknownError(err, "unexpected");

			expect(normalized.key).toBe("unexpected");
			expect(normalized.message).toBe("kaboom");
			expect(normalized.cause).toBe(err);
		});

		it("captures the original type when wrapping a thrown string", () => {
			const normalized = normalizeUnknownError("just a string", "unknown");

			expect(normalized.key).toBe("unknown");
			expect(normalized.message).toBe("just a string");
			expect(normalized.metadata).toMatchObject({
				originalType: "string",
				originalValue: "just a string",
			});
		});

		it("stringifies a thrown number into the message", () => {
			const normalized = normalizeUnknownError(404, "unknown");

			expect(normalized.message).toBe("404");
			expect(normalized.metadata).toMatchObject({ originalType: "number" });
		});
	});

	describe("makeUnexpectedError", () => {
		it("uses the provided message and merges override metadata", () => {
			const inner = new Error("inner");

			const error = makeUnexpectedError(inner, {
				message: "outer message",
				overrideMetadata: { operation: "saveUser" },
			});

			expect(error.key).toBe("unexpected");
			expect(error.message).toBe("outer message");
			expect(error.metadata).toMatchObject({ operation: "saveUser" });
			expect(error.cause).toBe(inner);
		});

		it("normalizes a non-Error trigger into metadata", () => {
			const error = makeUnexpectedError("raw failure", { message: "wrapped" });

			expect(error.key).toBe("unexpected");
			expect(error.message).toBe("wrapped");
			expect(error.metadata).toMatchObject({ originalType: "string" });
		});
	});
});
