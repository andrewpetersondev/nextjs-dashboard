import { FieldError } from "@/ui/auth/field-error.tsx";

describe("<FieldError />", () => {
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

  it("renders nothing when error is undefined", () => {
    cy.mount(<FieldError />);
    cy.get("[role=alert]").should("not.exist");
  });

  it("renders nothing when error is empty", () => {
    cy.mount(<FieldError error={[]} />);
    cy.get("[role=alert]").should("not.exist");
  });

  it("renders error messages and label", () => {
    const errors = ["Required", "Must be a valid email"];
    cy.mount(
      <FieldError dataCy="email-errors" error={errors} label="Email error:" />,
    );
    cy.get("[role=alert]").should("exist");
    cy.get("[data-cy=email-errors]").within(() => {
      cy.contains("Email error:");
      cy.get("ul > li").should("have.length", errors.length);
      errors.forEach((err) => cy.contains(err));
    });
  });

  it("sets id and data-cy attributes", () => {
    cy.mount(<FieldError dataCy="test-cy" error={["Error"]} id="test-id" />);
    cy.get("#test-id").should("exist");
    cy.get("[data-cy=test-cy]").should("exist");
  });
});
