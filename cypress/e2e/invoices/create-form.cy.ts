import { CREATE_INVOICE_PATH } from "../shared/paths";
import { SEL } from "../shared/selectors";
import { DEFAULT_TIMEOUT } from "../shared/times";

describe("Invoices - Create via Server Action Form", () => {
  beforeEach(() => {
    cy.loginAsDemoAdmin();
  });

  it("creates an invoice from the form and displays the server message", () => {
    cy.visit(CREATE_INVOICE_PATH);

    // Fill in the form
    // Form AutoFills the current date. leave it as is for now.
    cy.get(SEL.dateInput).should("be.visible");
    cy.get(SEL.sensitiveDataInput).clear();
    cy.get(SEL.sensitiveDataInput).type("confidential info");
    cy.get(SEL.customerSelect).should("be.visible").select(1);
    cy.get(SEL.invoiceAmountInput).type("500");
    cy.get("#paid").click();

    cy.get(SEL.createInvoiceSubmitButton).click();

    // Remain on create page (as currently expected in this flow)
    cy.location("pathname", { timeout: DEFAULT_TIMEOUT }).should(
      "eq",
      CREATE_INVOICE_PATH,
    );

    // Assert the server message appears (success)
    cy.get(SEL.createInvoiceSuccessMessage, {
      timeout: DEFAULT_TIMEOUT,
    }).should("be.visible");
  });
});
