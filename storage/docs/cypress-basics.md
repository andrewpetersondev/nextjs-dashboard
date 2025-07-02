# Cypress Basics & Best Practices

## 1. TypeScript Setup

- Add at the top of Cypress support and test files:

  ```typescript
  /// <reference types="cypress" />
  ```

- Reference custom types if needed:
  ```typescript
  /// <reference path="../cypress.d.ts" />
  ```

## 2. Custom Commands

- Define in `cypress/support/commands.ts`.
- Use strict TypeScript types for parameters and return values.
- Example:
  ```typescript
  Cypress.Commands.add(
    "ensureUserDeleted",
    (email: string): Cypress.Chainable<UserEntity | null> => {
      return cy.task("db:deleteUser", email).then((result) => {
        if (!result || typeof result !== "object" || !("success" in result)) {
          throw new Error(
            "[ensureUserDeleted] Invalid result from db:deleteUser task",
          );
        }
        if (
          result.error === "USER_NOT_FOUND" ||
          (!result.success && result.error === "USER_NOT_FOUND")
        ) {
          return cy.wrap(null);
        }
        if (!result.success && result.error) {
          throw new Error(
            `[ensureUserDeleted] ${result.error}: ${result.errorMessage ?? ""}`,
          );
        }
        return cy.wrap(result.data ?? null);
      });
    },
  );
  ```

## 3. Error Handling

- Throw errors for unexpected/malformed results to fail tests fast.
- Return `null` only for valid, idempotent cases (e.g., "user not found").

## 4. Chaining Commands

- Always return the Cypress chain for composability and async safety.
- Example usage:
  ```typescript
  cy.ensureUserDeleted("user@example.com")
    .then(() => cy.createUserAction({ ... }))
    .then((user) => cy.login({ email: user.email, password: "..." }));
  ```

## 5. Best Practices

- Use constants for selectors and magic strings.
- Document all commands and their contracts.
- Use TypeScript generics and interfaces for flexibility and type safety.
- Restart IDE or reload TypeScript server if types are not recognized.

---

**Stack:** Next.js v15+, TypeScript v5+, Cypress v14.5+, Drizzle ORM, PostgreSQL, ESM, pnpm  
**Testing:** Use Cypress for E2E and component tests.  
**Security:** Never commit secrets; use environment variables and Hashicorp Vault.
