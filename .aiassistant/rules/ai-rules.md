---
apply: manually
---

# JetBrains AI Assistant Guidelines

## Usage Patterns
- Start complex responses with a concise checklist (3–7 bullets).
- Add a one-line preamble before non-obvious code explaining purpose/context.
- After major outputs, validate outcomes in 1–2 lines and suggest next steps.
- Ask for explicit confirmation before irreversible/sensitive actions (e.g., schema migrations, file deletions).

---

## Table of Contents
- Code Response Guidelines
- Code Style Guidelines
- TypeScript Guidelines
- Software Architecture
- UI (Next.js App Router)
- Automation & Refactoring
- Error Handling & Logging
- Security & Environment Variables
- Documentation
- Version & Tooling Constraints
- JetBrains-Specific Tips
- Conflict Resolution
- Fallback Instructions
- Review Checklist

---

## Code Response Guidelines
- Write to the standard of a senior Next.js/TypeScript developer.
- Target strict TypeScript; avoid deprecated APIs/patterns.
- Keep explanations minimal and focused; include rationale for design choices when not obvious.
- Prefer small, composable functions; avoid deep nesting and long parameter lists.
- Use visual aids only when they clarify complex flows (data, auth, concurrency).

---

## Code Style Guidelines
- Functions ≤50 lines; ≤4 parameters. Prefer objects for optional params.
- Avoid excessive branching; extract predicates/utilities.
- Prefer immutable data and pure functions where practical.

---

## TypeScript Guidelines

### Core Principles
- Enable strict mode and strict compiler flags.
- Let the compiler infer local variable types; explicitly annotate:
    - Function parameters and return types
    - Public APIs, exported functions/types
    - Component props and hook signatures
- Use interface for extensible object shapes; type for unions, intersections, tuples, mapped/conditional types.
- Avoid any; prefer unknown, generics, or narrowing.
- Favor immutability: readonly, as const, persistent patterns.

### Functions, Async, and Errors
- Single-purpose functions; split validation/transformation/side-effects.
- Prefer unions/generics over many overloads.
- In async code:
    - Use try/catch; rethrow with context or return typed results (Result<E, T>-style) when appropriate.
    - Avoid sequential awaits in loops; use Promise.all for independent work.
    - Use void return in callbacks if return value is ignored.

### Generics and Utilities
- Leverage generics for reusable utilities, components, and hooks.
- Use exhaustiveness checks with never in switch statements for discriminated unions.
- Prefer built-in utility types (Partial, Pick, Omit, Readonly, Record).
- Avoid overly deep/recursive types that harm performance.
- Use primitive types (number, string, boolean), not wrapper objects (Number, String, Boolean).

### Null/Undefined Safety
- Treat null and undefined distinctly; use ?. and ??.
- Guard before property access; avoid non-null assertions (!) unless isolated and justified.

### Module Hygiene
- Organize by feature/domain/responsibility.
- Use type-only imports/exports to improve tree-shaking.
- Avoid TypeScript namespaces (prefer ES modules).

### Documentation & Type Validation
- Document public types/APIs with TSDoc (@param, @returns, @template).
- Use @ts-expect-error for intentional type-fail tests and regression guards.
- Consider type-level tests (e.g., tsd) or assertion functions.

---

## Software Architecture
- Modular, layered, and DI-friendly:
    - src/shared/: may import only from src/shared/.
    - src/features/: may import from src/features/ and src/shared/.
    - src/server/: no import restrictions.
- Clean architecture separation: database, repositories, services, actions/use-cases.
- Explain DI choice briefly when introducing it (constructor injection/factory, etc.).
- Keep cross-cutting concerns (logging/metrics/config) abstracted and injectable.

---

## UI (Next.js App Router)
- Prefer server components for data fetching and heavy logic.
- Use client components only for interactive stateful UI or browser-only APIs.
- Co-locate minimal server actions; validate inputs and enforce auth/ACL server-side.
- Handle streaming/suspense boundaries intentionally.

---

## Automation & Refactoring
- Use automation to remove repetition and improve maintainability.
- Ensure refactors preserve behavior; include tests or type-level guarantees.
- Identify deprecated patterns and propose modern alternatives with brief justification.

---

## Error Handling & Logging
- Add context to errors (operation, identifiers, safe metadata); avoid leaking secrets/PII.
- Normalize error shapes for APIs; map internal errors to safe client messages.
- Log at appropriate levels; prefer structured logs.

---

## Security & Environment Variables
- Never commit secrets. Load via environment with validation.
- Sanitize and validate all user inputs; encode outputs appropriately.
- Follow OWASP best practices; minimize attack surface (e.g., narrow CORS, rate limit sensitive endpoints).

---

## Documentation
- Keep README/usage docs current.
- TSDoc for components, utilities, hooks, and public APIs.
- Document architectural decisions when non-obvious (ADR-lite notes).

---

## Version & Tooling Constraints
- Ensure compatibility with declared package versions.
- Prefer stable APIs; note canary/experimental usage and provide alternatives where possible.
- Adhere to project linters/formatters; propose configuration updates when needed.

---

## JetBrains-Specific Tips
- Provide intent-revealing code that enables accurate navigation and refactors:
    - Explicit exports, minimal re-exports, stable symbol names.
    - Avoid magic strings; use enums or const objects as sources of truth.
- Favor code actions that align with IDE quick-fixes and intentions:
    - Extract function/module, introduce parameter object, convert callback to async, add explicit return types.
- Keep functions small to improve inlay hints and gutter actions.
- When suggesting edits, group logical changes and keep context minimal but unambiguous.

---

## Conflict Resolution
- If instructions conflict, ask the maintainer for clarification.
- Default to stricter typing and safer operations until clarified.

---

## Fallback Instructions
- Default to current best practices if uncertain.
- Target latest stable versions when version is unclear, while noting potential differences.

---

## Review Checklist
1. Strict TypeScript enabled; no relaxed flags without rationale.
2. Public APIs annotated; no any except isolated transitional cases.
3. Functions are single-purpose; parameters ≤4 or parameter object.
4. Async code uses try/catch, avoids unnecessary sequential awaits.
5. Generics and utility types used appropriately; no wrapper object types.
6. Null/undefined handled safely; non-null assertions rare and justified.
7. Modules organized by feature/responsibility; type-only imports used.
8. Server/client concerns separated; server components preferred for data work.
9. Security: input validation, no secrets exposure, OWASP-aligned patterns.
10. Documentation: TSDoc present; important decisions and types explained.
11. Compatible with project versions and tooling; avoids deprecated APIs.
12. Logs are structured and safe; errors contextualized but sanitized.

--- 

