/// <reference types="../cypress.d.ts" />
/// <reference types="cypress" />

import { AuthSubmitButton } from "../../src/ui/auth/auth-submit-button";

describe("AuthSubmitButton", () => {
	it("renders correctly", () => {
		cy.mount(<AuthSubmitButton>Submit</AuthSubmitButton>);
		cy.get("button").contains("Submit");
	});

	it("is disabled when pending", () => {
		cy.mount(<AuthSubmitButton pending>Submit</AuthSubmitButton>);
		cy.get("button").should("have.attr", "aria-disabled", "true");
	});

	it("calls onClick handler when clicked", () => {
		let clicked = false;
		const onClick = () => {
			clicked = true;
		};
		cy.mount(<AuthSubmitButton onClick={onClick}>Submit</AuthSubmitButton>);
		cy.get("button").click();
		expect(clicked).to.be.true;
	});

	it("has the correct class names", () => {
		cy.mount(<AuthSubmitButton>Submit</AuthSubmitButton>);
		cy.get("button").should("have.class", "bg-bg-active");
		cy.get("button").should("have.class", "text-text-primary");
		cy.get("button").should("have.class", "hover:bg-bg-hover");
		cy.get("button").should("have.class", "focus-visible:outline-bg-focus");
	});
});
