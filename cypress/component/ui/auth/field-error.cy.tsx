import { FieldError } from "@/src/ui/auth/field-error.tsx";

describe("<FieldError />", () => {
	// test fails
	it("renders nothing if no error", () => {
		cy.mount(<FieldError dataCy="test-error" />);
		cy.get('[data-cy="test-error"]').should("not.exist");
	});

	it("renders error messages", () => {
		cy.mount(<FieldError dataCy="err" error={["Error 1", "Error 2"]} />);
		cy.get("[data-cy=err]")
			.should("contain.text", "Error 1")
			.and("contain.text", "Error 2");
	});

	it("renders label if provided", () => {
		cy.mount(<FieldError error={["Error"]} label="Field error:" />);
		cy.get("p").should("contain.text", "Field error:");
	});
});
