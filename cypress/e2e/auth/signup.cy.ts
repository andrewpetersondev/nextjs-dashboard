/// <reference types="../../cypress.d.ts" />
/// <reference types="cypress" />

// 1 of 1 tests pass

describe("Signup Tests", () => {
	beforeEach(() => {
		cy.fixture("user").then((user) => {
			cy.deleteUser(user.email).then((deleteResult) => {
				cy.task(
					"logToConsole",
					`Deleting test user before each test: ${deleteResult}`,
				);
			});
		});
	});

	afterEach(() => {
		cy.fixture("user").then((user) => {
			cy.deleteUser(user.email);
		});
	});

	it("registers successfully with valid credentials", () => {
		cy.fixture("user").then((user) => {
			cy.signup(user);
		});
	});
});
