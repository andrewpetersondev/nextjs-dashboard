---
apply: manually
---

# GitHub Copilot & AI Assistant Instructions

## Table of Contents

- [Code Response Guidelines](#code-response-guidelines)
- [TypeScript Guidelines](#typescript-guidelines)
- [Software Architecture](#software-architecture)
- [User Interface (Next.js App Router)](#user-interface-nextjs-app-router)
- [AI Assistant Output Preferences](#ai-assistant-output-preferences)
- [Automation and Refactoring](#automation-and-refactoring)
- [Error Handling & Logging](#error-handling--logging)
- [Resolving Instruction Conflicts](#resolving-instruction-conflicts)
- [Security & Secrets](#security--secrets)
- [Documentation](#documentation)
- [Version Constraints](#version-constraints)

## Code Response Guidelines

- Keep explanations brief.
- Write code as an expert Next.js senior developer.
- Use TypeScript with strict typing and avoid deprecated APIs/patterns.
- All code must satisfy the `tsconfig.json` (assume `"strict": true`, `"noImplicitAny": true`, `"noUncheckedIndexedAccess": true`).
- Provide clear explanations for complex, non-obvious, or architectural logic.
- Use visual aids (diagrams, flowcharts) for complex patterns when helpful.
- Ensure compatibility with versions specified in `package.json`.

## TypeScript Guidelines

- Use `unknown` only when necessary, and always narrow as soon as possible.
- Use `as const` for literal types as appropriate.
- Use `enum` for fixed sets of constants; otherwise prefer string literals for flexibility.
- Use `interface` for object shapes and `type` for unions/intersections.
- Leverage generics for flexible, type-safe utilities, components, and hooks.
- Explicitly annotate all function parameters, return types, and component props.
- Employ type guards and assertion functions to narrow types.
- Prefer `readonly` and immutable types when possible.
- Document all types, interfaces, and generics with TSDoc.

## Software Architecture

- Follow modular architecture with a clear separation of concerns.
- Files in `./src/shared/` are not allowed to import from outside of `./src/shared/`.
- Files in `./src/features/` are allowed to import from `./src/features/` and `./src/shared/`.
- Files in `./src/server/` are allowed to import from anywhere.
- Use branded types for domain-specific logic.
- Follow clean architecture: separate layers for database, data access, repositories, services, actions, and more.
- Use dependency injection to improve testability and flexibility. If unfamiliar, provide a brief explanation in context.

## User Interface (Next.js App Router)

- Adhere to best practices for the Next.js App Router.
- Prefer fetching data in server components (including `page.tsx`) rather than in client components.

## AI Assistant Output Preferences

- Generate code with only the minimal necessary scaffolding, focusing on core logic and correctness.
- Use Markdown for code blocks, labeled with the appropriate language.
- Precede complex or non-obvious code with a clear, concise explanation.
- Never reference or make assumptions about secrets or credentials.
- Prefer existing project conventions, especially imports from `src/lib/utils/logger.ts` and `src/errors/errors.ts`.

## Automation and Refactoring

- Use AI tools to intelligently automate repetitive tasks and refactor code for maintainability.
- Ensure any automated or refactored code is tested and documented as necessary.
- Detect deprecated or discouraged patterns; suggest and apply preferred alternatives.

## Error Handling & Logging

- Use error handling best practices for both server and client code.
- Log errors with sufficient context for debugging, never exposing sensitive data.
- Use built-in Next.js error handling mechanisms where appropriate.
- Use exported error classes from `src/errors/errors.ts` for consistency.
- Implement global error boundaries in React using ErrorBoundary components.
- Use structured (JSON) logging in server and client code.
- Use the `pino` logger as exported from `src/lib/utils/logger.ts`.

## Resolving Instruction Conflicts

- If instructions conflict, consult the project maintainer for clarification.

## Security & Secrets

- Manage secrets with Hashicorp Vault, accessed via environment variables.
- Never commit secrets or sensitive information to version control.
- Sanitize and validate all user input.
- Always follow OWASP best practices for web application security.

## Documentation

- Document all files, components, utilities, and APIs using TSDoc.
- Keep README and usage guides up to date.

## Version Constraints

- All version requirements are specified in the `package.json` file. Ensure all responses are compatible with these versions.

## Fallback Instructions

- Default to safest practices if uncertain.
