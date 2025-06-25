# TS Config

## Root TS Config

- basic nextjs config
- some of this gets overridden in the cypress tsconfig

## Cypress TS Config

- Extends from the root TS config so it can use the same paths and aliases.
- import aliases can be used except in cypress/support/db-tasks.ts
