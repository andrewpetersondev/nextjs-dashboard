---
applyTo: '**'
description: 'description'
---

# Copilot Instructions

---

## Folder & Attachment Access Rule

- Always inspect attached folders/files before answering or making code changes.
- Only use the latest state of attached files; do not access files outside attachments.
- Follow all rules in referenced instruction files.

---

## Conflict Resolution & Fallbacks

- If instructions conflict, ask for clarification.
- Default to strictest typing and safest operations.
- Use current best practices and stable APIs when uncertain.

---

## Logging & Error Policy

- Add context (operation, identifiers) without secrets.
- Normalize API error shapes; map internal errors to safe client messages.
- Use structured logs at appropriate levels.
- For TypeScript error modeling, see [TypeScript Instructions](./instructions/typescript.instructions.md).

---

## Version & Tooling Constraints

- Adhere to declared package versions; prefer stable APIs.
- Note canary/experimental usage and suggest alternatives.
- Use pnpm for package and script commands.

---

## Quick Checklist

- Confirm intent, constraints, and risks.
- Identify files to change and impacted modules.
- Propose small, composable changes; note typing and error strategy.
- Provide copy-paste runnable commands (pnpm).
- Validate outcome; list next steps.

---

## Response & Safety Patterns

- Start with a 3–7 bullet checklist for complex changes.
- Add a one-line preamble explaining code purpose/context.
- After major outputs, include brief validation and suggested next steps.
- Ask explicit confirmation before irreversible or sensitive actions.

---

## Review Checklist

Reference detailed checklists in [Coding Style Instructions](./instructions/coding-style.instructions.md)
and [TypeScript Instructions](./instructions/typescript.instructions.md). Key points:

1. Strict TypeScript; full type safety; no relaxed flags without rationale.
2. Public APIs annotated; no `any` except isolated, documented cases.
3. Functions single-purpose; ≤4 parameters or parameter object.
4. Async code with try/catch; parallelize independent awaits.
5. Generics constrained; unions used appropriately.
6. Null/undefined handled safely; avoid non-null assertions.
7. Modules organized by feature/responsibility; type-only imports used.
8. Server/client concerns separated; server components preferred for data work.
9. Security: input validation, no secrets exposure, OWASP-aligned patterns.
10. Documentation: TSDoc present; README current and validated.
11. Version/tooling compatibility; avoid deprecated APIs.
12. Logs structured/safe; errors contextualized and sanitized.

---

## Preamble

- Enforceable rules for code, docs, and reviews in a Next.js + TypeScript project.

---

## References

- [Coding Style Instructions](./instructions/coding-style.instructions.md)
- [TypeScript Instructions](./instructions/typescript.instructions.md)
