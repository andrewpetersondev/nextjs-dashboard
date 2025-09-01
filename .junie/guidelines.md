# Junie Guidelines for Next.js + TypeScript Project

## Guidelines

- Implement or refactor the project's structure to align with professional best practices for Next.js version 15+ and Typescript version 5+.


## Code Style Guidelines

- Keep functions to 50 lines or fewer.
- Keep functions to 4 parameters or fewer.
- Functions should not have excessive complexity.

## TypeScript Guidelines

- All code must be strictly typed (assume `"strict": true`).
- Leverage generics for flexible, type-safe utilities, components, and hooks.
- Employ type guards and assertion functions to narrow types.
- Prefer `readonly` and immutable types if they align with best practices.
- Document all types, interfaces, and generics with TSDoc.

## Project Structure

- Do not use barrel files.

## Additional Tools

- Do not use eslint.

## Cypress Testing

- Must use the Database specifically for testing. 
- Testing Database has environment variable of POSTGRES_URL_TESTDB, whereas the development database is POSTGRES_URL_DEV
