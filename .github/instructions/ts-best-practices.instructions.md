---
applyTo: '**'
description: 'description'
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or
reviewing changes.

# TypeScript Best Practices (Next.js App Router)

Preamble: Compact, deterministic rules for strict, maintainable TypeScript in Next.js. Always on.

---

## TypeScript Baseline

- Use "strict": true and strict flags; annotate parameters and return types (allow local inference).
- Prefer interface for extensible object shapes; prefer type for unions/tuples/mapped/conditional types.
- Favor immutability with readonly and as const.
- No any in public APIs; use unknown with narrowing or generics.
- Avoid non-null assertions (!) unless isolated and documented.

// Purpose: Clear object vs union types with explicit returns.

---

## Generics & Result Patterns

- Constrain generics (extends); use meaningful names (TInput, TResult).
- Prefer discriminated Result unions for operations with failure.
- Avoid unconstrained <T> and expensive recursive types.

// Purpose: Constrained generics with Result union and safe error typing.

---

## Async & Errors

- Use async/await with explicit Promise<T>.
- Catch unknown; narrow via guards; wrap in Result or rethrow with context.
- Use Promise.all for independent tasks; avoid sequential awaits.

// Purpose: Parallel fetching with typed result and safe error mapping.

---

## Next.js App Router Guidance

- Prefer Server Components for data/heavy logic; Client Components for interactivity.
- Validate inputs in Server Actions; enforce auth/ACL server-side.
- Use Suspense/streaming intentionally; keep boundaries minimal.
- Don’t fetch on client when server can pre-render.

// Purpose: Zod-validated server action with safe, typed response.

---

## Zod Integration

- Use z.output<typeof schema> for derived types.
- Prefer safeParse and return unions with mapped messages.
- Don’t expose raw ZodError to clients.

// Purpose: Generic validator returning narrow, client-safe union.

---

## Code Organization

- Organize by feature/domain; explicit, minimal exports; use type-only imports.
- Keep cross-cutting concerns abstracted/injectable (logging, config).
- Avoid “god” modules and dumping grounds like utils.ts.

// Purpose: Feature-local API surface with explicit exports.

---

## Functions & Style

- Single-purpose; ≤50 lines; ≤4 params (prefer a params object for options).
- Extract predicates/utilities; avoid deep nesting.
- Don’t mix validation, transformation, and side-effects in one function.

---

## Error Handling & Logging

- Add context (operation, identifiers); avoid secrets/PII.
- Prefer structured logs; map internal errors to safe client messages.
- Do not expose internal errors to clients.

---

## Documentation

- TSDoc for exported APIs/components/hooks (≤5 lines).
- Use @param, @returns, @throws, @template for generics.
- Don’t over-document trivial code.

---

## JetBrains IDE Tips

- Explicit exports; stable symbol names; avoid magic strings (use const objects/enums).
- Keep functions small for inlay hints and navigation.
- Align with IDE intentions: extract function/module, introduce parameter object, add explicit return types.

---
