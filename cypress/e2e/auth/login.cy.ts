import { TEST_USER_CREDENTIALS } from "../../support/types";

describe("UI Login Tests @ /auth/login.cy.ts", () => {
	beforeEach(() => {
		cy.fixture("user").then((user) => {
			cy.deleteUser(user.email);
			cy.createUser(user);
		});
	});

	afterEach(() => {
		cy.fixture("user").then((user) => {
			cy.deleteUser(user.email);
		});
	});

	it("logs in successfully with valid credentials", () => {
		cy.fixture("user").then((user) => {
			cy.login(user, { assertSuccess: true });
		});
	});

	// todo: implement stricter naming for email validation
	it("fails to log in with invalid password", () => {
		cy.fixture("user").then((user) => {
			cy.login({ ...user, password: "WrongPassword123!" });
			cy.get('[data-cy="login-message-errors"]').should(
				"contain",
				"Invalid email or password",
			);
		});
	});

	// todo: implement stricter naming for email validation
	it("fails to log in with invalid email", () => {
		cy.fixture("user").then((user) => {
			cy.login({ ...user, email: "invalidemail@mail.com" });
			cy.get('[data-cy="login-message-errors"]').should(
				"contain",
				"Invalid email or password",
			);
		});
	});

	it("fails to log in with non-existent email", () => {
		cy.fixture("user").then((user) => {
			cy.login({ ...user, email: "nonexistent@mail.com" });
			cy.get('[data-cy="login-message-errors"]').should(
				"contain",
				"Invalid email or password",
			);
		});
	});
});

describe("Login (loginNew command)", () => {
	beforeEach(() => {
		cy.fixture("user").then((user) => {
			cy.deleteUser(user.email);
			cy.createUser(user);
		});
	});

	it("logs in with valid credentials", () => {
		cy.visit("/login");
		cy.loginNew(
			{
				email: "fixtureuser@example.com",
				password: "Password123!",
				username: "fixtureuser",
			},
			{ assertSuccess: true },
		);
	});
});

// these tests fail
describe("Login E2E", () => {
	beforeEach(() => {
		cy.deleteUser(TEST_USER_CREDENTIALS.email);
		cy.createUser({ ...TEST_USER_CREDENTIALS, role: "user" });
	});

	// FAILS:  AssertionError: Timed out retrying after 4000ms: expected 'http://localhost:3000/login' to include '/dashboard'
	it("should log in successfully with valid credentials", () => {
		cy.login(
			{
				email: TEST_USER_CREDENTIALS.email,
				password: TEST_USER_CREDENTIALS.password,
			},
			{ assertSuccess: true },
		);
	});

	// FAILS: AssertionError: Timed out retrying after 4000ms: expected 'http://localhost:3000/login' to include '/dashboard'
	it("should log in using loginNew command", () => {
		cy.visit("/login");
		cy.loginNew(
			{
				email: TEST_USER_CREDENTIALS.email,
				password: TEST_USER_CREDENTIALS.password,
			},
			{ assertSuccess: true },
		);
	});
});
