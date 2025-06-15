/// <reference types="../../cypress.d.ts" />
/// <reference types="cypress" />

describe("Auth Commands via UI", () => {
	beforeEach(() => {
		cy.fixture("user").then((user) => {
			cy.deleteUser(user.email);
		});
	});

	afterEach(() => {
		cy.fixture("user").then((user) => {
			cy.deleteUser(user.email);
		});
	});

	it("should signup a new user with custom command", () => {
		cy.fixture("user").then((user) => {
			// cy.deleteUser(user.email);
			cy.signup(user);
		});
	});

	it("should login with created user with custom command", () => {
		cy.fixture("user").then((user) => {
			// cy.deleteUser(user.email);
			cy.login(user);
		});
	});
});

describe("Auth Commands via Tasks", () => {
	beforeEach(() => {
		cy.fixture("user").then((user) => {
			cy.deleteUser(user.email);
		});
	});

	afterEach(() => {
		cy.fixture("user").then((user) => {
			cy.deleteUser(user.email);
		});
	});

	it("should create a test user via db:createUser", () => {
		cy.fixture("user").then((user) => {
			cy.createUser(user);
		});
	});

	it("should retrieve a test user via db:findUser", () => {
		cy.fixture("user").then((user) => {
			cy.createUser(user).then(() => {
				// <-- Wait for user creation
				cy.findUser(user.email).then((foundUser) => {
					expect(foundUser).to.not.be.null;
					if (foundUser) {
						expect(foundUser.email).to.eq(user.email);
					}
				});
			});
		});
	});

	it("should delete a test user via db:deleteUser", () => {
		cy.fixture("user").then((user) => {
			cy.deleteUser(user.email);
		});
	});
});
