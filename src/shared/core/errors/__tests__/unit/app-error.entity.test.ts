import { describe, expect, it } from "vitest";
import {
	AppError,
	isAppError,
	isAppErrorDto,
} from "@/shared/core/errors/core/app-error.entity";
import { makeAppError } from "@/shared/core/errors/core/factories/app-error.factory";

/**
 * Unit tests for the AppError entity (app-error.entity.ts).
 *
 * AppError is the structured error class threaded through every Result/Err. It
 * derives layer/severity/retryable from the registry, freezes itself and its
 * metadata, and serializes via toDto/fromDto so errors survive the Server Action
 * boundary. These tests pin that contract plus the two type guards.
 */
describe("AppError entity", () => {
	const makeConflict = (): AppError =>
		makeAppError("conflict", {
			cause: "ctx",
			message: "duplicate key",
			metadata: { pgCode: "23505" },
		});

	describe("construction", () => {
		it("derives definition fields from the registry", () => {
			const error = makeConflict();

			expect(error.key).toBe("conflict");
			expect(error.layer).toBe("API");
			expect(error.severity).toBe("WARN");
			expect(error.retryable).toBe(false);
			expect(error.definitionDescription).toBe("Resource state conflict");
			expect(error.message).toBe("duplicate key");
			expect(error.cause).toBe("ctx");
		});

		it("is an Error subclass named AppError", () => {
			const error = makeConflict();

			expect(error).toBeInstanceOf(Error);
			expect(error.name).toBe("AppError");
		});

		it("freezes the instance and its metadata", () => {
			const error = makeConflict();

			expect(Object.isFrozen(error)).toBe(true);
			expect(Object.isFrozen(error.metadata)).toBe(true);
		});
	});

	describe("serialization", () => {
		it("toDto returns a flat, transport-safe shape", () => {
			expect(makeConflict().toDto()).toEqual({
				_isAppError: true,
				description: "Resource state conflict",
				key: "conflict",
				layer: "API",
				message: "duplicate key",
				metadata: { pgCode: "23505" },
				retryable: false,
				severity: "WARN",
			});
		});

		it("fromDto rehydrates an equivalent AppError (round-trip)", () => {
			const original = makeConflict();

			const hydrated = AppError.fromDto(original.toDto());

			expect(hydrated).toBeInstanceOf(AppError);
			expect(hydrated.key).toBe(original.key);
			expect(hydrated.message).toBe(original.message);
			expect(hydrated.metadata).toEqual(original.metadata);
			expect(hydrated.cause).toBe("hydrated");
		});
	});

	describe("isAppError", () => {
		it("is true only for AppError instances", () => {
			expect(isAppError(makeConflict())).toBe(true);
		});

		it.each([
			new Error("x"),
			{ key: "conflict" },
			null,
			"conflict",
			42,
		])("is false for non-AppError value %p", (value) => {
			expect(isAppError(value)).toBe(false);
		});
	});

	describe("isAppErrorDto", () => {
		it("accepts a real DTO and the minimal valid shape", () => {
			expect(isAppErrorDto(makeConflict().toDto())).toBe(true);
			expect(
				isAppErrorDto({ _isAppError: true, key: "conflict", message: "m" }),
			).toBe(true);
		});

		it.each([
			{ key: "conflict", message: "m" }, // missing _isAppError flag
			{ _isAppError: true, message: "m" }, // missing key
			{ _isAppError: true, key: "conflict" }, // missing message
			null,
			"x",
		])("rejects invalid DTO shape %p", (value) => {
			expect(isAppErrorDto(value)).toBe(false);
		});
	});
});
