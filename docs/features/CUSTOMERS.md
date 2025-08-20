# Customers Feature

This directory implements the Customers domain logic, including data access, actions, types, and mapping for the customers feature. All modules use strict TypeScript typing, branded types, and follow clean architecture principles.

## Files

- **`customer.actions.ts`**  
  Server actions for reading and filtering customers. Uses dependency injection for the database instance and returns strictly typed results for UI consumption.

- **`customer.dal.ts`**  
  Data access layer for customers. Provides functions to fetch all customers, filter customers for tables, and count total customers. Handles error logging and throws domain-specific errors.

- **`customer.dto.ts`**  
  (Empty) Reserved for Data Transfer Object (DTO) definitions for customer-related API payloads.

- **`customer.mapper.ts`**  
  (Empty) Reserved for mapping functions between database rows, DTOs, and domain models.

- **`customer.types.ts`**  
  TypeScript types and interfaces for customer entities, including branded types for IDs, database row shapes, and formatted table rows for the UI.

- **`README.md`**  
  Documentation for the customers feature module, including architecture, usage, and extension guidelines.

## Usage

- Use server actions from `customer.actions.ts` in server components or API routes to fetch customer data.
- Extend the data access layer in `customer.dal.ts` for new queries or mutations.
- Define new DTOs in `customer.dto.ts` and mapping logic in `customer.mapper.ts` as needed for API or UI requirements.
- Import types from `customer.types.ts` for type-safe data handling across the feature.

## Conventions

- All types, actions, and data access functions are documented using TSDoc.
- Use branded types for all domain identifiers.
- Use dependency injection for database access to improve testability.
- Update this README when adding or modifying files in this feature.
