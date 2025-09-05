// cypress/e2e/invoices/update-form.cy.ts
import { INV_SEL, SEL } from "../../selectors";

describe("Update Invoice", () => {
  // You can replace this with your actual data factory or task
  // Prefer fast, deterministic seeds via cy.task to keep tests stable.
  let seed: {
    invoiceId: string;
    customerName: string;
    otherCustomerName: string;
  };

  before(() => {
    // If you already have tasks, use them here (example names shown).
    // cy.task('db:reset');
    // cy.task('seed:basicData');
    // seed = await cy.task('seed:invoiceForUpdate');
    // Fallback: if no tasks exist, consider creating a new invoice via UI once,
    // then capture its info for editing. (UI-setup-based tests are slower.)
    // For brevity, we’ll assume an invoice exists in the list to edit.
  });

  beforeEach(() => {
    // Log in quickly (stub, SSO, or programmatic login preferred in CI)
    // If you have a custom command, use cy.login()
    // cy.login();
  });

  it("edits an invoice and shows updated values in the list", () => {
    // 1) Go to the invoices page
    cy.visit("/dashboard/invoices");

    // 2) Find a specific invoice row to edit.
    // If you know the customer name or unique text, scope to that row:
    // cy.contains(SEL.invoiceRow, seed.customerName).as('row');
    // Otherwise, act on the first row for demonstration:
    cy.get(SEL.invoiceRow).first().as("row");

    // 3) Click the edit button within that row
    cy.get("@row").find(SEL.editItemButton).click();

    // 4) We’re on the edit page now; modify some fields
    // - Change amount
    cy.get(SEL.invoiceAmountInput).clear().type("123.45");

    // - Change status (use your radio/select approach)
    // If you have IDs for paid/pending:
    cy.get("#paid").click(); // Or use SEL.invoiceStatusPaid if defined
    // Alternatively, if using a radio group with data-cy, click the paid option within it.

    // - Change date
    // Assuming a simple input with [data-cy="date-input"]
    const newDate = "2024-12-31";
    cy.get(SEL.dateInput).clear().type(newDate);

    // - Change sensitive data (if present)
    cy.get(SEL.sensitiveDataInput).clear().type("Updated note");

    // - Change customer (if customer select supports typing or selecting)
    // If it’s a native select, select by visible text or value:
    // cy.get(SEL.customerSelect).select(seed.otherCustomerName);
    // If it’s a custom combobox, use its specific interactions.

    // 5) Submit the form
    cy.get(INV_SEL.editInvoiceSubmitButton).should("not.be.disabled").click();

    // 6) Assert feedback and redirect
    // - If a success message appears, assert it.
    // - If the page navigates back to list, assert URL and refreshed table
    cy.url().should("include", "/dashboard/invoices");

    // 7) Assert updated values are visible in the list
    // Scope to the updated row (if you know the row identity; otherwise assert globally)
    // Example checks:
    cy.contains(SEL.invoiceRow, "123.45").should("exist"); // formatted check may require regex or currency matcher
    cy.contains(SEL.invoiceRow, "Paid").should("exist");
    cy.contains(SEL.invoiceRow, "2024").should("exist"); // refine as needed (e.g., 12/31/2024 or 2024-12-31)

    // Optional: run axe a11y check if you use cypress-axe
    // cy.injectAxe();
    // cy.checkA11y();
  });

  it("shows validation errors when input is invalid", () => {
    cy.visit("/dashboard/invoices");
    cy.get(SEL.invoiceRow).first().as("row");
    cy.get("@row").find(SEL.editItemButton).click();

    // Make the amount invalid (e.g., empty or negative)
    cy.get(SEL.invoiceAmountInput).clear().type("-1");

    cy.get(INV_SEL.editInvoiceSubmitButton).click();

    // Expect validation feedback without navigation
    // Assert error messages near the fields or a general error alert
    cy.contains(/invalid|must be/i).should("exist");
    cy.url().should("include", "/invoices"); // still on edit page
  });
});
