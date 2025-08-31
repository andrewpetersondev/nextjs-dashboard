import { SEL } from "../__fixtures__/selectors";
import {
  DASHBOARD_ITEMS_PATH,
  SERVER_ACTIONS_PATTERN,
} from "../__fixtures__/server-actions";
import { STATUS_CODES } from "../__fixtures__/status-codes";

describe("CRUD Server Actions", () => {
  beforeEach(() => {
    // Setup authenticated user
    cy.loginAsTestUser();
  });

  it("should create new record via server action", () => {
    cy.visit(DASHBOARD_ITEMS_PATH);

    cy.get(SEL.addItemButton).click();
    cy.get(SEL.itemNameInput).type("Test Item");
    cy.get(SEL.itemDescriptionInput).type("Test Description");

    cy.intercept("POST", SERVER_ACTIONS_PATTERN).as("createAction");

    cy.get(SEL.saveItemButton).click();

    cy.wait("@createAction").then((interception) => {
      expect(interception.response?.statusCode).to.eq(STATUS_CODES.OK);
    });

    cy.findByText("Test Item").should("be.visible");
  });

  it("should update existing record", () => {
    // Create item first
    cy.createTestItem("Original Item");

    cy.visit(DASHBOARD_ITEMS_PATH);
    cy.get(SEL.editItemButton).first().click();

    cy.get(SEL.itemNameInput).clear().type("Updated Item");

    cy.intercept("POST", SERVER_ACTIONS_PATTERN).as("updateAction");

    cy.get(SEL.saveItemButton).click();

    cy.wait("@updateAction");
    cy.findByText("Updated Item").should("be.visible");
    cy.findByText("Original Item").should("not.exist");
  });

  it("should delete record with confirmation", () => {
    cy.createTestItem("Item to Delete");

    cy.visit(DASHBOARD_ITEMS_PATH);
    cy.get(SEL.deleteItemButton).first().click();

    // Confirm deletion in modal
    cy.get(SEL.confirmDeleteButton).click();

    cy.intercept("POST", SERVER_ACTIONS_PATTERN).as("deleteAction");

    cy.wait("@deleteAction");
    cy.findByText("Item to Delete").should("not.exist");
  });
});
