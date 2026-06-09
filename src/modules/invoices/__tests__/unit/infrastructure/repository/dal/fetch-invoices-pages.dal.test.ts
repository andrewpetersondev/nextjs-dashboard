import { makeReadQueryDb } from "@test-support/mocks/drizzle-db.mock";
import { describe, expect, it } from "vitest";
import { fetchInvoicesPagesDal } from "@/modules/invoices/infrastructure/repository/dal/fetch-invoices-pages.dal";
import { ITEMS_PER_PAGE } from "@/ui/navigation/pagination/pagination.constants";

describe("fetchInvoicesPagesDal", () => {
	it("returns 1 page when no invoices match the query (does not throw)", async () => {
		// Regression guard: count() returns 0 for a no-match search, and the old
		// `if (!total ...)` guard threw on that 0. The 1-page floor is correct.
		const db = makeReadQueryDb([{ count: 0 }]);

		const result = await fetchInvoicesPagesDal(db, "potato");

		expect(result).toBe(1);
	});

	it("computes the page count from the number of matches", async () => {
		const matches = ITEMS_PER_PAGE * 3 + 1;
		const db = makeReadQueryDb([{ count: matches }]);

		const result = await fetchInvoicesPagesDal(db, "Acme");

		expect(result).toBe(4);
	});
});
