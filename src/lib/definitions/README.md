# Definitions

This directory contains shared type definitions and branded types for domain-specific logic, used throughout the application for type safety and validation.

## Files

- **`brands.ts`**  
  Provides branded types for domain identifiers (e.g., `CustomerId`, `UserId`, `InvoiceId`) and utility functions for validating and constructing these types. Includes enum validation helpers for user roles, invoice statuses, and period durations.

## Usage

Import branded types and validation utilities from this directory to ensure type safety and consistent validation across the codebase.

## Conventions

- All types and utilities are documented using TSDoc.
- Use branded types for domain-specific identifiers to prevent accidental misuse.
- Update this README when adding or modifying definitions.
