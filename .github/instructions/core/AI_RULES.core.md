---
apply: always
---

# JetBrains AI Assistant Rules (Core + Index)

Preamble: Concise, enforceable rules to guide code, docs, and reviews for a Next.js + TypeScript project. Optimized for
JetBrains AI Assistant usage.

This file now serves as the always-on core plus an index of toggleable modules. See rules/* for full policies.

---

## Quick Checklist (use at start of complex tasks)

- Confirm intent, constraints, and risks.
- Identify files to change and impacted modules.
- Propose small, composable changes; note typing and error strategy.
- Provide copy-paste runnable commands (pnpm).
- Validate outcome; list next steps.

---

## Response & Safety Patterns

- Start with a 3–7 bullet checklist for complex changes.
- Add a one-line preamble explaining code purpose/context.
- After major outputs, include a brief validation and suggested next steps.
- Ask explicit confirmation before irreversible or sensitive actions (schema migrations, file deletions, data changes).

---

## Logging & Error Policy (Core)

- Add context (operation, identifiers) without secrets.
- Normalize API error shapes; map internal errors to safe client messages.
- Use structured logs; log at appropriate levels.

Details for TypeScript error modeling: see @rule:rules/lang/TYPESCRIPT.md

---

## Version & Tooling Constraints

- Adhere to declared package versions; prefer stable APIs.
- Note canary/experimental usage and provide alternatives where possible.
- Use pnpm for package and script commands.

---

## Conflict Resolution & Fallbacks

- If instructions conflict, ask for clarification; default to stricter typing and safer operations.
- When uncertain, default to current best practices and stable APIs.

---

## Review Checklist

1. Strict TypeScript; no relaxed flags without rationale. See @rule:TYPESCRIPT.md.
2. Public APIs annotated; no any except isolated transitional cases.
3. Functions single-purpose; parameters ≤4 or parameter object.
4. Async code with try/catch; parallelize independent awaits.
5. Generics constrained; unions used appropriately; no wrapper object types.
6. Null/undefined handled safely; rare, justified non-null assertions.
7. Modules organized by feature/responsibility; type-only imports used.
8. Server/client concerns separated; server components preferred for data work.
9. Security: input validation, no secrets exposure, OWASP-aligned patterns.
10. Documentation: TSDoc present; README current and validated.
11. Version/tooling compatibility; avoid deprecated APIs.
12. Logs structured/safe; errors contextualized and sanitized.

---

## Module Index (Toggle)

- Language:
    - @rule:rules/lang/TYPESCRIPT.md
    - @rule:rules/lang/TSDOC.md
- Frameworks:
    - @rule:rules/frameworks/NEXTJS.md
- Documentation:
    - @rule:rules/docs/MARKDOWN.md
    - @rule:rules/core/README_RULES.md
- Testing:
    - @rule:rules/testing/E2E_CYPRESS.md
- Security:
    - @rule:rules/security/SECURITY_ENV.md
- Project:
    - @rule:rules/project/ARCHITECTURE.md
    - @rule:rules/project/CODING_STYLE.md
- JetBrains:
    - @rule:rules/jetbrains/JETBRAINS_ASSISTANT.md

---

## Bundles

See @rule:rules/INDEX.md for curated bundles:

- web-app: core + TypeScript + Next.js + TSDoc + Security + Architecture + Coding Style
- docs-only: core + Markdown + README rules
- test-rig: core + Cypress + Security
