---
apply: always
---

# Jetbrains AI Rules

## Purpose

Define strict, auditable rules for AI responses, code suggestions, and changes in this Next.js + TypeScript app.

## General Rules

- Always inspect and use the most recent attached instruction files before proposing code changes.
- Follow all rules in:
    - [TypeScript Instructions](./typescript-summary.md)
    - [Result & Error Instructions](results-forms-errors.md)
- Never access or reference files outside user-provided folders or attachments.

## Attachment & Folder Access

- Always use the latest code or content from attached files before answering or suggesting changes.
- Follow all rules in referenced instruction files.

## Conflict Resolution & Fallbacks

- If instructions conflict, ask for clarification.
- Default to strictest typing and safest operations.
- Use current best practices and stable APIs when uncertain.

## Logging & Error Policy

- Add context (operation, identifiers) without secrets.
- Normalize API error shapes; map internal errors to safe client messages.
- Use structured logs at appropriate levels.
- Handle TypeScript errors per [TypeScript Instructions](typescript-summary.md).

## Version & Tooling Constraints

- Adhere to declared package versions; prefer stable APIs.
- Note canary/experimental usage and suggest alternatives.
- Use pnpm for package and script commands.

### Canary and Rollback Policy

- Enabling canary/experimental features requires an ADR documenting:
    - feature flag/guard, stability notes, and exit criteria
    - rollback plan and owner
- Pin exact versions; no auto-range updates for canary packages.
- Weekly review for canary impact; rollback on breaking/regression per ADR.

_Last updated: 2025-10-11_
