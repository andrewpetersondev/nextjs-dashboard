# Config

This directory contains configuration modules and environment variable validation for the application. All configuration is strictly typed and validated to ensure reliability and security.

## Files & Folders

- **`env.ts`**  
  Provides runtime validation for required environment variables using Zod schemas. Ensures all necessary secrets and connection strings are present and correctly formatted before the application starts. Exports validated environment variables for use throughout the codebase.

- **`README.md`**  
  Documentation for the config module, including architecture, usage, and extension guidelines.

## Usage

- Import validated environment variables from `env.ts` instead of accessing `process.env` directly.
- Extend the Zod schema in `env.ts` when adding new required environment variables.

## Conventions

- All configuration modules are documented using TSDoc.
- Use Zod for schema validation of environment variables.
- Never commit secrets or sensitive information to version control.
- Update this README when adding or modifying config files.
