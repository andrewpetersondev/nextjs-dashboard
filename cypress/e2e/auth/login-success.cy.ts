import { UI_MATCHERS_REGEX } from "../shared/regex";
import { createTestUser } from "../shared/users";

describe("Login success flow", () => {
  it("logs in and reaches dashboard UI", () => {
    const user = createTestUser();
    const signupCreds = {
      email: user.email,
      password: user.password,
      username: user.username,
    };
    const loginCreds = { email: user.email, password: user.password };

    cy.signup(signupCreds);

    cy.logoutViaForm();

    cy.login(loginCreds);

    // With cy.login now waiting for navigation, the following is optional.
    // Keeping the heading assertion as the main UI guard.
    cy.findByRole("heading", {
      level: 1,
      name: UI_MATCHERS_REGEX.dashboardH1,
    }).should("be.visible");
  });
});
