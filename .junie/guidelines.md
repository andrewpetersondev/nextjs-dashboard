# Junie Guidelines for Next.js + TypeScript Project

## Guidelines

- Do not make breaking changes.
- Examine the project structure. 
- Extract code to files, locations, and components to follow best practices. Create files and folders as needed.
- Revenues and Event Driven Architecture is kind of messy, so organization will help me in so many ways. 

## Focus

- Revenues and Event Driven Architecture.
- When an invoice is created, updated, or deleted, send an event to the event bus.
- Revenue logic is supposed to track the total amount for a period ("YYYY-MM-01").
- Revenue logic should be able to track the total amounts paid and pending for every period. 

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
