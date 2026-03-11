import { DASHBOARD_PATH } from "@cypress/e2e/shared/paths";
import { TEN_SECONDS } from "@cypress/e2e/shared/times";
import { DEMO_USER } from "@cypress/e2e/shared/users";

describe("Signup custom command via Auth Form", () => {
	const { username, email, password } = DEMO_USER;
	const signupCreds = { email, password, username };

	beforeEach(() => {
		cy.logEnv();
		cy.task("db:deleteUser", signupCreds.email, { timeout: TEN_SECONDS });
	});

	it("signs up a new user with Signup Form", () => {
		cy.signup(signupCreds);
		cy.location("pathname", { timeout: TEN_SECONDS }).should(
			"include",
			DASHBOARD_PATH,
		);
	});
});
