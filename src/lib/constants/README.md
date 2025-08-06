Here is a basic `README.md` for the `src/lib/constants` folder, following your documentation and architectural guidelines:

# Constants

This directory contains shared constant values used throughout the application. All constants are written in TypeScript, strictly typed, and documented with TSDoc.

## Files

- **`auth.constants.ts`**  
  Authentication/session-related constants for both server and shared environments. Includes session durations, JWT expiration, cookie names, and password hashing configuration.

- **`form.constants.ts`**  
  Default validation messages for form handling and validation feedback.

- **`success-messages.ts`**  
  Standardized success messages for user and invoice operations, used for consistent API and UI feedback.

- **`ui.constants.ts`**  
  UI-related constants, such as pagination defaults and dashboard titles for different user roles.

## Usage

Import constants from their respective files as needed. All constants are immutable and typed for safety and maintainability.

## Conventions

- All constants are documented using TSDoc.
- Use `as const` for literal objects to ensure type safety.
- Update this README when adding or modifying constants.
