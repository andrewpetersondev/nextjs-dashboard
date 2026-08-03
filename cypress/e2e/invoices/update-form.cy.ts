import { INVOICES_PATH } from "@cypress/e2e/shared/paths";
import { COMMON_SEL, INVOICES_SEL } from "@cypress/e2e/shared/selectors";
import { DEFAULT_TIMEOUT } from "@cypress/e2e/shared/times";

const EDIT_PATH_FRAGMENT = "/edit";

// The list renders two tables sharing data-cy="invoice-row": a mobile one
// (md:hidden) and a desktop one (hidden md:table). Only one is shown at a given
// viewport, so scope to the visible rows to avoid acting on the hidden copy.
const VISIBLE_INVOICE_ROW = `${INVOICES_SEL.invoiceRow}:visible`;

// Opens the first OVERDUE invoice's edit page. Overdue rows are
// stored-pending, so they are guaranteed editable — paid/void invoices are
// terminal since the lifecycle work and render a locked form with no submit
// button (a random first row could be either).
const openFirstInvoiceForEdit = (): void => {
	cy.visit(`${INVOICES_PATH}?status=overdue`);
	cy.get(VISIBLE_INVOICE_ROW).first().find(COMMON_SEL.editItemButton).click();
	cy.location("pathname", { timeout: DEFAULT_TIMEOUT }).should(
		"include",
		EDIT_PATH_FRAGMENT,
	);
};

describe("Invoices - Update via Server Action Form", () => {
	beforeEach(() => {
		cy.dbResetAndSeed();
		cy.loginAsDemoAdmin();
	});

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

		// Negative amounts fail the nonnegative schema server-side.
		cy.get(INVOICES_SEL.invoiceAmountInput).clear();
		cy.get(INVOICES_SEL.invoiceAmountInput).type("-5");
		cy.get(INVOICES_SEL.editInvoiceSubmitButton).click();

		cy.get(COMMON_SEL.serverMessageError, {
			timeout: DEFAULT_TIMEOUT,
		}).should("be.visible");
		cy.location("pathname").should("include", EDIT_PATH_FRAGMENT);
	});
});

// Regression pair: the schema once capped amounts at $10k while seeds
// generated up to $50k (and ~5% $0 rows against a positive-only rule), so
// those rows could never save a field edit. The cap is now $100k and zero is
// valid, with a seed contract test locking the range — these lock the e2e path.
describe("Invoices - Update amount boundaries", () => {
	beforeEach(() => {
		cy.dbResetAndSeed();
		cy.loginAsDemoAdmin();
	});

	it("saves an amount above the retired $10k cap", () => {
		openFirstInvoiceForEdit();

		cy.get(INVOICES_SEL.invoiceAmountInput).clear();
		cy.get(INVOICES_SEL.invoiceAmountInput).type("25000");
		cy.get(INVOICES_SEL.editInvoiceSubmitButton)
			.should("not.be.disabled")
			.click();

		cy.get(COMMON_SEL.serverMessageSuccess, {
			timeout: DEFAULT_TIMEOUT,
		}).should("be.visible");
		// The form re-renders from the round-tripped payload — the large
		// amount survived validation, not just the submit.
		cy.get(INVOICES_SEL.invoiceAmountInput).should("have.value", "25000");
	});

	it("saves a zero amount (seeded $0 rows stay editable)", () => {
		openFirstInvoiceForEdit();

		cy.get(INVOICES_SEL.invoiceAmountInput).clear();
		cy.get(INVOICES_SEL.invoiceAmountInput).type("0");
		cy.get(INVOICES_SEL.editInvoiceSubmitButton).click();

		cy.get(COMMON_SEL.serverMessageSuccess, {
			timeout: DEFAULT_TIMEOUT,
		}).should("be.visible");
		cy.location("pathname").should("include", EDIT_PATH_FRAGMENT);
	});
});
