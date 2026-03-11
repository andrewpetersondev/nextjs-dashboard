import { DASHBOARD_PATH } from "@cypress/e2e/shared/paths";
import { TEN_SECONDS } from "@cypress/e2e/shared/times";
import { DEMO_USER } from "@cypress/e2e/shared/users";
import { USER_ROLE } from "@database";

describe("Login custom command via Auth Form", () => {
	const { username, email, password } = DEMO_USER;
	const signupCreds = { email, password, username };
	const loginCreds = { email, password };

	beforeEach(() => {
		cy.logEnv();
		cy.task("db:deleteUser", signupCreds.email, { timeout: TEN_SECONDS });
	});

	it("logs in with valid credentials after signing up with form", () => {
		cy.signup(signupCreds);
		cy.logoutViaForm();
		cy.login(loginCreds);
		cy.location("pathname").should("include", DASHBOARD_PATH);
	});

	it("logs in after task creates user in database", () => {
		cy.task("db:createUser", { ...signupCreds, role: USER_ROLE });
		cy.login(loginCreds);
		cy.location("pathname").should("include", DASHBOARD_PATH);
	});
});
