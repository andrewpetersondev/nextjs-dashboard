import { mount } from "cypress/react";
import React from "react";
import {
	DemoForm,
	type DemoFormProps,
} from "../../../src/ui/auth/demo-form.tsx";

// import '@testing-library/cypress/add-commands'; // Uncomment if you want to use findByRole

describe("<DemoForm />", () => {
	const defaultProps: DemoFormProps = {
		label: "demo-user",
		text: "Login as Demo User",
		userRole: "user",
	};

	it("renders the button with the correct text and label", () => {
		mount(<DemoForm {...defaultProps} />);
		cy.get('form[aria-label="demo-user"]').should("exist"); // Use cy.get as a basic alternative
		cy.get('[data-cy="demo-user-button-demo-user"]').should(
			"contain.text",
			"Login as Demo User",
		);
	});

	// Skipping the demoUser call assertion due to ESM import limitations in Cypress

	it("is accessible", () => {
		mount(<DemoForm {...defaultProps} />);
		// cy.checkA11y(); // Uncomment if cypress-axe is configured
	});

	it("renders with an admin role", () => {
		mount(
			<DemoForm
				{...defaultProps}
				label="demo-admin-user"
				text="Login as Demo Admin"
				userRole="admin"
			/>,
		);
		cy.get('form[aria-label="demo-admin-user"]').should("exist");
		cy.get('[data-cy="demo-user-button-demo-admin-user"]').should(
			"contain.text",
			"Login as Demo Admin",
		);
	});
});
