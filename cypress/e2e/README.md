# Cypress E2E Test Structure

- Group tests by feature domain (e.g., `auth/`, `home/`).
- Use `__fixtures__` for shared test data and `__utils__` for helpers.
- Use `.cy.ts` for E2E tests.
- Keep tests isolated and idempotent.
- Use TypeScript for all test files.
- Use custom Cypress commands for repeated flows.
