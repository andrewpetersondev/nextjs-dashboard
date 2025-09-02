import { DASHBOARD_PATH } from "../shared/paths";
import { DEMO_USER } from "../shared/users";

describe("Login custom command", () => {
  const { username, email, password } = DEMO_USER;
  const signupCreds = { email, password, username };
  const loginCreds = { email, password };

  beforeEach(() => {
    cy.logEnv();
    cy.task("db:deleteUser", signupCreds.email); // will this work?
  });

  it("logs in with valid credentials and navigates to dashboard", () => {
    cy.signup(signupCreds);
    cy.login(loginCreds);
    cy.location("pathname").should("include", DASHBOARD_PATH);
  });

  it("logs in after task creates user in database", () => {
    cy.task("db:createUser", { ...signupCreds, role: "user" });
    cy.login(loginCreds);
    cy.location("pathname").should("include", DASHBOARD_PATH);
  });
});
