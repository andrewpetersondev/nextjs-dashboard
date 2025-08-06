# Sessions Feature

This directory implements the session management logic, including JWT-based authentication, session verification, password hashing, and type definitions for user sessions. All modules use strict TypeScript typing, branded types, and follow clean architecture principles.

## Files

- **`session.jwt.ts`**
  - Core JWT session logic for creating, reading, setting, and deleting session tokens.
  - Uses the `jose` library for JWT signing and verification.
  - Validates payloads with Zod schemas and logs errors using the shared `pino` logger.
  - Exports functions for session token lifecycle management.

- **`session.mapper.ts`**
  - Utility functions to flatten and reconstruct session payloads for JWT compatibility.
  - Ensures consistent mapping between domain models and JWT claims.

- **`session.service.ts`**
  - Provides session verification logic for server components and API routes.
  - Implements an optimistic session check, redirecting to `/login` if the session is missing or invalid.
  - Uses React cache for efficient session validation.

- **`session.types.ts`**
  - TypeScript interfaces and Zod schemas for session payloads, JWT claims, and session verification results.
  - Enforces strict typing for all session-related data structures.

- **`session.utils.ts`**
  - Utilities for password hashing and comparison using `bcryptjs`.
  - Exports async functions for secure password management.

- **`README.md`**
  - Documentation for the sessions feature module, including architecture, usage, and extension guidelines.

## Usage

- Use exported functions from `session.jwt.ts` to manage session tokens in authentication flows.
- Use `verifySessionOptimistic` from `session.service.ts` in server components or API routes to enforce authentication.
- Use password utilities from `session.utils.ts` for secure password storage and verification.
- Import types from `session.types.ts` for type-safe session handling across the feature.

## Conventions

- All types, utilities, and session logic are documented using TSDoc.
- Use branded types for all domain identifiers.
- Use dependency injection for database access and configuration where applicable.
- Log all errors and important events using the shared `pino` logger.
- Update this README when adding or modifying files in this feature.
