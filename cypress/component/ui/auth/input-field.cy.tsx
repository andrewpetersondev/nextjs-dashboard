import { InputField, type InputFieldProps } from "@/ui/auth/input-field.tsx";

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

  it("renders label and input", () => {
    cy.mount(<InputField id="username" label="Username" />);
    cy.get("label").should("contain.text", "Username");
    cy.get("input#username").should("exist");
  });

  it("renders icon if provided", () => {
    cy.mount(
      <InputField
        icon={<span data-cy="icon">icon</span>}
        id="icon-test"
        label="With Icon"
      />,
    );
    cy.get("[data-cy=icon]").should("exist");
  });

  it("renders error messages when error prop is set", () => {
    const errors = ["Required"];
    cy.mount(
      <InputField dataCy="email" error={errors} id="email" label="Email" />,
    );
    cy.get("[data-cy=email-errors]").should("exist");
    cy.get("[role=alert]").should("contain.text", "Required");
    cy.get("input#email").should("have.attr", "aria-invalid", "true");
  });

  it("sets aria-describedby when error is present", () => {
    cy.mount(
      <InputField
        describedById="test-desc"
        error={["Error"]}
        id="test"
        label="Test"
      />,
    );
    cy.get("input#test").should("have.attr", "aria-describedby", "test-desc");
  });

  it("passes additional props to input", () => {
    cy.mount(
      <InputField
        id="password"
        label="Password"
        placeholder="Enter password"
        type="password"
      />,
    );
    cy.get("input[type=password]").should(
      "have.attr",
      "placeholder",
      "Enter password",
    );
  });
});
