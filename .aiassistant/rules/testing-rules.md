---
apply: manually
patterns: ["src/**/*.{test,spec}.ts", "src/**/*.{test,spec}.tsx", "cypress/**"]
---

# Testing Rules (Vitest + Cypress)

## Purpose

- Ensure fast, reliable, and maintainable tests with clear scopes.

## Precedence

- See: project-rules.md (governance)

## Rules

1. Unit tests must be deterministic and isolated; avoid timers, randomness, and network unless mocked.
2. Prefer table-driven tests for variants; keep each test focused on one behavior.
3. Use @ts-expect-error to lock type contracts only where intentional; remove when behavior changes.
4. Mock at module boundary; do not mock internal implementation details of the unit under test.
5. Integration tests must use real adapters where feasible; prefer in-memory or test DB with clear fixtures.
6. Cypress E2E: keep scenarios short; assert user-facing outcomes, not internals.
7. Snapshot tests must be small and stable; avoid large HTML trees—prefer semantic assertions.
8. Keep tests fast: target ≤ 2s per suite; mark slow tests and justify.
9. Structure: co-locate tests next to code or in **tests** with mirroring paths; name files _.test.ts(x) or _.spec.ts(x).
10. Coverage is a guide, not a goal; prioritize critical paths and domain rules.

## Low‑Token Playbook (Tests)

- Batch assertions: group related cases in one file; avoid many tiny files.
- Ask for only failing test diffs or specific ranges when debugging.
- Prefer interface-driven assertions over DOM snapshots to reduce churn.
