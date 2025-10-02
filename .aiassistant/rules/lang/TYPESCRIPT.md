---
apply: manually
---

---
tags: [typescript, language, errors, async]
scope: TypeScript usage across app, server, tests
---

# TypeScript Best Practices

Purpose: Deterministic rules for strict, maintainable TypeScript in Next.js. Always on.

---

## Compiler Strictness

- tsconfig: "strict": true; also enable noUncheckedIndexedAccess, noImplicitOverride,
  noPropertyAccessFromIndexSignature, exactOptionalPropertyTypes.
- Disallow implicit anys and fallbacks. Prefer explicit parameter and return types on all exported
  functions/components/hooks. Allow local inference inside function bodies.
- For libraries or shared utils, export explicit types for options and results; avoid exporting inferred anonymous
  types.

---

## Types vs Interfaces

- interface for extensible object shapes and public contracts.
- type for unions, tuples, mapped, conditional, and utility-composed types.
- Use readonly and as const for immutability; do not mutate function parameters.

---

## Nullability and Assertions

- Avoid non-null assertions (!). If unavoidable, isolate with a comment explaining why and a narrow scope.
- Prefer optional chaining and nullish coalescing over broad defaults that hide errors.
- Model null/undefined explicitly in types; use exactOptionalPropertyTypes to avoid surprise widening.

---

## Generics

- Constrain generics with meaningful names: TInput extends object, TResult, TError extends Error | { message: string }.
- Avoid unconstrained <T>. Add where clauses that reflect domain invariants.
- Prefer generic parameter objects over positional generic flags.
- Keep generic depth shallow; avoid complex recursive conditional types unless encapsulated and well-documented.
- For data fetch/transform utilities, prefer Result<TResult, TError> or typed exceptions boundary; never return any.

---

## Result and Discriminated Unions

- Use a discriminated union for operations that can fail:
  type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
- Discriminate via ok flag; never rely on presence checks of error/value only.
- Map external/library errors into a small, app-specific error union.

---

## Async & Concurrency

- Use async/await with explicit Promise<T> return types on exports.
- Scope try/catch narrowly around awaited calls that can fail.
- Use Promise.all or Promise.allSettled for independent operations; do not sequentially await independent tasks.
- Always handle rejection paths; convert to Result or normalize and rethrow with context.
- Prefer AbortController for cancelable fetches and pass the signal through layers.

---

## Error Handling

- Catch unknown; narrow via predicates or instanceof checks. Never assume error is Error.
- Never leak internal errors/stack traces or PII across API boundaries; map to safe shapes.
- Log structured context (operation, identifiers) separate from user-facing messages.
- In client code, surface friendly messages; in server/actions, return typed unions or throw typed errors captured by
  boundaries.

---

## Next.js App Router Guidance

- Prefer Server Components for data and heavy logic; keep Client Components as small shells for interactivity.
- Validate and parse inputs in Server Actions (Zod recommended); enforce auth/ACL server-side.
- Use Suspense/streaming deliberately; keep boundaries minimal to avoid waterfall rendering.
- Avoid client-side fetching when server can pre-render; pass typed props from server to client components.

---

## Zod Integration

- Derive types with z.infer<typeof Schema>; do not duplicate type definitions.
- Prefer safeParse; return discriminated unions with parse details removed or summarized.
- Do not expose raw ZodError to clients; map to a safe error shape.

---

## Code Organization

- Organize by feature/domain; expose minimal public APIs per module.
- Use type-only imports (import type) for types to avoid runtime bloat and circular deps.
- Avoid dumping grounds (utils.ts). Prefer small, named modules grouped by responsibility.

---

## Functions & Components

- Functions: single-purpose, ≤50 lines, ≤4 parameters. Prefer a params object with required fields first, optional last.
- Components/hooks: export explicit props and return types. Avoid implicit any in event handlers; type React events.
- Separate validation, transformation, and side-effects into dedicated functions for testability and types.

---

## Data & Immutability

- Treat inputs as immutable. Use readonly arrays/tuples where beneficial.
- Avoid in-place mutations of state; prefer object/array spreads or structuredClone when needed.
- Mark constants with as const to get literal types when used as discriminants/keys.

---

## Date, Numbers, and Serialization

- Avoid Date as implicit timezone; prefer ISO strings in APIs and convert at boundaries.
- Be explicit about number ranges/units. Consider branded types for identifiers and currencies.
- Ensure all server → client data is JSON-serializable; avoid functions, Symbols, or BigInt without custom handling.

---

## Testing Types

- Use @ts-expect-error for intentional failures in tests to guard regressions.
- Prefer narrow fixtures with explicit types; avoid any in tests except for boundary cases with comments.

---

## JetBrains IDE Tips

- Add explicit return types on exports for better navigation and refactors.
- Prefer const enums or const objects with as const for stable symbols and auto-complete.
- Keep modules small to leverage inspections and quick intentions effectively.

---

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
