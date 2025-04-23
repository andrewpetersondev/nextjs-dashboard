import ClientComponent from "../../src/ui/client-component";

describe("ClientComponent", () => {
  it("mounts", () => {
    cy.mount(<ClientComponent />);
  });

  it("displays initial counter value of 0", () => {
    cy.mount(<ClientComponent />);
    cy.contains("Current count: 0");
  });

  it("displays correct heading", () => {
    cy.mount(<ClientComponent />);
    cy.contains("h3", "Counter Component");
  });

  it("increments counter when button is clicked", () => {
    cy.mount(<ClientComponent />);
    cy.contains("button", "Increment").click();
    cy.contains("Current count: 1");
    cy.contains("button", "Increment").click();
    cy.contains("Current count: 2");
  });

  it("has correct button styling", () => {
    cy.mount(<ClientComponent />);
    cy.contains("button", "Increment")
      .should("have.class", "bg-blue-500")
      .should("have.class", "text-white");
  });
});
