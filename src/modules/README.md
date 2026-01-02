# Modules Folder

This folder contains feature-specific modules, including UI components, domain types, and business logic for each application feature. Code here is intended for feature isolation and reusability within the app.

## Structure

- `auth/`: Authentication UI, logic, and session management.
- `banner/`: Banner components and related logic.
- `customers/`: Customer-related components, types, and utilities.
- `invoices/`: Invoice UI, hooks, and domain logic.
- `revenues/`: Revenue feature components, domain, DTOs, and utilities.
- `users/`: User management UI and logic.

## Module Structure

Each module is organized as a vertical slice with the following structure:

- `shared/`: Idempotent code. Shared business logic, types, constants, and validation schemas.
- `server/`: Backend logic split into `application` (actions, services, use-cases, workflows) and `infrastructure`
  (data
  access,
  adapters).
- `ui/`: Frontend React components, hooks, and view logic.
