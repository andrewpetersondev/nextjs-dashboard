import { describe, expect, it } from "vitest";
import { createInvoiceId } from "@/modules/invoices/domain/invoice-id.factory";
import { toInvoiceId } from "@/modules/invoices/domain/invoice-id.mappers";
import { isAppError } from "@/shared/core/errors/core/app-error.entity";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";

const VALID_UUID = "11111111-1111-4111-8111-111111111111";

/**
 * Characterization tests for InvoiceId creation.
 *
 * - `createInvoiceId` is the Result-returning factory (validates a UUID).
 * - `toInvoiceId` is the throwing adapter used at boundaries.
 */
describe("InvoiceId mappers", () => {
	describe("createInvoiceId (Result)", () => {
		it("returns Ok with the branded id for a valid UUID", () => {
			const result = createInvoiceId(VALID_UUID);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(String(result.value)).toBe(VALID_UUID);
			}
		});

		it("returns Err with a validation AppError for a non-UUID string", () => {
			const result = createInvoiceId("not-a-uuid");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(isAppError(result.error)).toBe(true);
				expect(result.error.key).toBe(APP_ERROR_KEYS.validation);
			}
		});

		it("returns Err for a non-string input", () => {
			expect(createInvoiceId(42).ok).toBe(false);
		});
	});

	describe("toInvoiceId (throwing)", () => {
		it("returns the branded id string for a valid UUID", () => {
			expect(String(toInvoiceId(VALID_UUID))).toBe(VALID_UUID);
		});

		it("throws an AppError for an invalid UUID", () => {
			try {
				toInvoiceId("nope");
				expect.unreachable("toInvoiceId should have thrown");
			} catch (error) {
				expect(isAppError(error)).toBe(true);
			}
		});
	});
});
