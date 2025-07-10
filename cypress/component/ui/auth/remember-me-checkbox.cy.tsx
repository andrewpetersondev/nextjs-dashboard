import { RememberMeCheckbox } from "@/ui/auth/remember-me-checkbox.tsx";

describe("<RememberMeCheckbox />", () => {
  it("renders checkbox and label", () => {
    cy.mount(<RememberMeCheckbox />);
    cy.get("input[type=checkbox][id=remember-me]").should("exist");
    cy.get("label[for=remember-me]").should("contain.text", "Remember me");
  });

  it("toggles checkbox", () => {
    cy.mount(<RememberMeCheckbox />);
    cy.get("input#remember-me").check().should("be.checked");
    cy.get("input#remember-me").uncheck().should("not.be.checked");
  });
});
