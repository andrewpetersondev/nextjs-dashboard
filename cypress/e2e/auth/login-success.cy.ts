import { UI_MATCHERS } from "../__fixtures__/regex";
import { createTestUser } from "../__fixtures__/users";

describe("Login success flow", () => {
  it("logs in and reaches dashboard UI", () => {
    const user = createTestUser();

    cy.signup({
      email: user.email,
      password: user.password,
      username: user.username,
    });

    cy.logoutViaForm();

    cy.login(user.email, user.password);

    // With cy.login now waiting for navigation, the following is optional.
    // Keeping the heading assertion as the main UI guard.
    cy.findByRole("heading", {
      level: 1,
      name: UI_MATCHERS.DASHBOARD_H1,
    }).should("be.visible");
  });
});
