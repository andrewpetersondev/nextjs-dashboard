---
apply: manually
---

# Jetbrains AI Rules

## Purpose

Define strict, auditable rules for AI responses, code suggestions, and changes in this Next.js + TypeScript app.

## Scope & Audience

- Audience: AI contributors and human maintainers.
- Applies to: all code changes, documentation updates, design/ADR notes, and CI/CD configs.
- Contexts: proposal, review, and merge phases; interactive assistant sessions included.

## General Rules

- Always inspect and use the most recent attached instruction files before proposing code changes.
- Follow all rules in:
    - [Coding Style Instructions](./coding-style.md)
    - [TypeScript Instructions](typescript-summary.md)
    - [Result & Error Instructions](result-error-summary.md)
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

## Response Format & Quick Checklist

- For complex changes, begin with a 3–7 bullet checklist.
- Always explain code purpose/context before code or file edits.
- Always confirm intents, constraints, and affected files before acting.
- Suggest small, composable changes; mention typing and error handling approaches.
- Provide ready-to-use pnpm commands where relevant.
- Summarize validation and suggest clear next steps.
- Prompt for explicit user confirmation before any sensitive/irreversible action.

## Review Checklist

- TypeScript is strict; all exports have explicit types (no implicit `any`).
- Files are organized by feature/domain and follow naming/immutability guidelines.
- All code and suggestions reference and align with instruction files.
- Changes are cross-referenced in file headers.

## Rule Precedence

- Precedence for resolving conflicts:
    1) project-rules.md
    2) typescript-summary.md
    3) result-error.md
    4) coding-style.md
    5) md-docs.md
- When unsure, ask for clarification and default to stricter typing and safer operations.

## Testing Policy

- Minimum coverage targets: 80% lines and branches for affected packages.
- Accessibility: run cypress-axe; fail on “critical” and “serious” violations.
- Place tests alongside features by layer (e.g., src/features/..., src/server/..., src/ui/...).

_Last updated: 2025-10-05_
