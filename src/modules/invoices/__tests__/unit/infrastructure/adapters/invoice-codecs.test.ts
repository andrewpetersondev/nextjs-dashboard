import { describe, expect, it } from "vitest";
import { toCustomerId } from "@/modules/customers/domain/customer-id.mappers";
import type { InvoiceFormDto } from "@/modules/invoices/application/dto/invoice.dto";
import type { InvoiceEntity } from "@/modules/invoices/domain/entities/invoice.entity";
import { toInvoiceId } from "@/modules/invoices/domain/invoice-id.mappers";
import {
	dtoToCreateInvoiceEntity,
	entityToInvoiceDto,
	partialDtoToCreateInvoiceEntity,
} from "@/modules/invoices/infrastructure/adapters/codecs/invoice-codecs";
import { APP_ERROR_KEYS } from "@/shared/core/errors/core/catalog/app-error.registry";
import { toPeriod } from "@/shared/primitives/period/period.mappers";

const CUSTOMER_UUID = "44444444-4444-4444-8444-444444444444";
const INVOICE_UUID = "55555555-5555-4555-8555-555555555555";

function makeEntity(): InvoiceEntity {
	return {
		amount: 12_345,
		customerId: toCustomerId(CUSTOMER_UUID),
		date: new Date("2025-08-12T00:00:00Z"),
		id: toInvoiceId(INVOICE_UUID),
		revenuePeriod: toPeriod("2025-08-01"),
		sensitiveData: "secret",
		status: "paid",
	};
}

function makeFormDto(overrides: Partial<InvoiceFormDto> = {}): InvoiceFormDto {
	return {
		amount: 999,
		customerId: CUSTOMER_UUID,
		date: "2025-08-12",
		sensitiveData: "secret",
		status: "pending",
		...overrides,
	};
}

describe("invoice-codecs", () => {
	describe("entityToInvoiceDto", () => {
		it("strips branding into a plain, transport-ready DTO", () => {
			const dto = entityToInvoiceDto(makeEntity());

			expect(dto).toEqual({
				amount: 12_345,
				customerId: CUSTOMER_UUID,
				date: "2025-08-12",
				id: INVOICE_UUID,
				revenuePeriod: "2025-08-01",
				sensitiveData: "secret",
				status: "paid",
			});
		});

		it("produces only plain serializable values (round-trips through JSON)", () => {
			const dto = entityToInvoiceDto(makeEntity());

			expect(JSON.parse(JSON.stringify(dto))).toEqual(dto);
		});
	});

	describe("dtoToCreateInvoiceEntity", () => {
		it("brands a valid form DTO into a form entity", () => {
			const result = dtoToCreateInvoiceEntity(makeFormDto());

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.amount).toBe(999);
				expect(result.value.status).toBe("pending");
				expect(String(result.value.customerId)).toBe(CUSTOMER_UUID);
				expect(result.value.date).toEqual(new Date("2025-08-12"));
				// revenuePeriod is derived later, not on the form entity.
				expect(result.value).not.toHaveProperty("revenuePeriod");
			}
		});

		it("returns Err for an invalid status", () => {
			const result = dtoToCreateInvoiceEntity(
				makeFormDto({ status: "cancelled" as InvoiceFormDto["status"] }),
			);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.key).toBe(APP_ERROR_KEYS.validation);
			}
		});
	});

	describe("partialDtoToCreateInvoiceEntity", () => {
		it("maps only the provided fields", () => {
			const result = partialDtoToCreateInvoiceEntity({ amount: 500 });

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toEqual({ amount: 500 });
			}
		});

		it("validates status when present and brands customerId", () => {
			const result = partialDtoToCreateInvoiceEntity({
				customerId: CUSTOMER_UUID,
				status: "paid",
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.status).toBe("paid");
				expect(String(result.value.customerId)).toBe(CUSTOMER_UUID);
			}
		});

		it("returns an empty object when given no fields", () => {
			const result = partialDtoToCreateInvoiceEntity({});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toEqual({});
			}
		});

		it("returns Err when the provided status is invalid", () => {
			const result = partialDtoToCreateInvoiceEntity({
				status: "cancelled" as InvoiceFormDto["status"],
			});

			expect(result.ok).toBe(false);
		});
	});
});
