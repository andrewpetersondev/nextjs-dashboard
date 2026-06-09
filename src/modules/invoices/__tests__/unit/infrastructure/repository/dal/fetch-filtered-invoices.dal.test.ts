import { makeReadQueryDb } from "@test-support/mocks/drizzle-db.mock";
import { describe, expect, it } from "vitest";
import { fetchFilteredInvoicesDal } from "@/modules/invoices/infrastructure/repository/dal/fetch-filtered-invoices.dal";

describe("fetchFilteredInvoicesDal", () => {
	it("returns an empty array when no invoices match the query (does not throw)", async () => {
		// Regression guard: searching a term with no matches (e.g. "potato") used
		// to throw, which surfaced as the "Invoice Error" boundary. An empty
		// result is a valid outcome, not an error.
		const db = makeReadQueryDb([]);

		const result = await fetchFilteredInvoicesDal(db, "potato", 1);

		expect(result).toEqual([]);
	});

	it("returns the matched rows when the query has results", async () => {
		const rows = [{ id: "11111111-1111-4111-8111-111111111111", name: "Acme" }];
		const db = makeReadQueryDb(rows);

		const result = await fetchFilteredInvoicesDal(db, "Acme", 1);

		expect(result).toEqual(rows);
	});
});
