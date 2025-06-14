# Cypress Testing Workflow

## Overview

This project uses [Cypress](https://www.cypress.io/) for end-to-end (E2E) and component testing. All tests are run with
secrets injected via [HCP Vault Secrets](https://developer.hashicorp.com/vault/docs/secrets) to ensure sensitive
configuration is never exposed.

- **E2E tests:** Located in `cypress/e2e/`
- **Component tests:** Located in `cypress/component/`
- **Secrets:** Managed with `hcp vault-secrets`
- **Database:** PostgreSQL (test DB managed via Docker)
- **Test runner:** Cypress v14+, run via npm scripts

---

## Prerequisites

- All required containers (PostgreSQL, Adminer, etc.) must be running. See `docs/startup.md` for details.
- Secrets must be available via HCP Vault.

---

## Running the Next.js App with Secrets

Start the development server with secrets injected:

```sh
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
   ```

- Runs all E2E tests in headless mode with secrets injected.

--- 

3. Run E2E Tests for a Specific Folder
   To target a specific folder (e.g., cypress/e2e/auth/):

```shell

pnpm cyp:e2e:headless:auth
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
