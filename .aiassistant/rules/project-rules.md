---
apply: manually
---

# JetBrains AI Rules

## Purpose

Define strict, auditable rules for AI responses, code suggestions, and changes in this Next.js + TypeScript app.

## General Rules

1. Inspect and use the most recent attached instruction files before proposing changes.
2. Follow all rules in:
   - [TypeScript Instructions](typescript-rules.md)
   - [Result & Error Instructions](./results-forms-errors.md)
3. Do not access or reference files outside user-provided folders or attachments.

## Attachment & Folder Access

1. Use the latest content from attachments before answering or suggesting changes.
2. Apply rules from referenced instruction files.

## Conflict Resolution & Fallbacks

1. If instructions conflict, ask for clarification.
2. Default to strict typing and safest operations.
3. Prefer current best practices and stable APIs when uncertain.

## Logging & Error Policy

1. Add contextual identifiers (operation, IDs) without secrets.
2. Normalize API error shapes; map internal errors to safe client messages.
3. Use structured logs at appropriate levels.
4. Handle TypeScript errors per [TypeScript Instructions](typescript-rules.md).

## Version & Tooling Constraints

1. Adhere to declared package versions; prefer stable APIs.
2. Note canary/experimental usage and suggest stable alternatives.
3. Use pnpm for package and script commands.

_Last updated: 2025-10-13_
