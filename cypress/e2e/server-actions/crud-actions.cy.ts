describe.skip("CRUD Server Actions", () => {
  beforeEach(() => {
    // Setup authenticated user
    cy.loginAsTestUser();
  });

  it("should create new record via server action", () => {
    cy.visit("/dashboard/items");

    cy.get('[data-cy="add-item-button"]').click();
    cy.get('[data-cy="item-name-input"]').type("Test Item");
    cy.get('[data-cy="item-description-input"]').type("Test Description");

    cy.intercept("POST", "/_server-actions/**").as("createAction");

    cy.get('[data-cy="save-item-button"]').click();

    cy.wait("@createAction").then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });

    cy.findByText("Test Item").should("be.visible");
  });

  it("should update existing record", () => {
    // Create item first
    cy.createTestItem("Original Item");

    cy.visit("/dashboard/items");
    cy.get('[data-cy="edit-item-button"]').first().click();

    cy.get('[data-cy="item-name-input"]').clear().type("Updated Item");

    cy.intercept("POST", "/_server-actions/**").as("updateAction");

    cy.get('[data-cy="save-item-button"]').click();

    cy.wait("@updateAction");
    cy.findByText("Updated Item").should("be.visible");
    cy.findByText("Original Item").should("not.exist");
  });

  it("should delete record with confirmation", () => {
    cy.createTestItem("Item to Delete");

    cy.visit("/dashboard/items");
    cy.get('[data-cy="delete-item-button"]').first().click();

    // Confirm deletion in modal
    cy.get('[data-cy="confirm-delete-button"]').click();

    cy.intercept("POST", "/_server-actions/**").as("deleteAction");

    cy.wait("@deleteAction");
    cy.findByText("Item to Delete").should("not.exist");
  });
});
