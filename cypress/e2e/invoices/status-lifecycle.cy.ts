import { INVOICES_PATH } from "@cypress/e2e/shared/paths";
import { COMMON_SEL, INVOICES_SEL } from "@cypress/e2e/shared/selectors";
import { DEFAULT_TIMEOUT } from "@cypress/e2e/shared/times";

const EDIT_PATH_FRAGMENT = "/edit";

// The list renders two tables sharing data-cy attributes: a mobile one and a
// desktop one. Scope to visible elements to avoid the hidden copy.
const VISIBLE_INVOICE_ROW = `${INVOICES_SEL.invoiceRow}:visible`;
const VISIBLE_STATUS_BADGE = `${INVOICES_SEL.invoiceStatusBadge}:visible`;

// Overdue rows are stored-pending invoices past their NET-30 due date. The
// seed spans 19 months of dates, so this bucket is reliably non-empty — and
// its rows are guaranteed editable (not terminal).
const OVERDUE_LIST_PATH = `${INVOICES_PATH}?status=overdue`;

const openFirstOverdueInvoiceForEdit = (): void => {
	cy.visit(OVERDUE_LIST_PATH);
	cy.get(VISIBLE_INVOICE_ROW).first().find(COMMON_SEL.editItemButton).click();
	cy.location("pathname", { timeout: DEFAULT_TIMEOUT }).should(
		"include",
		EDIT_PATH_FRAGMENT,
	);
};

describe("Invoices - status lifecycle", () => {
	beforeEach(() => {
		cy.dbResetAndSeed();
		cy.loginAsDemoAdmin();
	});

	it("partitions the list by derived status via the filter pills", () => {
		cy.visit(INVOICES_PATH);

		// Click the Overdue pill: "overdue" is derived at read time (pending AND
		// past due) — it is never a stored status.
		cy.get(INVOICES_SEL.invoiceStatusFilterOverdue).click();
		cy.location("search", { timeout: DEFAULT_TIMEOUT }).should(
			"include",
			"status=overdue",
		);
		cy.get(VISIBLE_STATUS_BADGE, { timeout: DEFAULT_TIMEOUT })
			.should("have.length.at.least", 1)
			.each(($badge) => {
				expect($badge.attr("data-status")).to.eq("overdue");
			});

		// The filter is URL state, so a direct visit works too (shareable).
		cy.visit(`${INVOICES_PATH}?status=paid`);
		cy.get(VISIBLE_STATUS_BADGE, { timeout: DEFAULT_TIMEOUT })
			.should("have.length.at.least", 1)
			.each(($badge) => {
				expect($badge.attr("data-status")).to.eq("paid");
			});
	});

	it("marks a pending invoice as paid via the transition button", () => {
		openFirstOverdueInvoiceForEdit();

		cy.get(INVOICES_SEL.invoiceTransitionPaid).click();

		cy.get(COMMON_SEL.serverMessageSuccess, {
			timeout: DEFAULT_TIMEOUT,
		}).should("be.visible");
		// The lifecycle panel now shows the terminal state with no transitions.
		cy.get(INVOICES_SEL.invoiceStatusTransitionGroup)
			.find(INVOICES_SEL.invoiceStatusBadge)
			.should("have.attr", "data-status", "paid");
		cy.get(INVOICES_SEL.invoiceTransitionPaid).should("not.exist");
	});

	it("voids a pending invoice and locks the terminal record", () => {
		openFirstOverdueInvoiceForEdit();

		cy.get(INVOICES_SEL.invoiceTransitionVoid).click();

		cy.get(COMMON_SEL.serverMessageSuccess, {
			timeout: DEFAULT_TIMEOUT,
		}).should("be.visible");
		// Terminal record: no further transitions, no submit, details frozen.
		// Void (not delete) keeps the row for reporting — it just leaves the
		// customer-facing counts.
		cy.get(INVOICES_SEL.invoiceTransitionPaid).should("not.exist");
		cy.get(INVOICES_SEL.editInvoiceSubmitButton).should("not.exist");
		cy.get(INVOICES_SEL.invoiceAmountInput).should("be.disabled");
	});
});
