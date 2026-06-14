import { describe, expect, it } from "vitest";
import { createCustomerId } from "@/modules/customers/domain/customer-id.factory";
import { toCustomerId } from "@/modules/customers/domain/customer-id.mappers";
import { isAppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";

const VALID_UUID = "66666666-6666-4666-8666-666666666666";

/**
 * Characterization tests for CustomerId creation.
 *
 * - `createCustomerId` is the Result-returning factory.
 * - `toCustomerId` is the throwing adapter used at boundaries.
 */
describe("CustomerId mappers", () => {
	describe("createCustomerId (Result)", () => {
		it("returns Ok with the branded id for a valid UUID", () => {
			const result = createCustomerId(VALID_UUID);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(String(result.value)).toBe(VALID_UUID);
			}
		});

		it("returns Err with a validation AppError for a non-UUID string", () => {
			const result = createCustomerId("not-a-uuid");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(isAppError(result.error)).toBe(true);
				expect(result.error.key).toBe(APP_ERROR_KEYS.validation);
			}
		});

		it("returns Err for an empty string", () => {
			expect(createCustomerId("").ok).toBe(false);
		});
	});

	describe("toCustomerId (throwing)", () => {
		it("returns the branded id string for a valid UUID", () => {
			expect(String(toCustomerId(VALID_UUID))).toBe(VALID_UUID);
		});

		it("throws an AppError for an invalid UUID", () => {
			try {
				toCustomerId("nope");
				expect.unreachable("toCustomerId should have thrown");
			} catch (error) {
				expect(isAppError(error)).toBe(true);
			}
		});
	});
});
