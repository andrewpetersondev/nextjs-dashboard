/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";
import "cypress-axe";

// Add custom commands or global hooks here if needed.
// Note: For accessibility checks with cypress-axe, inject axe AFTER visiting a page:
//   cy.visit('/');
//   cy.injectAxe();
//   cy.checkA11y();
