# Testing

This project uses Cypress for end-to-end (E2E) testing. Accessibility checks via cypress-axe can be enabled in tests.

## Quick Commands

```sh
pnpm build:test          # Build with test env
pnpm serve:test          # Serve with test env
pnpm e2e:open            # Open Cypress interactive runner
pnpm e2e:run    # Run Cypress headless
```

## Typical Local E2E Workflow

1. Prepare the test database:

   ```sh
   pnpm db:push:test
   pnpm db:seed:test
   ```

2. Build and serve the app using the test environment:

   ```sh
   pnpm build:test
   pnpm serve:test
   ```

3. Run Cypress:

   ```sh
   pnpm e2e:open
   ```

## Conventions

- Specs live under `cypress/e2e`.
- Custom commands and support files are under `cypress/support`.
- Prefer `data-testid` or role-based queries (via `@testing-library/cypress`) for resilient selectors.

## Accessibility

The project includes `cypress-axe` and `axe-core`. Add `cy.injectAxe()` and `cy.checkA11y()` in specs as needed.

## CI Notes

- Use the headless run: `pnpm e2e:run`.
- Ensure the app is built and served with the test env before running Cypress in CI.

## Troubleshooting

- If Cypress can't reach the app, verify `pnpm serve:test` is running and the `baseUrl` matches `cypress.config.ts`.
- For DB-related failures, confirm `DATABASE_URL` for test and that seeds ran.
