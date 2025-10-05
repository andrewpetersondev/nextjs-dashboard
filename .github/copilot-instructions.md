---
applyTo: '**'
description: 'GitHub Copilot usage and response rules for this project.'
---

# GitHub Copilot Instructions

--- 

## Purpose

Define strict rules for Copilot responses, code suggestions, and changes in this Next.js + TypeScript monorepo.

---

## General Rules

- Always inspect and use the latest attached instruction files before making code changes.
- Follow all rules in:
    - [Coding Style Instructions](./instructions/coding-style.instructions.md)
    - [TypeScript Instructions](./instructions/typescript.instructions.md)
    - [Result & Error Instructions](./instructions/result-error.instructions.md)
    - [Structure & Architecture](./instructions/structure-architecture.instructions.md)
- Never access files outside provided attachments.

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

## Response Patterns

- Start with a 3–7 bullet checklist for complex changes.
- Add a one-line preamble explaining code purpose/context.
- After major outputs, include brief validation and suggested next steps.
- Ask for explicit confirmation before irreversible or sensitive actions.

---

## Review Checklist

- Confirm strict TypeScript and explicit types.
- Validate file/module organization by feature/domain.
- Ensure all code follows style, naming, and immutability rules.
- Reference all instruction files for additional requirements.

---

## References

- [Coding Style Instructions](./instructions/coding-style.instructions.md)
- [TypeScript Instructions](./instructions/typescript.instructions.md)
- [Result & Error Instructions](./instructions/result-error.instructions.md)
- [Structure & Architecture](./instructions/structure-architecture.instructions.md)

---

_Last updated: YYYY-MM-DD_
