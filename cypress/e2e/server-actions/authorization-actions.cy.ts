import { ADMIN_USERS_PATH, DASHBOARD_USERS_PATH } from "../shared/paths";
import { UI_MATCHERS } from "../shared/regex";
import { STATUS_CODES } from "../shared/status-codes";

describe("Server Action Authorization", () => {
  it("should prevent unauthorized access to admin actions", () => {
    cy.loginAsDemoUser();

    // Regular users should not be able to access the admin users page
    cy.visit(DASHBOARD_USERS_PATH, { failOnStatusCode: false });
    cy.location("pathname").should((pathname) => {
      expect(pathname).not.to.include(DASHBOARD_USERS_PATH);
    });
    // Expect to land on a non-admin screen (e.g., user dashboard)
    cy.findByRole("heading", { name: UI_MATCHERS.DASHBOARD_H1 }).should(
      "be.visible",
    );

    // Attempting an admin-only server action should be forbidden or hidden as 404
    cy.request({
      body: {
        action: "deleteUser",
        userId: "00000000-0000-0000-0000-000000000001",
      },
      failOnStatusCode: false,
      method: "POST",
      url: ADMIN_USERS_PATH,
    }).then((response) => {
      expect([STATUS_CODES.FORBIDDEN, STATUS_CODES.NOT_FOUND]).to.include(
        response.status,
      );
    });
  });

  it("should allow admin actions for authorized users", () => {
    cy.loginAsDemoAdmin();

    // Admins can access the admin users page (optional navigation check)
    cy.visit(DASHBOARD_USERS_PATH, { failOnStatusCode: false });
    cy.location("pathname").should("include", DASHBOARD_USERS_PATH);

    // Focus on authorization: admin should not receive 403 when invoking admin-only action.
    // The resource may or may not exist; both 200 and 404 are acceptable outcomes here.
    cy.request({
      body: {
        action: "deleteUser",
        userId: "00000000-0000-0000-0000-000000000001",
      },
      failOnStatusCode: false,
      method: "POST",
      url: ADMIN_USERS_PATH,
    }).then((response) => {
      expect([STATUS_CODES.OK, STATUS_CODES.NOT_FOUND]).to.include(
        response.status,
      );
    });
  });
});
