import { INVOICES_PATH } from "@cypress/e2e/shared/paths";

describe("Invoices - list", () => {
	beforeEach(() => {
		cy.dbResetAndSeed(); // clean, known state
		cy.loginAsDemoAdmin(); // demo admin exists after seed
	});

	it("shows seeded invoices", () => {
		cy.visit(INVOICES_PATH);
		cy.contains("Paid").should("exist");
	});
});
