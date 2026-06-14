import { describe, expect, it } from "vitest";
import type {
	CustomerAggregatesRowRaw,
	CustomerSelectRowRaw,
} from "@/modules/customers/domain/types";
import {
	mapCustomerAggregatesRawToDto,
	mapCustomerSelectRawToDto,
} from "@/modules/customers/infrastructure/adapters/customer.mapper";

const CUSTOMER_UUID = "88888888-8888-4888-8888-888888888888";

describe("customer.mapper", () => {
	describe("mapCustomerSelectRawToDto", () => {
		it("brands the id and keeps the name", () => {
			const raw: CustomerSelectRowRaw = { id: CUSTOMER_UUID, name: "Acme" };

			const dto = mapCustomerSelectRawToDto(raw);

			expect(String(dto.id)).toBe(CUSTOMER_UUID);
			expect(dto.name).toBe("Acme");
		});
	});

	describe("mapCustomerAggregatesRawToDto", () => {
		const base: CustomerAggregatesRowRaw = {
			email: "acme@example.com",
			id: CUSTOMER_UUID,
			imageUrl: "/acme.png",
			name: "Acme",
			totalInvoices: 4,
			totalPaid: 5000,
			totalPending: 1000,
		};

		it("maps a fully populated row, branding the id", () => {
			const dto = mapCustomerAggregatesRawToDto(base);

			expect(dto).toEqual({
				email: "acme@example.com",
				id: dto.id,
				imageUrl: "/acme.png",
				name: "Acme",
				totalInvoices: 4,
				totalPaid: 5000,
				totalPending: 1000,
			});
			expect(String(dto.id)).toBe(CUSTOMER_UUID);
		});

		it("normalizes null SUM totals to 0", () => {
			const dto = mapCustomerAggregatesRawToDto({
				...base,
				totalPaid: null,
				totalPending: null,
			});

			expect(dto.totalPaid).toBe(0);
			expect(dto.totalPending).toBe(0);
		});
	});
});
