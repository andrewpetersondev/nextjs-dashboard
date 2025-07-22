# GitHub Copilot Instructions

## Table of Contents

- [Code Response Guidelines](#code-response-guidelines)
- [TypeScript Guidelines](#typescript-guidelines)
- [Software Architecture](#software-architecture)
- [Error Handling & Logging](#error-handling--logging)
- [Resolving Instruction Conflicts](#resolving-instruction-conflicts)
- [Testing Guidelines](#testing-guidelines)
- [Security & Secrets](#security--secrets)
- [Documentation](#documentation)
- [Version Constraints](#version-constraints)
- [Accessibility & Internationalization](#accessibility--internationalization)

## Code Response Guidelines

- Write code as an expert Next.js senior developer.
- Use TypeScript with strict typing.
- Avoid deprecated APIs and patterns.
- Provide clear explanations for complex logic and architectural decisions.
- Prefer visual representations (diagrams, flowcharts) when explaining complex patterns.
- Ensure compatibility with versions specified in `package.json`.

## TypeScript Guidelines

- Provide code that satisfies `tsconfig.json`.
- Use `interface` for object shapes, `type` for unions/intersections.
- Use generics for flexible, type-safe utilities, components, and hooks.
- Explicitly annotate function parameters, return types, and component props.
- Use type guards and assertion functions to narrow types.
- Prefer `readonly` and immutable types where possible.
- Document all types, interfaces, and generics with TSDoc.

## Software Architecture

- Follow a modular architecture with clear separation of concerns.
- Use branded types for domain-specific logic.
- Implement a clean architecture with layers for database, data access layer, repositories, services, actions, and more.
- Use dependency injection for better testability and flexibility, but I do not know what that is so explain it.

## Error Handling & Logging

- Log errors with sufficient context for debugging, without exposing sensitive data.
- Follow best practices for error handling in both server and client code.
- Detail the relationship between error handling and the software architecture..
- Use structured logging (e.g., JSON format) for server and client errors.
- Implement global error boundaries in React using ErrorBoundary components.

## Resolving Instruction Conflicts

- If instructions conflict, consult the project maintainer for clarification.

## Testing Guidelines

- Use Cypress for end-to-end and component testing.
- Ensure compatibility with Next.js, TypeScript, ESM, and latest Next.js version.

## Security & Secrets

- Manage secrets with Hashicorp Vault, accessed via environment variables.
- Never commit secrets or sensitive data to version control.
- Sanitize and validate all user input.
- Follow OWASP best practices for web application security.

## Documentation

- Document all files, components, utilities, and APIs using TSDoc.
- Keep README and usage guides up to date.
- Use TSDoc for TypeScript documentation.

## Version Constraints

- All version requirements are specified in the `package.json` file. Ensure responses are compatible with these versions.

## Accessibility & Internationalization

- Ensure all UI components are accessible (WCAG 2.1 AA or better).
- Use semantic HTML and ARIA attributes where appropriate.
- Support internationalization and localization best practices.
