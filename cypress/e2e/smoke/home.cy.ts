import { UI_MATCHERS } from "../__fixtures__/constants";
import { BASE_URL, LOGIN_PATH } from "../__fixtures__/paths";

describe("Home smoke test", () => {
  it("loads homepage and navigates to login", () => {
    cy.visit(BASE_URL);

    // Assert welcome text and course link exist
    cy.findByText(UI_MATCHERS.WELCOME_HOME).should("be.visible");
    cy.get('[data-testid="nextjs-course-link"]').should(
      "have.attr",
      "href",
      "https://nextjs.org/learn/",
    );

    // Navigate to the login page via the login button
    cy.get('[data-testid="login-button"]').click();
    cy.url().should("include", LOGIN_PATH);

    // Assert login page heading is visible
    cy.findByRole("heading", { name: UI_MATCHERS.LOGIN_HEADING }).should(
      "be.visible",
    );
  });

  it("injects axe and checks for accessibility violations", () => {
    cy.visit(BASE_URL);

    // Detailed accessibility check with violation logging
    cy.injectAxe();
    cy.checkA11y(
      undefined,
      {
        includedImpacts: ["critical", "serious"],
      },
      (violations) => {
        // Log detailed violation information
        for (const violation of violations) {
          cy.log(`A11y violation: ${violation.id}`);
          cy.log(`Description: ${violation.description}`);
          cy.log(`Help: ${violation.helpUrl}`);

          for (const node of violation.nodes) {
            cy.log(`Element: ${node.target.join(", ")}`);
            cy.log(`Summary: ${node.failureSummary}`);
          }
        }
      },
      true,
    );
  });
});
