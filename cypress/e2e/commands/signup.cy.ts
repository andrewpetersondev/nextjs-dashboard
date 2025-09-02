import { DASHBOARD_PATH } from "../shared/paths";
import { TEN_SECONDS } from "../shared/times";
import { DEMO_USER } from "../shared/users";

describe("Signup custom command", () => {
  const { username, email, password } = DEMO_USER;
  const creds = { email, password, username };

  beforeEach(() => {
    cy.logEnv();
    cy.task("db:deleteUser", null, { timeout: TEN_SECONDS });
  });

  it("signs up a new user and navigates to dashboard", () => {
    cy.signup(creds);
    cy.location("pathname", { timeout: TEN_SECONDS }).should(
      "include",
      DASHBOARD_PATH,
    );
  });
});
