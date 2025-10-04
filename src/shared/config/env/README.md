# Environment Configuration

This folder contains environment configuration logic and constants for the application. Use this location for shared
environment variables, helpers, and type-safe access patterns.

## Purpose

- Centralize environment variable management for maintainability and security.
- Ensure type safety and validation for all environment values.

## Usage

- Add environment variable accessors and validation logic here.
- Do not hardcode secrets; use .env files and access via typed helpers.

## Conventions

- Use Zod for schema validation.
- Export explicit types for environment shapes.
- Treat all inputs as immutable.

