import { CREATE_INVOICE_PATH } from "@cypress/e2e/shared/paths";
import {
	COMMON_SEL,
	CUSTOMERS_SEL,
	INVOICES_SEL,
} from "@cypress/e2e/shared/selectors";
import { DEFAULT_TIMEOUT } from "@cypress/e2e/shared/times";

describe("Invoices - Create via Server Action Form", () => {
	before(() => {
		// Deterministic state: seeded customers (for the select) and demo admin.
		cy.dbResetAndSeed();
	});

	beforeEach(() => {
		cy.loginAsDemoAdmin();
	});

	it("creates an invoice from the form and shows the success message", () => {
		cy.visit(CREATE_INVOICE_PATH);

		// Date auto-fills with today; leave it as-is.
		cy.get(COMMON_SEL.dateInput).should("be.visible");
		cy.get(COMMON_SEL.sensitiveDataInput).clear();
		cy.get(COMMON_SEL.sensitiveDataInput).type("confidential info");
		cy.get(CUSTOMERS_SEL.customerSelect).should("be.visible").select(1);
		cy.get(INVOICES_SEL.invoiceAmountInput).type("500");
		cy.get(INVOICES_SEL.invoiceStatusPaid).click();

		cy.get(INVOICES_SEL.createInvoiceSubmitButton).click();

		// Create revalidates but does NOT redirect, so we stay on the create page.
		cy.location("pathname", { timeout: DEFAULT_TIMEOUT }).should(
			"eq",
			CREATE_INVOICE_PATH,
		);

		// ServerMessageMolecule renders the success feedback.
		cy.get(COMMON_SEL.serverMessageSuccess, {
			timeout: DEFAULT_TIMEOUT,
		}).should("be.visible");
	});
});
