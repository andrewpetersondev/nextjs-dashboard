---
apply: always
---

Developer: # GitHub Copilot & AI Assistant Guidelines

## Usage Instructions
Begin with a concise checklist (3-7 bullets) outlining the planned approach for any multi-step or complex response. After completing substantive actions or generating significant outputs, validate results in 1-2 lines and proceed or self-correct if necessary. For code or tool usage, include a one-line preamble stating the purpose and essential context before taking action. For all irreversible or sensitive operations, require explicit user confirmation.

## Table of Contents
- [Code Response Guidelines](#code-response-guidelines)
- [Code Style Guidelines](#code-style-guidelines)
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
- [Fallback Instructions](#fallback-instructions)

## Code Response Guidelines
- Provide concise explanations before any complex or non-obvious code.
- Write code to the standard of a senior Next.js developer.
- Use TypeScript with strict typing (`"strict": true`), avoiding deprecated APIs and patterns.
- Ensure code compatibility with versions specified in `package.json`.
- Use visual aids (diagrams, flowcharts) for complex patterns when helpful.

## Code Style Guidelines
- Limit functions to a maximum of 50 lines.
- Limit functions to four parameters or fewer.
- Avoid excessive complexity in function logic.

## TypeScript Guidelines
- Use `unknown` only when necessary, and narrow it immediately.
- Use `as const` for literal types when appropriate.
- Prefer `enum` for fixed sets of constants; otherwise, use string literals for flexibility.
- Use `interface` for object shapes and `type` for unions or intersections.
- Leverage generics for creating flexible and type-safe utilities, components, and hooks.
- Explicitly annotate all function parameters, return types, and component props.
- Utilize type guards and assertion functions for type narrowing.
- Prefer `readonly` and immutable types when feasible.
- Document all types, interfaces, and generics with TSDoc.

## Software Architecture
- Apply modular architecture with a clear separation of concerns.
- Files in `./src/shared/` may only import from within `./src/shared/`.
- Files in `./src/features/` may import from `./src/features/` and `./src/shared/`.
- Files in `./src/server/` have no import restrictions.
- Adhere to clean architecture by separating database, data access, repositories, services, and actions into their respective layers.
- Implement dependency injection for improved testability and flexibility. If unfamiliar, provide brief in-context explanations.

## User Interface (Next.js App Router)
- Follow best practices for the Next.js App Router.
- Prefer data fetching in server components (including `page.tsx`) over client components.

## AI Assistant Output Preferences
- Provide a clear and concise explanation before complex or non-obvious code.
- Never reference or assume the existence of secrets or credentials.

## Automation and Refactoring
- Use AI tools to automate repetitive tasks and refactor code for maintainability.
- Ensure all automated or refactored code is tested and documented appropriately.
- Detect deprecated or discouraged patterns, suggesting or applying preferred alternatives.

## Error Handling & Logging
- Adhere to error handling best practices for both server and client code.
- Log errors with enough context for debugging, while never exposing sensitive data.

## Resolving Instruction Conflicts
- Consult the project maintainer for clarification if instructions conflict.

## Security & Secrets
- Manage secrets using Hashicorp Vault, accessed via environment variables.
- Never commit secrets or sensitive data to version control.
- Sanitize and validate all user input.
- Always apply OWASP web application security best practices.

## Documentation
- Document all files, components, utilities, and APIs using TSDoc.
- Keep README files and usage guides up to date.

## Version Constraints
- All version requirements are specified in the `package.json`. Ensure compatibility with these versions in all responses.

## Fallback Instructions
- Default to best practices when uncertain.
- Default to compatibility with the latest version of a package if version is unclear.
