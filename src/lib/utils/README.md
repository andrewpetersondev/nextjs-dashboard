# Utils

This directory provides shared utility functions and helpers for both server and client code, supporting formatting, validation, logging, and other cross-cutting concerns.

## Files

- **`date-utils.ts`**  
  Utilities for date formatting, parsing, and period conversion. Includes helpers for working with domain-specific `Period` types.

- **`logger.ts`**  
  Exports a configured `pino` logger instance for structured, environment-aware logging. Use for all server-side logging.

- **`password.ts`**  
  Server-only utility for generating random passwords with required complexity (uppercase, number, special character).

- **`utils.server.ts`**  
  Server-only utilities for standardizing action results, extracting strongly-typed form fields, and validating user roles.

- **`utils.ts`**  
  General-purpose utilities for formatting currency, localizing dates, stripping object properties, generating pagination arrays, and getting the current ISO date.

- **`README.md`**  
  Documentation for the utils module, including architecture, usage, and extension guidelines.

## Usage

- Import only the utilities you need from this directory.
- Use `logger` for all server-side logging to ensure consistency and structure.
- Use `actionResult` for standardized server action responses.
- Use `formatCurrency` and `formatDateToLocal` for UI formatting.
- Use `date-utils.ts` for all date and period manipulations.

## Conventions

- All utilities are documented using TSDoc.
- Use `as const` and strict typing for all exports.
- Prefer arrow functions for utility definitions.
- Update this README when adding or modifying utility files.
