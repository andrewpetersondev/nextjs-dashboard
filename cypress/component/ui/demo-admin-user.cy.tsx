/// <reference types="cypress" />
/// <reference path="../../cypress.d.ts" />

import DemoAdminUser from "../../../src/ui/auth/demo-admin-user.tsx";

describe("<DemoAdminUser />", () => {
	it("renders demo admin user button", () => {
		cy.mount(<DemoAdminUser text="Sign up as Demo Admin" />);
		cy.get("button[data-cy=demo-user-button]").should(
			"contain.text",
			"Sign up as Demo Admin",
		);
	});
});
