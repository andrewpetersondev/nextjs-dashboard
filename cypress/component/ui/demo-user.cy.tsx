/// <reference types="cypress" />
/// <reference path="../../../cypress.d.ts" />

import DemoUser from "../../../src/ui/auth/demo-user";

describe("<DemoUser />", () => {
	it("renders demo user button", () => {
		cy.mount(<DemoUser text="Sign up as Demo User" />);
		cy.get("button[data-cy=demo-user-button]").should(
			"contain.text",
			"Sign up as Demo User",
		);
	});
});
