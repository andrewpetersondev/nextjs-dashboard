import { DEFAULT_TIMEOUT } from "../__fixtures__/constants";
import { DASHBOARD_PATH, LOGIN_PATH } from "../__fixtures__/paths";
import { UI_MATCHERS } from "../__fixtures__/regex";
import { SEL } from "../__fixtures__/selectors";
import { createTestUser } from "../__fixtures__/users";

describe("Login success flow", () => {
  it("logs in and reaches dashboard UI", () => {
    const user = createTestUser();

    // Ensure the user exists through the signup path if needed
    // Attempt signup first for determinism in ephemeral DBs
    cy.signup({
      email: user.email,
      password: user.password,
      username: user.username,
    });

    // Now sign out to test the login success path
    cy.findByRole("button", { name: UI_MATCHERS.SIGN_OUT_BUTTON }).click();

    cy.visit(LOGIN_PATH);
    cy.get(SEL.loginEmail).type(user.email);
    cy.get(SEL.loginPassword).type(user.password);
    cy.get(SEL.loginSubmit).click();

    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", DASHBOARD_PATH);
    cy.findByRole("heading", {
      level: 1,
      name: UI_MATCHERS.DASHBOARD_H1,
    }).should("be.visible");
  });
});
