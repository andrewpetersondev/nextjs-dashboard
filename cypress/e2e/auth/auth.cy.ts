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

	it("should log in with created user with custom command", () => {
		cy.fixture("user").then((user) => {
			// cy.deleteUser(user.email);
			cy.login(user);
		});
	});
});

// this is supposed to use tasks but i use custom commands (createUser, findUser, deleteUser, etc.)?????
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
			cy.log("Creating test user", user.email);

			// Always delete the user first to avoid unique constraint errors
			cy.task("db:deleteUser", user.email);

			cy.task("db:createUser", user);
		});
	});

	it("should retrieve a test user via db:findUser", () => {
		cy.fixture("user").then((user) => {
			cy.task("db:deleteUser", user.email); // Ensure user is deleted first

			cy.task("db:createUser", user);

			cy.task("db:findUser", user.email);
		});
	});

	it("should delete a test user via db:deleteUser", () => {
		cy.fixture("user").then((user) => {
			cy.deleteUser(user.email);
		});
	});
});
