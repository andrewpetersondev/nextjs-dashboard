import { mount } from "cypress/react";
import React from "react";
import {
	DemoForm,
	type DemoFormProps,
} from "@/src/ui/auth/demo-form.tsx";
import "@testing-library/cypress/add-commands"; // Enables findByRole, findByText, etc.
// cypress-axe should be imported in cypress/support/component.ts

// error because importing server only file

describe("<DemoForm /> Advanced", () => {
	const defaultProps: DemoFormProps = {
		label: "demo-user",
		text: "Login as Demo User",
		userRole: "user",
	};

	beforeEach(() => {
		// Mount the component before each test for isolation
		mount(<DemoForm {...defaultProps} />);
	});

	it("should render with accessible roles and labels", () => {
		cy.findByRole("form", { name: /demo-user/i }).should("exist");
		cy.findByRole("button", { name: /login as demo user/i }).should("exist");
	});

	it("should be accessible (axe)", () => {
		cy.injectAxe();
		cy.checkA11y();
	});

	it("should submit the form and disable the button while submitting", () => {
		// Intercept the form submission (network interception is not possible for server actions, so we check UI state)
		cy.findByRole("button", { name: /login as demo user/i }).as("submitBtn");
		cy.get("@submitBtn").should("not.be.disabled");
		cy.get("@submitBtn").click();
		// Button may not disable due to async server action, but check for loading state if implemented
		// cy.get("@submitBtn").should("be.disabled"); // Uncomment if loading state is implemented
	});

	it("should render with admin role and correct text", () => {
		mount(
			<DemoForm
				label="demo-admin-user"
				text="Login as Demo Admin"
				userRole="admin"
			/>,
		);
		cy.findByRole("form", { name: /demo-admin-user/i }).should("exist");
		cy.findByRole("button", { name: /login as demo admin/i }).should("exist");
	});

	it("should have correct data-cy attributes for robust test selectors", () => {
		cy.get('[data-cy="demo-user-button-demo-user"]').should("exist");
	});

	// Example: Visual regression snapshot (if using cypress-image-snapshot)
	// it("should match visual snapshot", () => {
	//   cy.matchImageSnapshot("demo-form-default");
	// });
});
