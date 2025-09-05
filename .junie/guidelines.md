# Junie Guidelines for Next.js + TypeScript Project

## Guidelines

- Do not make breaking changes.
- Examine the project structure. 
- Extract code to files, locations, and components to follow best practices. Create files and folders as needed.

## Focus

- Align cypress/e2e/shared/ with best practices. 
- Decompose SEL in selectors.ts so each feature (auth, invoices, customers, users, revenues) has its own object. 
- Refactor data-cy names throughout codebase.

## Code Style Guidelines

- Keep functions to 50 lines or fewer.
- Keep functions to 4 parameters or fewer.
- Functions should not have excessive complexity.
- Files should be 200 lines or fewer.

## TypeScript Guidelines

- All code must be strictly typed (assume `"strict": true`).
- Leverage generics for flexible, type-safe utilities, components, and hooks.
- Prefer `readonly` and immutable types if they align with best practices.

## Project Structure

- Do not use barrel files or barrel modules. 

## Additional Tools

- Do not use eslint.
