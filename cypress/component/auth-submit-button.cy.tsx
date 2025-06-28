/// <reference types="cypress" />
/// <reference path="../cypress.d.ts" />

import "../support/component.ts";

import { AuthSubmitButton } from "../../src/ui/auth/auth-submit-button.tsx";

describe("AuthSubmitButton", () => {
	it("renders correctly", () => {
		cy.mount(<AuthSubmitButton>Submit</AuthSubmitButton>);
		cy.get("button").contains("Submit");
	});

	it("is disabled when pending", () => {
		cy.mount(<AuthSubmitButton pending={true}>Submit</AuthSubmitButton>);
		cy.get("button").should("have.attr", "aria-disabled", "true");
	});

	it("has the correct class names", () => {
		cy.mount(<AuthSubmitButton>Submit</AuthSubmitButton>);
		cy.get("button").should("have.class", "bg-bg-active");
		cy.get("button").should("have.class", "text-text-primary");
		cy.get("button").should("have.class", "hover:bg-bg-hover");
		cy.get("button").should("have.class", "focus-visible:outline-bg-focus");
	});
});
