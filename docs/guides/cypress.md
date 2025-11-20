# Cypress Guide

This guide summarizes how Cypress is set up and how to run tests locally and in CI.

Setup overview
- Cypress v15 with @testing-library/cypress and cypress-axe.
- Config file: cypress.config.ts
- Specs under: cypress/e2e
- Support files: cypress/support

Running locally
- Open interactive runner: pnpm cyp:open
- Run headless: pnpm cyp:e2e:headless

Preconditions
- Use the test environment for consistency:
  - Prepare DB: pnpm db:generate:migrate:test && pnpm db:seed:test
  - Build app: pnpm build:test
  - Serve app: pnpm serve:test

Accessibility testing
- axe-core and cypress-axe are available. In a spec:
  - cy.visit("/some-page")
  - cy.injectAxe()
  - cy.checkA11y()

Selectors and best practices
- Prefer role-based queries with @testing-library/cypress.
- Avoid brittle selectors based on CSS classes; use data-testid when roles aren’t applicable.

CI usage
- Use pnpm cyp:e2e:headless after ensuring the app is served with test env.
- Artifacts (videos/screenshots) are configured by Cypress defaults; adjust in cypress.config.ts if needed.

Notes
- See docs/testing.md for the end-to-end workflow and troubleshooting tips.
- There is a TODO alignment doc under docs/TODO/cypress-nextjs-alignment.md for future improvements.
