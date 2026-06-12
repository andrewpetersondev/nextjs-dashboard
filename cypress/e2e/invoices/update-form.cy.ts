import { INVOICES_PATH } from "@cypress/e2e/shared/paths";
import { COMMON_SEL, INVOICES_SEL } from "@cypress/e2e/shared/selectors";
import { DEFAULT_TIMEOUT } from "@cypress/e2e/shared/times";

const EDIT_PATH_FRAGMENT = "/edit";

// The list renders two tables sharing data-cy="invoice-row": a mobile one
// (md:hidden) and a desktop one (hidden md:table). Only one is shown at a given
// viewport, so scope to the visible rows to avoid acting on the hidden copy.
const VISIBLE_INVOICE_ROW = `${INVOICES_SEL.invoiceRow}:visible`;

describe("Invoices - Update via Server Action Form", () => {
	beforeEach(() => {
		cy.dbResetAndSeed();
		cy.loginAsDemoAdmin();
	});

	// Opens the first seeded invoice's edit page.
	const openFirstInvoiceForEdit = (): void => {
		cy.visit(INVOICES_PATH);
		cy.get(VISIBLE_INVOICE_ROW).first().find(COMMON_SEL.editItemButton).click();
		cy.location("pathname", { timeout: DEFAULT_TIMEOUT }).should(
			"include",
			EDIT_PATH_FRAGMENT,
		);
	};

	it("edits an invoice and shows a success message", () => {
		openFirstInvoiceForEdit();

		cy.get(INVOICES_SEL.invoiceAmountInput).clear();
		cy.get(INVOICES_SEL.invoiceAmountInput).type("123.45");
		cy.get(INVOICES_SEL.editInvoiceSubmitButton)
			.should("not.be.disabled")
			.click();

		// Update revalidates in place (no redirect) and shows server feedback.
		cy.get(COMMON_SEL.serverMessageSuccess, {
			timeout: DEFAULT_TIMEOUT,
		}).should("be.visible");
		cy.location("pathname").should("include", EDIT_PATH_FRAGMENT);
	});

	it("shows an error message when the amount is invalid", () => {
		openFirstInvoiceForEdit();

		// Amount must be positive, so 0 fails server-side validation.
		cy.get(INVOICES_SEL.invoiceAmountInput).clear();
		cy.get(INVOICES_SEL.invoiceAmountInput).type("0");
		cy.get(INVOICES_SEL.editInvoiceSubmitButton).click();

		cy.get(COMMON_SEL.serverMessageError, {
			timeout: DEFAULT_TIMEOUT,
		}).should("be.visible");
		cy.location("pathname").should("include", EDIT_PATH_FRAGMENT);
	});
});
