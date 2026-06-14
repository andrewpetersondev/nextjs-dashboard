import type { InvoiceRow } from "@database/schema/invoices";
import { describe, expect, it } from "vitest";
import { toCustomerId } from "@/modules/customers/domain/customer-id.mappers";
import type { InvoiceFormEntity } from "@/modules/invoices/domain/entities/invoice.entity";
import { encodePeriodToFirstDay } from "@/modules/invoices/domain/invoice.codecs";
import {
	invoiceFormEntityToServiceEntity,
	rawDbToInvoiceEntity,
} from "@/modules/invoices/infrastructure/adapters/mappers/invoice.mapper";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";

const CUSTOMER_UUID = "22222222-2222-4222-8222-222222222222";
const INVOICE_UUID = "33333333-3333-4333-8333-333333333333";

function makeRow(overrides: Partial<InvoiceRow> = {}): InvoiceRow {
	return {
		amount: 2500,
		customerId: CUSTOMER_UUID,
		date: new Date("2025-08-12T00:00:00Z"),
		id: INVOICE_UUID,
		revenuePeriod: new Date("2025-08-01T00:00:00Z"),
		sensitiveData: "cantTouchThis",
		status: "paid",
		...overrides,
	} as InvoiceRow;
}

describe("invoice.mapper", () => {
	describe("rawDbToInvoiceEntity", () => {
		it("maps a valid row to a branded entity", () => {
			const result = rawDbToInvoiceEntity(makeRow());

			expect(result.ok).toBe(true);
			if (result.ok) {
				const entity = result.value;
				expect(entity.amount).toBe(2500);
				expect(entity.status).toBe("paid");
				expect(entity.sensitiveData).toBe("cantTouchThis");
				expect(entity.date).toEqual(new Date("2025-08-12T00:00:00Z"));
				expect(String(entity.id)).toBe(INVOICE_UUID);
				expect(String(entity.customerId)).toBe(CUSTOMER_UUID);
				expect(encodePeriodToFirstDay(entity.revenuePeriod)).toBe("2025-08-01");
			}
		});

		it("returns Err when the row status is not a valid enum value", () => {
			const result = rawDbToInvoiceEntity(
				makeRow({ status: "cancelled" as InvoiceRow["status"] }),
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.key).toBe(APP_ERROR_KEYS.validation);
			}
		});
	});

	describe("invoiceFormEntityToServiceEntity", () => {
		function makeFormEntity(
			overrides: Partial<InvoiceFormEntity> = {},
		): InvoiceFormEntity {
			return {
				amount: 999,
				customerId: toCustomerId(CUSTOMER_UUID),
				date: new Date("2025-08-23T00:00:00Z"),
				sensitiveData: "secret",
				status: "pending",
				...overrides,
			};
		}

		it("derives revenuePeriod as the first day of the entity's month", () => {
			const result = invoiceFormEntityToServiceEntity(makeFormEntity());

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(encodePeriodToFirstDay(result.value.revenuePeriod)).toBe(
					"2025-08-01",
				);
				// Carries the rest of the form entity through unchanged.
				expect(result.value.amount).toBe(999);
				expect(result.value.status).toBe("pending");
			}
		});

		it("returns Err for an invalid date", () => {
			const result = invoiceFormEntityToServiceEntity(
				makeFormEntity({ date: new Date("not-a-date") }),
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.key).toBe(APP_ERROR_KEYS.validation);
			}
		});
	});
});
