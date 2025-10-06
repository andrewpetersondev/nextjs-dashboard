---
apply: always
---

# TypeScript Instructions

Purpose: Deterministic rules for strict, maintainable TypeScript in Next.js. Always on.

## Scope & Audience

- Audience: all engineers and AI contributors.
- Applies to: TypeScript code across app, features, server, shared, and ui layers.
- Contexts: authoring, review, CI typecheck, and release readiness.

## Compiler Strictness

- tsconfig: "strict": true; also enable noUncheckedIndexedAccess, noImplicitOverride,
  noPropertyAccessFromIndexSignature, exactOptionalPropertyTypes.
- Disallow implicit anys and fallbacks. Prefer explicit parameter and return types on all exported
  functions/components/hooks. Allow local inference inside function bodies.
- For libraries or shared utils, export explicit types for options and results; avoid exporting inferred anonymous
  types.

## Type Safety Enforcement

- Use maximum type-safety, using casts only on primitive types (String, Number, Boolean, etc.).
- All exported functions, components, and hooks must have explicit parameter and return types.
- All generics must be constrained and named.
- No use of `any` in public APIs; only allowed in isolated, documented test cases.
- All type imports must use `import type`.
- All error/result handling must use discriminated unions.
- All modules must export explicit types for options/results; no inferred anonymous types.
- All null/undefined must be modeled explicitly; avoid non-null assertions.

## Types vs Interfaces

- interface for extensible object shapes and public contracts.
- type for unions, tuples, mapped, conditional, and utility-composed types.
- Use readonly and as const for immutability; do not mutate function parameters.

## Nullability and Assertions

- Avoid non-null assertions (!). If unavoidable, isolate with a comment explaining why and a narrow scope.
- Prefer optional chaining and nullish coalescing over broad defaults that hide errors.
- Model null/undefined explicitly in types; use exactOptionalPropertyTypes to avoid surprise widening.

## Generics

- Constrain generics with meaningful names: TInput extends object, TResult, TError extends Error | { message: string }.
- Avoid unconstrained <T>. Add where clauses that reflect domain invariants.
- Prefer generic parameter objects over positional generic flags.
- Keep generic depth shallow; avoid complex recursive conditional types unless encapsulated and well-documented.
- For data fetch/transform utilities, prefer Result<TResult, TError> or typed exceptions boundary; never return any.

## Result and Discriminated Unions

- Use a discriminated union for operations that can fail:
  type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
- Discriminate via ok flag; never rely on presence checks of error/value only.
- Map external/library errors into a small, app-specific error union.

## Async & Concurrency

- Use async/await with explicit Promise<T> return types on exports.
- Scope try/catch narrowly around awaited calls that can fail.
- Use Promise.all or Promise.allSettled for independent operations; do not sequentially await independent tasks.
- Always handle rejection paths; convert to Result or normalize and rethrow with context.
- Prefer AbortController for cancelable fetches and pass the signal through layers.

## Error Handling

- Catch unknown; narrow via predicates or instanceof checks. Never assume error is Error.
- Never leak internal errors/stack traces or PII across API boundaries; map to safe shapes.
- Log structured context (operation, identifiers) separate from user-facing messages.
- In client code, surface friendly messages; in server/actions, return typed unions or throw typed errors captured by
  boundaries.

## Next.js App Router Guidance

- Prefer Server Components for data and heavy logic; keep Client Components as small shells for interactivity.
- Validate and parse inputs in Server Actions (Zod recommended); enforce auth/ACL server-side.
- Use Suspense/streaming deliberately; keep boundaries minimal to avoid waterfall rendering.
- Avoid client-side fetching when server can pre-render; pass typed props from server to client components.

## Zod Integration

- Derive types with z.output<typeof Schema>; do not duplicate type definitions.
- Prefer safeParse; return discriminated unions with parse details removed or summarized.
- Do not expose raw ZodError to clients; map to a safe error shape.

## Code Organization

- Organize by feature/domain; expose minimal public APIs per module.
- Use type-only imports (import type) for types to avoid runtime bloat and circular deps.
- Avoid dumping grounds (utils.ts). Prefer small, named modules grouped by responsibility.

## Functions & Components

- Functions: single-purpose, ≤50 lines, ≤4 parameters. Prefer a params object with required fields first, optional last.
- Components/hooks: export explicit props and return types. Avoid implicit any in event handlers; type React events.
- Separate validation, transformation, and side-effects into dedicated functions for testability and types.

## Data & Immutability

- Treat inputs as immutable. Use readonly arrays/tuples where beneficial.
- Avoid in-place mutations of state; prefer object/array spreads or structuredClone when needed.
- Mark constants with as const to get literal types when used as discriminants/keys.

## Additional Enforcement

- Do not export inferred anonymous object types; export a named type/interface for all public shapes.
- Use `import type` for all type-only imports; enforce via lint rule.
- Server-only modules must not be imported into client components; enforce with lint rule or build-time check.
- Add import-boundaries lint to prevent higher-layer imports in lower layers.

## Review Checklist (TypeScript)

1. tsconfig strict plus exactOptionalPropertyTypes, noUncheckedIndexedAccess, noImplicitOverride enabled.
2. Public APIs have explicit parameter and return types; no any in public surfaces.
3. Generics constrained and named; avoid deep/recursive types without encapsulation.
4. Async code uses Promise<T>, narrow try/catch, and parallelizes independent awaits.
5. Errors are normalized to discriminated unions or typed exceptions; no internal details leak.
6. Null/undefined modeled explicitly; avoid non-null assertions; use guards.
7. Modules export minimal, explicit types; type-only imports used.
8. Server vs client concerns separated; inputs validated server-side; Zod safeParse preferred.
9. Immutability favored; readonly and as const used where helpful.
10. TSDoc on exported symbols with @param, @returns, @throws, @template for generics.
11. No inferred anonymous exports; server-only code never imported client-side.

_Last updated: 2025-10-05_
