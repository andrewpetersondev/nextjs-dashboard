# Users Feature

This directory implements the Users domain logic, including data access, server actions, DTOs, mapping, validation schemas, and type definitions for user management. All modules use strict TypeScript typing, branded types, and follow clean architecture principles.

## Files

- **`user.actions.ts`**
  - Server actions for user CRUD (create, read, update, delete), authentication (signup, login, logout), and demo user creation.
  - Uses dependency injection for the database instance and returns strictly typed results for UI consumption.
  - Handles form validation, error normalization, and session management.

- **`user.dal.ts`**
  - Data Access Layer for users, using Drizzle ORM.
  - Provides functions for creating, reading, updating, deleting users, authentication, pagination, and demo user utilities.
  - Maps raw DB rows to domain entities and DTOs, and logs errors using the shared logger.

- **`user.dto.ts`**
  - Data Transfer Object (DTO) definition for users.
  - Ensures only safe, serializable fields are exposed to the API/UI.
  - Documents the DTO structure and usage.

- **`user.mapper.ts`**
  - Mapping utilities between raw DB rows, domain entities, and DTOs.
  - Ensures type safety and strips branded/internal types for transport.

- **`user.schema.ts`**
  - Zod schemas for user validation: creation, signup, login, and editing.
  - Enforces strong validation rules for all user-related forms.

- **`user.service.ts`**
  - Service utilities for validating user form data.
  - Wraps generic form validation with user-specific schemas and error messages.

- **`user.types.ts`**
  - TypeScript types and interfaces for user roles, form fields, form states, update patches, and action results.
  - Uses branded types for domain identifiers and enforces strict typing throughout the feature.

- **`README.md`**
  - Documentation for the users feature module, including architecture, usage, and extension guidelines.

## Usage

- Use server actions from `user.actions.ts` in server components or API routes to manage users and authentication.
- Extend the data access layer in `user.dal.ts` for new queries or mutations.
- Define new DTOs and mapping logic as needed for API or UI requirements.
- Import types from `user.types.ts` for type-safe data handling across the feature.
- Use Zod schemas from `user.schema.ts` for form validation in both server and client code.

## Conventions

- All types, actions, and data access functions are documented using TSDoc.
- Use branded types for all domain identifiers.
- Use dependency injection for database access to improve testability.
- Log all errors and important events using the shared `pino` logger.
- Update this README when adding or modifying files in this feature.
