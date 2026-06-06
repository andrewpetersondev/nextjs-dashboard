import { STATUS_CODES } from "@cypress/e2e/shared/status-codes";
import { createTestUser } from "@cypress/e2e/shared/users";

describe("route: GET /api/db/reset", () => {
	it("should reset the database via API and return ok: true", () => {
		cy.request<{
			action: string;
			ok: boolean;
			error?: string;
		}>({
			// Allow assertion-driven failure so we can show error details if any
			failOnStatusCode: false,
			method: "GET",
			url: "/api/db/reset",
		}).then((res) => {
			expect(
				res.status,
				`HTTP status: ${res.status}, body: ${JSON.stringify(res.body)}`,
			).to.eq(STATUS_CODES.ok);
			expect(res.body).to.have.property("action", "reset");
			expect(res.body).to.have.property("ok", true);
		});
	});
});

describe("task: db:reset", () => {
	it("clears users (verified by db:userExists)", () => {
		const user = createTestUser();
		cy.task("db:deleteUser", user.email).then(() => {
			cy.task("db:userExists", user.email).should("eq", false);
			cy.task("db:createUser", user).should("eq", null);
			cy.task("db:userExists", user.email).should("eq", true);
			cy.task("db:reset").should("eq", null);
			cy.task("db:userExists", user.email).should("eq", false);
		});
	});
});
