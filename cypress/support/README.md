# Cypress Support Files Organization

This directory contains support files for Cypress tests, organized into subdirectories for better maintainability and separation of concerns.

## Directory Structure

- `commands/` - Contains shared custom Cypress commands used by both component and e2e tests

  - `commands.ts` - Implementation of custom commands
  - `commands.d.ts` - TypeScript type definitions for custom commands

- `component/` - Contains support files specific to component testing

  - `component.ts` - Main support file for component tests
  - `component.d.ts` - TypeScript type definitions for component testing
  - `component-index.html` - HTML template for component testing

- `e2e/` - Contains support files specific to end-to-end testing
  - `e2e.ts` - Main support file for e2e tests
  - `e2e.d.ts` - TypeScript type definitions for e2e testing

## Usage

### Component Testing

Component tests should import the mount command from Cypress:

```typescript
// In your component test file
import { mount } from 'cypress/react';

describe('MyComponent', () => {
  it('renders correctly', () => {
    cy.mount(<MyComponent />);
    // Test assertions...
  });
});
```

### E2E Testing

E2E tests can use custom commands directly:

```typescript
// In your e2e test file
describe("Login", () => {
  it("logs in successfully", () => {
    cy.login("user@example.com", "password123");
    // Test assertions...
  });
});
```

## Adding New Commands

To add a new custom command:

1. Add the command implementation to `commands/commands.ts`
2. Add the type definition to `commands/commands.d.ts`
3. The command will be automatically available in both component and e2e tests

## PNPM Issues

pnpm may cause issues in a cypress project because of cache.

read https://docs.cypress.io/app/get-started/install-cypress#pnpm-Configuration
