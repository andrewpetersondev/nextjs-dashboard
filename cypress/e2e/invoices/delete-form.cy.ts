import { CREATE_INVOICE_PATH, INVOICES_PATH } from "@cypress/e2e/shared/paths";
import {
	COMMON_SEL,
	CUSTOMERS_SEL,
	INVOICES_SEL,
} from "@cypress/e2e/shared/selectors";
import { DEFAULT_TIMEOUT } from "@cypress/e2e/shared/times";

// A distinctive amount so the created invoice is unambiguous in the list.
// Seed amounts are random; an exact "913.27" collision is effectively impossible.
const UNIQUE_AMOUNT = "913.27";

// Seed invoices run from 2025-01 to ~2026-07, and the list is ordered by date
// descending with 10 rows per page. Pin a far-future date (within the input's
// max of 2029-12-31) so the created invoice is always the first row on page 1.
const FUTURE_DATE = "2029-12-31";

// The list renders two tables sharing data-cy="invoice-row": a mobile one
// (md:hidden) and a desktop one (hidden md:table). Only one is shown at a given
// viewport, so scope to the visible rows to avoid acting on the hidden copy.
const VISIBLE_INVOICE_ROW = `${INVOICES_SEL.invoiceRow}:visible`;

describe("Invoices - Delete via Server Action Form", () => {
	beforeEach(() => {
		cy.dbResetAndSeed();
		cy.loginAsDemoAdmin();
	});

	it("deletes an invoice and removes it from the list", () => {
		// Arrange: create a uniquely-priced, future-dated invoice so it sorts to
		// the top of the date-descending list (guaranteed on page 1).
		cy.visit(CREATE_INVOICE_PATH);
		cy.get(COMMON_SEL.dateInput).clear();
		cy.get(COMMON_SEL.dateInput).type(FUTURE_DATE);
		cy.get(CUSTOMERS_SEL.customerSelect).should("be.visible").select(1);
		cy.get(INVOICES_SEL.invoiceAmountInput).type(UNIQUE_AMOUNT);
		cy.get(INVOICES_SEL.invoiceStatusPaid).click();
		cy.get(INVOICES_SEL.createInvoiceSubmitButton).click();
		cy.get(COMMON_SEL.serverMessageSuccess, {
			timeout: DEFAULT_TIMEOUT,
		}).should("be.visible");

		// Act: locate that invoice's row and submit its delete form.
		cy.visit(INVOICES_PATH);
		cy.contains(VISIBLE_INVOICE_ROW, UNIQUE_AMOUNT)
			.find(COMMON_SEL.deleteItemButton)
			.click();

		// Assert: delete redirects back to the list, the row is gone, and the
		// seeded invoices remain (the list must not be emptied).
		cy.location("pathname", { timeout: DEFAULT_TIMEOUT }).should(
			"eq",
			INVOICES_PATH,
		);
		cy.contains(VISIBLE_INVOICE_ROW, UNIQUE_AMOUNT).should("not.exist");
		cy.get(VISIBLE_INVOICE_ROW).should("have.length.greaterThan", 0);
	});
});
