import { SUCCESS_MESSAGES } from "../__fixtures__/messages-success";
import { STATUS_CODES } from "../__fixtures__/status-codes";

describe.skip("Server Action Authorization", () => {
  it("should prevent unauthorized access to admin actions", () => {
    cy.loginAsRegularUser();

    // Try to access admin-only functionality
    cy.request({
      body: { action: "deleteUser", userId: "123" },
      failOnStatusCode: false,
      method: "POST",
      url: "/admin/users",
    }).then((response) => {
      expect(response.status).to.eq(STATUS_CODES.FORBIDDEN);
    });
  });

  it("should allow admin actions for authorized users", () => {
    cy.loginAsAdmin();
    cy.visit("/admin/users");

    cy.get('[data-cy="user-row"]')
      .first()
      .within(() => {
        cy.get('[data-cy="suspend-user-button"]').click();
      });

    cy.intercept("POST", "/_server-actions/**").as("adminAction");

    cy.get('[data-cy="confirm-suspend-button"]').click();

    cy.wait("@adminAction").then((interception) => {
      expect(interception.response?.statusCode).to.eq(STATUS_CODES.OK);
    });

    cy.findByText(SUCCESS_MESSAGES.USER_SUSPENDED).should("be.visible");
  });
});
