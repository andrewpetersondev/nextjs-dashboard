import {
  CREATE_INVOICE_PATH,
  DASHBOARD_PATH,
  INVOICES_PATH,
} from "../shared/paths";
import { INVOICES_SEL, REVENUES_SEL } from "../shared/selectors";

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
describe("Invoices - Create via Server Action Form", () => {
  beforeEach(() => {
    cy.loginAsDemoAdmin();
  });

  it("creates an invoice from the form and displays it in dashboard and table", () => {
    cy.visit(CREATE_INVOICE_PATH);

    // Choose a customer (first real option; index 0 is the placeholder)
    cy.get(INVOICES_SEL.invoiceCustomerSelect).should("be.visible").select(1);

    // Fill sensitive data (has a default, but we’ll type to be explicit)
    cy.get(INVOICES_SEL.invoiceSensitiveDataInput)
      .should("be.enabled")
      .clear()
      .type("confidential info");

    // Enter amount
    cy.get(INVOICES_SEL.invoiceAmountInput).should("be.visible").type("123.45");

    // Pick status
    cy.get(INVOICES_SEL.invoiceStatusPaid)
      .should("exist")
      .check({ force: true });

    // Submit
    cy.get(INVOICES_SEL.invoiceCreateButton).click();

    // Remain on create page (as currently expected in this flow)
    cy.location("pathname", { timeout: 10_000 }).should(
      "eq",
      CREATE_INVOICE_PATH,
    );

    // Assert the server message appears (success)
    cy.get(INVOICES_SEL.createInvoiceSuccessMessage, {
      timeout: 10_000,
    }).should("be.visible");

    // Go to dashboard and assert latest invoices are visible
    cy.visit(DASHBOARD_PATH);
    cy.get(REVENUES_SEL.latestInvoices, { timeout: 20_000 }).should(
      "be.visible",
    );
    cy.get(REVENUES_SEL.latestInvoicesItem, { timeout: 20_000 })
      .its("length")
      .should("be.greaterThan", 0);

    // Go to invoices table and assert rows are visible
    cy.visit(INVOICES_PATH);
    cy.get(INVOICES_SEL.invoicesTable, { timeout: 20_000 }).should(
      "be.visible",
    );
    cy.get(INVOICES_SEL.invoiceRow, { timeout: 20_000 })
      .its("length")
      .should("be.greaterThan", 0);
  });
});
