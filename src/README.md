# src

This directory contains all source code for the Next.js application.

## Structure

- `__tests__/` – Unit and integration tests (Jest/Vitest).
- `app/` – Next.js App Router entrypoint and route handlers.
- `components/` – Composite and feature-level React components.
- `config/` – Application and environment configuration.
- `db/` – Database models, migrations, and seeds (using Drizzle ORM).
- `errors/` – Custom error classes and error handling utilities.
- `features/` – Feature slices, each with related actions, types, and utilities.
- `lib/` – Shared utilities, constants, and type definitions.
- `styles/` – Global and shared styles.
- `ui/` – Reusable atomic UI components (e.g., buttons, inputs).

## Concepts & Definitions

---

### Domain Model

A **DOMAIN MODEL** is a conceptual representation of the core business logic and rules of the application. It defines the main entities, their properties, behaviors, and relationships, using types and structures that reflect the business requirements—not just how data is stored or transferred. In TypeScript, this is often represented by interfaces or classes with strong typing and invariants (e.g., InvoiceEntity).

---

### Entity Layer

The **ENTITY LAYER** is the part of the codebase where these domain models live. Entities encapsulate business rules and invariants, and are used throughout the backend logic, service layer, and data access layer (DAL). They are not concerned with how data is stored (DB schema) or transferred (DTOs), but with how it is used and validated in the business logic.

---

### Invariants

**INVARIANTS** are conditions or rules that must always hold true for your data or objects throughout their lifecycle in your application. In the context of software engineering and domain modeling, invariants ensure the integrity and correctness of your business logic.

Example in an Invoice Domain:

An invoice amount must always be a positive number.
An invoice must always have a valid customer ID.
The status of an invoice must always be one of the allowed values (e.g., "pending" or "paid").
Why are invariants important?

They prevent invalid or inconsistent state in your application.
They make your codebase more robust, maintainable, and secure.
They help catch bugs early by enforcing business rules at the boundaries of your domain model.

How to enforce invariants:

Use validation in constructors, factory functions, or mapping functions (e.g., toInvoiceEntity).
Use TypeScript types and branded types for compile-time safety.
Use runtime checks for critical invariants that cannot be enforced by types alone.

Summary:
Invariants are the unbreakable rules of your business logic. Always enforce them at the boundaries of your domain model to ensure data integrity and application correctness.

---

See each folder's `README.md` for more details.
