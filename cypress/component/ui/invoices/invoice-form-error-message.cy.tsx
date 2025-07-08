import { InvoiceFormErrorMessage } from "../../../../src/ui/invoices/invoice-form-error-message.tsx"

describe("InvoiceFormErrorMessage Component", () => {
  const defaultProps = {
    id: "test-error-id",
    className: "custom-class",
  };

  it("renders nothing when the error is undefined", () => {
      cy.mount(<InvoiceFormErrorMessage {...defaultProps} error={undefined}/>);
      cy.get('[role="alert"]').should('not.exist');
  });

  it("renders a single error message in a <p> tag", () => {
      cy.mount(<InvoiceFormErrorMessage {...defaultProps} error="Single error message"/>);
      cy.contains("Single error message").should('have.prop', 'tagName', 'P');
  });

  it("renders multiple error messages in a <ul> with <li> items", () => {
    const errors = ["Error 1", "Error 2", "Error 3"];
      cy.mount(<InvoiceFormErrorMessage {...defaultProps} error={errors}/>);
      cy.get('[role="listitem"]').should('have.length', errors.length);
      errors.forEach((error) => {
          cy.get('[role="listitem"]').contains(error).should('exist');
      });
  });

  it("applies the default className if none is provided", () => {
      cy.mount(<InvoiceFormErrorMessage id="test-id" error="Error message"/>);
      cy.get('[role="alert"]').should('have.class', 'mt-2 text-sm text-text-error');
  });

  it("applies a custom className when provided", () => {
      cy.mount(<InvoiceFormErrorMessage {...defaultProps} error="Error message"/>);
      cy.get('[role="alert"]').should('have.class', 'custom-class');
  });

  it("sets the correct id attribute", () => {
      cy.mount(<InvoiceFormErrorMessage {...defaultProps} error="Error message"/>);
      cy.get('[role="alert"]').should('have.attr', 'id', 'test-error-id');
  });
});
