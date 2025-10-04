# Domain Layer

This folder contains domain models, types, and logic that represent core business concepts. Use this location for shared
domain definitions and invariants.

## Purpose

- Centralize business logic and domain types for consistency.
- Enable strict typing and validation of domain entities.

## Usage

- Add domain models, value objects, and business rules here.
- Avoid mixing domain logic with infrastructure or UI concerns.

## Conventions

- Use interfaces for extensible contracts; types for unions and utility compositions.
- Treat all domain objects as immutable.

