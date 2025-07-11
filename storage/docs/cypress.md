# Cypress Testing Workflow

## Overview

This project uses [Cypress](https://www.cypress.io/) for end-to-end (E2E) and component testing. All tests are run with
secrets injected via [HCP Vault Secrets](https://developer.hashicorp.com/vault/docs/secrets) to ensure sensitive
configuration is never exposed.

- **E2E tests:** Located in `cypress/e2e/`
- **Component tests:** Located in `cypress/component/`
- **Secrets:** Managed with `hcp vault-secrets`
- **Database:** PostgreSQL (test Db managed via Docker)
- **Test runner:** Cypress v14+, run via npm scripts

---

## Prerequisites

- All required containers (PostgreSQL, Adminer, etc.) must be running. See `docs/startup.md` for details.
- Secrets must be available via HCP Vault.

---

## Running the Next.js App with Secrets

Start the development server with secrets injected:

````sh
pnpm dev:hcp
# or
hcp vault-secrets run -- pnpm dev

---

## Running Cypress Tests

1. Open Cypress UI (Component/E2E):

   ```sh
   pnpm cyp:open
# or
hcp vault-secrets run -- pnpm cypress open
````

- Runs all E2E tests in headless mode with secrets injected.

---

3. Run E2E Tests for a Specific Folder
   To target a specific folder (e.g., cypress/e2e/auth/):

```shell

pnpm cyp:e2e:headless:session
# or
hcp vault-secrets run -- pnpm cypress run --e2e --headless --spec 'cypress/e2e/auth/**/*.cy.ts'
```

---

```shell
pnpm cyp:component
```

To run component tests in headless mode:

```shell
pnpm cyp:component:headless
```

---

## Environment & Secrets

- Always run Cypress commands with hcp vault-secrets run -- to ensure secrets are available.
- Never commit secrets to version control.
- Use test-specific database credentials for E2E tests.

---

## Database Setup for Testing

- The test database must be created and seeded before running E2E tests.
- See docs/startup.md for instructions on starting and managing the test database.

---

## Best Practices

- Mock external dependencies and database access in component tests.
- Use environment variables and secrets for all sensitive configuration.
- Ensure high code coverage and meaningful test cases.
- Sanitize and validate all user input in tests.

---

## Example npm Scripts (package.json)

```json
{
  "scripts": {
    "dev:hcp": "hcp vault-secrets run -- pnpm dev",
    "cyp:open": "cypress open",
    "cyp:e2e:headless": "hcp vault-secrets run -- pnpm cypress run --e2e",
    "cyp:e2e:headless:auth": "hcp vault-secrets run -- pnpm cypress run --e2e --headless --spec 'cypress/e2e/auth/**/*.cy.ts'",
    "cyp:component": "cypress open --component",
    "cyp:component:headless": "cypress run --component"
  }
}
```

## Testing Organization Summary

---

### E2E Tests

1. Directory Structure

- organized by feature/domain, separating helpers and utilities.

2. File Roles

- support/commands.ts: Custom Cypress commands (UI flows, not Db).
- support/db-tasks.ts: Cypress tasks for Db setup/teardown.
- fixtures/: Static test data.
- utils/: Test helpers (e.g., random data generators).

3. Test File Conventions

- One test file per user-facing feature or flow.
- Use describe blocks for logical grouping.
- Use beforeEach/afterEach for setup/cleanup via tasks.
  Use custom commands for UI flows only.

4. Best Practices

- Keep Db tasks out of UI flow tests except for setup/teardown.
- Mock external APIs in tests.
- Use strict typing and import aliases.
- Document custom commands and tasks.
- Group tests by user journey, not by CRUD operation.
- Keep tests deterministic: clean up state before/after.
- Run tests in isolation: avoid cross-test dependencies.

5. Test Types

- UI Flows: Use custom commands (e.g., cy.signup, cy.login).
- Setup/Teardown: Use cy.task("db:...") for Db state.

---

### Component Tests

---

## Notes

- use .submit instead of onClick for Cypress tests to better simulate user behavior.
- cypress has built in cookies
  - Cypress.Cookies.debug(true)
  - cy.clearCookies()
  - cy.getCookie('auth_key') // Get cookie with name 'auth_key'
