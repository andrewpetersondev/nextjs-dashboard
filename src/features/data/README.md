# Data Feature

This directory implements the dashboard data aggregation logic, including server actions and type definitions for the dashboard summary and latest invoices. All modules use strict TypeScript typing, branded types, and follow clean architecture principles.

## Files

- **`data.actions.ts`**
  - Server action to fetch all dashboard data, including summary cards and latest invoices.
  - Aggregates data from customers and invoices features using dependency injection for the database instance.
  - Returns strictly typed results for UI consumption, formatting currency values as needed.

- **`data.types.ts`**
  - TypeScript types and interfaces for dashboard data.
  - Defines the structure for dashboard card data and the latest invoices list, using branded types and strong typing for all fields.

- **`README.md`**
  - Documentation for the data feature module, including architecture, usage, and extension guidelines.

## Usage

- Use the server action from `data.actions.ts` in server components or API routes to fetch dashboard data.
- Extend the data action for new dashboard metrics or data sources as needed.
- Import types from `data.types.ts` for type-safe data handling across the dashboard feature.

## Conventions

- All types and actions are documented using TSDoc.
- Use branded types for all domain identifiers.
- Use dependency injection for database access to improve testability.
- Format all currency values using the shared utility from `src/lib/utils/utils.ts`.
- Update this README when adding or modifying files in this feature.
