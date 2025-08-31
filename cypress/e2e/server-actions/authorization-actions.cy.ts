import { SUCCESS_MESSAGES } from "../__fixtures__/messages-success";
import { SEL } from "../__fixtures__/selectors";
import {
  ADMIN_USERS_PATH,
  DASHBOARD_USERS_PATH,
  SERVER_ACTIONS_PATTERN,
} from "../__fixtures__/server-actions";
import { STATUS_CODES } from "../__fixtures__/status-codes";

describe("Server Action Authorization", () => {
  it("should prevent unauthorized access to admin actions", () => {
    cy.loginAsRegularUser();

    // Try to access admin-only functionality
    cy.request({
      body: { action: "deleteUser", userId: "123" },
      failOnStatusCode: false,
      method: "POST",
      url: ADMIN_USERS_PATH,
    }).then((response) => {
      expect(response.status).to.eq(STATUS_CODES.FORBIDDEN);
    });
  });

  it("should allow admin actions for authorized users", () => {
    cy.loginAsAdmin();
    cy.visit(DASHBOARD_USERS_PATH);

    cy.get(SEL.userRow)
      .first()
      .within(() => {
        cy.get(SEL.suspendUserButton).click();
      });

    cy.intercept("POST", SERVER_ACTIONS_PATTERN).as("adminAction");

    cy.get(SEL.confirmSuspendButton).click();

    cy.wait("@adminAction").then((interception) => {
      expect(interception.response?.statusCode).to.eq(STATUS_CODES.OK);
    });

    cy.findByText(SUCCESS_MESSAGES.USER_SUSPENDED).should("be.visible");
  });
});
