import { TWENTY_SECONDS } from "../__fixtures__/constants";
import { DASHBOARD_PATH } from "../__fixtures__/paths";
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

    cy.url({ timeout: TWENTY_SECONDS }).should("include", DASHBOARD_PATH);
    cy.findByRole("heading", {
      level: 1,
      name: UI_MATCHERS.DASHBOARD_H1,
    }).should("be.visible");
  });
});
