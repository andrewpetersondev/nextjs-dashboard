import { TEN_SECONDS } from "../shared/times";
import { DEMO_USER } from "../shared/users";

describe("Signup custom command via Auth Form", () => {
  const { username, email, password } = DEMO_USER;
  const signupCreds = { email, password, username };

  beforeEach(() => {
    cy.logEnv();
    cy.task("db:deleteUser", signupCreds.email, { timeout: TEN_SECONDS });
  });

  it("signs up a new user with Signup Form", () => {
    cy.signup(signupCreds);
    cy.logoutViaForm();
  });
});
