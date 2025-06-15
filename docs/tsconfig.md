# TS Config

## tsconfig.base.json

Changed

1. allowJS true --> false // Reason: The project is fully TypeScript, so JavaScript files are not needed, enforcing stricter type safety.
2. skipLibCheck true --> false // Reason: While skipping library checks speeds up builds, it may hide type errors in dependencies. Setting it to false ensures stricter type checking.

## Root tsconfig.json

Changed

1. cypress.config.ts is now excluded from the root tsconfig.json // Reason: Cypress tests should not be included in the main TypeScript configuration to avoid conflicts and ensure a clean separation of concerns.

## cypress/tsconfig.json

Changed

1. "allowJs": true --> false // Reason: Cypress tests should be written in TypeScript, so allowing JavaScript files is unnecessary and could lead to inconsistencies.
2. "baseUrl": "./" // Reason: To avoid conflicts with the root tsconfig.json, which has a different baseUrl.
3. "paths" // Reason: To avoid conflicts with the root tsconfig.json

Added

1. "types": ["cypress", "node"] // Reason: Explicitly includes Cypress types for better type checking and IntelliSense in Cypress test files. node is included because `process` is used in Cypress tests.

Removed

1. "esModuleInterop": true // Reason: It was set in the base config.
2. "isolatedModules": true // Reason: It was set in the base config.
