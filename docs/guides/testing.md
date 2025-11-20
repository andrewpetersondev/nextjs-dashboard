# Testing

This project uses Cypress for end-to-end (E2E) testing. Accessibility checks via cypress-axe can be enabled in tests.

Quick commands
- Build (test env): pnpm build:test
- Serve (test env): pnpm serve:test
- Open Cypress: pnpm cyp:open
- Run headless: pnpm cyp:e2e:headless

Typical local E2E workflow
1) Ensure test database is prepared
- pnpm db:generate:migrate:test
- pnpm db:seed:test
2) Build and serve the app using test environment
- pnpm build:test
- pnpm serve:test
3) Run Cypress
- pnpm cyp:open

Conventions
- Specs live under cypress/e2e.
- Custom commands and support files are under cypress/support.
- Prefer data-testid or role-based queries (via @testing-library/cypress) for resilient selectors.

Accessibility
- The project includes cypress-axe and axe-core. You can add cy.injectAxe() and cy.checkA11y() in your specs as needed.

CI notes
- Use the headless run: pnpm cyp:e2e:headless.
- Ensure the app is built and served with test env before running Cypress in CI.

Troubleshooting
- If Cypress can’t reach the app, verify pnpm serve:test is running and the baseUrl matches cypress.config.ts.
- For DB-related failures, confirm DATABASE_URL for test and that seeds ran.
