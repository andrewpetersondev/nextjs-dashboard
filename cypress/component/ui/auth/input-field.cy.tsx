import {
	InputField,
	type InputFieldProps,
} from "../../../../src/ui/auth/input-field.tsx";

describe("<InputField />", () => {
	const baseProps: InputFieldProps = {
		dataCy: "test-input",
		id: "test-input",
		label: "Test Input",
		type: "text",
	};

	it("renders with label and input", () => {
		cy.mount(<InputField {...baseProps} />);
		cy.get("label").should("contain.text", "Test Input");
		cy.get("input#test-input").should("exist");
	});

	it("renders icon if provided", () => {
		cy.mount(<InputField {...baseProps} icon={<span data-cy="icon" />} />);
		cy.get("[data-cy=icon]").should("exist");
	});

	it("shows error messages", () => {
		cy.mount(<InputField {...baseProps} error={["Required"]} />);
		cy.get("[data-cy=test-input-errors]").should("contain.text", "Required");
		cy.get("input").should("have.attr", "aria-invalid", "true");
	});

	it("supports describedById", () => {
		cy.mount(
			<InputField {...baseProps} describedById="desc-id" error={["Error"]} />,
		);
		cy.get("input").should("have.attr", "aria-describedby", "desc-id");
	});
});
