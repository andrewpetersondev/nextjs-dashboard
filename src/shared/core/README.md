# Core Module Guidelines

This folder contains strictly generic, reusable utilities and types for the project. It is designed to be tree-shakable,
side-effect free, and isomorphic (usable in both server and client contexts).

## What Belongs in Core

- **Generic types and shapes**: UUID, date utilities, result and error modeling, validation primitives.
- **Error handling**: Normalization, redaction, logging, and mapping of errors to safe client shapes.
- **Result modeling**: Discriminated unions for success/failure, async and sync helpers.
- **Validation primitives**: Generic number, string, and UUID checks; composition utilities.
- **Branding**: Generic brand/type tagging, not business-specific identifiers.
- **Utility types**: Type-level helpers for immutability, optionals, and composition.

## What Does Not Belong

- **Business/domain logic**: Branded IDs (e.g., CustomerId), domain-specific validators, or converters.
- **Server-only or client-only code**: All modules must be isomorphic.

## Folder Structure

- `branding/`: Generic brand/type tagging utilities.
- `errors/`: Error modeling, redaction, logging, and mapping.
- `result/`: Result types and helpers for async/sync operations.
- `types/`: Utility types for composition and immutability.
- `validation/`: Primitives and composition utilities for generic validation.

## How to Extend

- Add new generic utilities here only if they do not reference business/domain concepts.
- For domain-specific validators or branded types, use `shared/domain`.
