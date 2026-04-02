# Cypress Guide

This guide summarizes how Cypress is set up and how to run tests locally and in CI.

## Setup Overview

- Cypress v15 with `@testing-library/cypress` and `cypress-axe`.
- Config file: `cypress.config.ts`
- Specs: `cypress/e2e`
- Support files: `cypress/support`

## Running Locally

```sh
pnpm cy:e2e:open            # Open interactive runner
pnpm cy:e2e:run    # Run headless
```

## Preconditions

Use the test environment for consistency:

```sh
pnpm db:push:test
pnpm db:seed:test
pnpm next:build:test
pnpm serve:test
```

## Accessibility Testing

`axe-core` and `cypress-axe` are available. Example usage in a spec:

```ts
cy.visit("/some-page")
cy.injectAxe()
cy.checkA11y()
```

## Selectors and Best Practices

- Prefer role-based queries with `@testing-library/cypress`.
- Avoid brittle selectors based on CSS classes; use `data-testid` when roles aren't applicable.

## CI Usage

- Run `pnpm cy:e2e:run` after ensuring the app is served with the test env.
- Artifacts (videos/screenshots) are configured by Cypress defaults; adjust in `cypress.config.ts` if needed.

## Notes

- See [docs/guides/testing.md](testing.md) for the end-to-end workflow and troubleshooting tips.
