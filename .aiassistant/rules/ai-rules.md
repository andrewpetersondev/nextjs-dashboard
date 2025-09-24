---
apply: manually
---

# GitHub Copilot & AI Assistant Guidelines

## Usage Instructions
- Begin responses with a concise checklist (3–7 bullets) for multi-step or complex tasks.
- After major outputs, validate results in 1–2 lines and adjust if necessary.
- For code or tool usage, include a one-line preamble describing purpose and context.
- Require explicit user confirmation before irreversible or sensitive operations.

---

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

---

## Code Response Guidelines
- Explain approach briefly before non-obvious code.
- Write code to the standard of a **senior Next.js developer**.
- Use TypeScript with `"strict": true`; avoid deprecated APIs and patterns.
- Ensure compatibility with versions defined in `package.json`.
- Use visual aids (e.g. diagrams, flowcharts) for complex patterns when helpful.

---

## Code Style Guidelines
- Keep functions ≤50 lines.
- Limit functions to ≤4 parameters.
- Avoid excessive branching or deeply nested logic.

---

## TypeScript Guidelines
- Enable strict mode and strict compiler checks.
- Let the compiler infer local variable types; explicitly annotate public APIs.
- Use `interface` for extensible object shapes; `type` for unions, intersections, and tuples.
- Avoid `any`; prefer `unknown`, generics, or narrowing.
- Organize modules by responsibility; use consistent naming.
- Write small, single-purpose functions; avoid overloaded signatures.
- Use `async/await` with `try/catch`; avoid deeply nested awaits (prefer `Promise.all`).
- Apply dependency injection for flexibility and testability.
- Use `as const` for literal narrowing.
- Leverage **generics** to create reusable utilities, components, and hooks.
- Apply type guards and assertion functions for narrowing.
- Prefer `readonly` and immutable patterns.
- Document types, interfaces, and generics with TSDoc.
- Validate type behavior with assertions or `@ts-expect-error`.
- Use type-only imports/exports for better tree-shaking.
- Avoid overly deep or complex types; prefer built-in utility types.
- Handle `null`/`undefined` safely; avoid non-null assertions (`!`) unless necessary.

---

## Software Architecture
- Follow modular architecture with clear separation of concerns.
- `./src/shared/`: may only import from within `./src/shared/`.
- `./src/features/`: may import from `./src/features/` and `./src/shared/`.
- `./src/server/`: no import restrictions.
- Apply clean architecture: separate database, repositories, services, and actions.
- Use dependency injection; provide a brief inline explanation if code uses DI.

---

## User Interface (Next.js App Router)
- Follow Next.js App Router best practices.
- Prefer server components (e.g. `page.tsx`) for data fetching; use client components only when necessary.

---

## AI Assistant Output Preferences
- Provide explanations before non-obvious code.
- Never reference or assume secrets, credentials, or sensitive data.

---

## Automation and Refactoring
- Use AI tools to automate repetitive tasks and improve maintainability.
- Ensure refactored code is tested and documented.
- Detect deprecated or discouraged patterns and suggest modern alternatives.

---

## Error Handling & Logging
- Apply best practices for server and client error handling.
- Log with sufficient context for debugging, but never expose sensitive data.

---

## Resolving Instruction Conflicts
- Seek clarification from the project maintainer when instructions conflict.

---

## Security & Environment Variables
- Manage secrets environment variables.
- Never commit secrets to version control.
- Sanitize and validate all user input.
- Follow **OWASP** security best practices for web applications.

---

## Documentation
- Document all files, components, utilities, and APIs with TSDoc.
- Keep README files and usage guides accurate and current.

---

## Version Constraints
- Ensure all code is compatible with versions defined in `package.json`.

---

## Fallback Instructions
- Default to **best practices** when uncertain.
- Default to compatibility with the **latest stable version** of a package when version is unclear.  
