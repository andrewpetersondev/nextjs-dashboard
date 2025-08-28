import { DURATION } from "../__fixtures__/constants";
import { ERROR_MESSAGES } from "../__fixtures__/messages-errors";

describe.skip("Server Action Performance", () => {
  it("should handle rate limiting gracefully", () => {
    cy.loginAsTestUser();
    cy.visit("/dashboard/items");

    // Rapidly submit multiple requests
    for (let i = 0; i < 10; i++) {
      cy.get('[data-cy="quick-action-button"]').click();
    }

    cy.findByText(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED).should("be.visible");
  });

  it("should complete actions within reasonable time", () => {
    cy.loginAsTestUser();
    cy.visit("/dashboard/items");

    const startTime = Date.now();

    cy.get('[data-cy="add-item-button"]').click();
    cy.get('[data-cy="item-name-input"]').type("Performance Test Item");
    cy.get('[data-cy="item-description-input"]').type("Description");

    cy.intercept("POST", "/_server-actions/**").as("performanceAction");

    cy.get('[data-cy="save-item-button"]').click();

    cy.wait("@performanceAction").then(() => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      expect(duration).to.be.lessThan(DURATION.FIVE_SECONDS); // 5 second max
    });
  });
});
