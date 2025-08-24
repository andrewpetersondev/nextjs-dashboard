import { ERROR_MESSAGES } from "../__fixtures__/constants";

describe.skip("Server Action Validation", () => {
  it("should handle validation errors gracefully", () => {
    cy.loginAsTestUser();
    cy.visit("/dashboard/items");

    cy.get('[data-cy="add-item-button"]').click();
    // Leave required fields empty

    cy.intercept("POST", "/_server-actions/**").as("validationAction");

    cy.get('[data-cy="save-item-button"]').click();

    cy.wait("@validationAction");

    // Check for field-specific error messages
    cy.get('[data-cy="item-name-error"]').should("contain", "Name is required");
    cy.get('[data-cy="item-description-error"]').should(
      "contain",
      "Description is required",
    );
  });

  it("should prevent duplicate entries", () => {
    cy.loginAsTestUser();
    cy.createTestItem("Duplicate Item");

    cy.visit("/dashboard/items");
    cy.get('[data-cy="add-item-button"]').click();
    cy.get('[data-cy="item-name-input"]').type("Duplicate Item");
    cy.get('[data-cy="item-description-input"]').type("Description");

    cy.intercept("POST", "/_server-actions/**").as("duplicateAction");

    cy.get('[data-cy="save-item-button"]').click();

    cy.wait("@duplicateAction");
    cy.findByText(ERROR_MESSAGES.ITEM_ALREADY_EXISTS).should("be.visible");
  });
});
