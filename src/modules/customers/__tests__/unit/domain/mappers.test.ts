import { describe, expect, it } from "vitest";
import { toCustomerId } from "@/modules/customers/domain/customer-id.mappers";
import { toFormattedCustomersTableRow } from "@/modules/customers/domain/mappers";
import type { CustomerAggregatesServerDto } from "@/modules/customers/domain/types";

const CUSTOMER_UUID = "77777777-7777-4777-8777-777777777777";

function makeAggregate(
	overrides: Partial<CustomerAggregatesServerDto> = {},
): CustomerAggregatesServerDto {
	return {
		email: "ada@example.com",
		id: toCustomerId(CUSTOMER_UUID),
		imageUrl: "/ada.png",
		name: "Ada Lovelace",
		totalInvoices: 3,
		totalPaid: 2500,
		totalPending: 199,
		...overrides,
	};
}

describe("toFormattedCustomersTableRow", () => {
	it("formats cent totals as USD currency strings and passes other fields through", () => {
		const row = toFormattedCustomersTableRow(makeAggregate());

		expect(row).toEqual({
			email: "ada@example.com",
			id: toCustomerId(CUSTOMER_UUID),
			imageUrl: "/ada.png",
			name: "Ada Lovelace",
			totalInvoices: 3,
			totalPaid: "$25.00",
			totalPending: "$1.99",
		});
	});

	it("formats zero totals as $0.00", () => {
		const row = toFormattedCustomersTableRow(
			makeAggregate({ totalPaid: 0, totalPending: 0 }),
		);

		expect(row.totalPaid).toBe("$0.00");
		expect(row.totalPending).toBe("$0.00");
	});
});
