# Lib

This directory contains foundational libraries, utilities, and abstractions used throughout the application. All modules are written in TypeScript with strict typing and follow clean architecture principles.

## Folders & Files

### `constants/`
Shared constants for authentication, forms, UI, and success messages.
- **`auth.constants.ts`**: Authentication-related constants (e.g., roles, tokens).
- **`form.constants.ts`**: Form field names, validation messages, and related constants.
- **`success-messages.ts`**: Standardized success messages for user feedback.
- **`ui.constants.ts`**: UI-specific constants (e.g., breakpoints, themes).
- **`README.md`**: Documentation for the constants module.

### `definitions/`
Branded types and domain-specific type definitions.
- **`brands.ts`**: Branded types for domain identifiers (e.g., `UserId`, `InvoiceId`) and enum validation helpers.
- **`README.md`**: Documentation for the definitions module.

### `events/`
Event-driven utilities and type definitions for domain events.
- **`eventBus.ts`**: In-memory event bus for publishing and subscribing to domain events.
- **`invoice.events.ts`**: Type definitions and constants for invoice-related events.
- **`README.md`**: Documentation for the events module.

### `forms/`
Type-safe utilities and types for form validation and state management.
- **`form-validation.ts`**: Core validation utilities using Zod schemas, error mapping, and typed form state.
- **`form.types.ts`**: TypeScript types for form state and error handling.
- **`README.md`**: Documentation for the forms module.

### `repository/`
Base repository abstractions for data access.
- **`base-repository.ts`**: Generic abstract class for CRUD operations, designed for extension.
- **`README.md`**: Documentation for the repository module.

### `utils/`
Shared utility functions and helpers for both server and client code.
- **`date-utils.ts`**: Utilities for date formatting, parsing, and period conversion.
- **`logger.ts`**: Configured `pino` logger instance for structured logging.
- **`password.ts`**: Server-only utility for generating random passwords.
- **`utils.server.ts`**: Server-only utilities for action results and user role validation.
- **`utils.ts`**: General-purpose utilities (e.g., currency formatting, pagination).
- **`README.md`**: Documentation for the utils module.

## Usage

- Import only the modules you need from this directory.
- Use branded types and constants for type safety and consistency.
- Use the `pino` logger for all server-side logging.
- Extend base repositories and event types as needed for your domain.

## Conventions

- All modules are documented using TSDoc.
- Use strict typing and `as const` for all exports.
- Update this README and submodule READMEs when adding or modifying files.
