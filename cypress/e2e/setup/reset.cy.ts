/// <reference types="cypress" />

describe("Reset Database to Empty", () => {
  const seededEmails = [
    "user@user.com",
    "admin@admin.com",
    "guest@guest.com",
  ] as const;

  beforeEach(() => {
    cy.log("Resetting Database to Empty");
    cy.task("db:seed");
  });

  it("removes all data from tables", () => {
    cy.task("db:reset");
  });

  it("removes seeded users and leaves tables empty", () => {
    // Verify seeded users exist
    cy.wrap(seededEmails).each((email) => {
      cy.task("db:userExists", email).should("equal", true);
    });

    // Reset DB
    cy.task("db:reset");

    // Verify users are gone after reset
    cy.wrap(seededEmails).each((email) => {
      cy.task("db:userExists", email).should("equal", false);
    });
  });
});
