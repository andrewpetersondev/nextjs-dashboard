# Git Commit Guide

## Format

`<type>(<scope>)<!>: <summary>`

- types: feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert
- scope: optional component or domain
- `!`: indicates a breaking change
- summary: imperative, concise, no period

## Rules

- Subject ≤72 chars.
- Explain the "why" in the body when useful.
- Start breaking notes with `BREAKING CHANGE:` in the body.
- Reference issues/PRs (e.g., `Closes #123`).
- Split large changes into logical commits.
- Never commit secrets.
- Run lint, type checks, and tests before committing.
- Enforce with commitlint + Husky.

## Template

`<type>(<scope>)<!>: <short summary>`

[Optional body: what/why/context.  
For breaking changes, begin with `BREAKING CHANGE:`]

[References: issues, PRs]

## Examples

feat(dashboard): add user activity graph

Add a new user activity graph using Chart.js to show engagement trends.

Closes #42

feat(auth)!: migrate authentication to OAuth2

BREAKING CHANGE: OAuth2 replaces legacy login endpoints.  
Clients must update to the new authentication flow.

Closes #180

## Checklist

- Conventional Commits format used.
- Subject is imperative and concise.
- Body provides necessary context.
- Breaking changes clearly marked.
- No secrets or sensitive data.
- Lint, type, and tests pass.

## References

- Project docs: `./instructions/coding-style.instructions.md`, `./instructions/typescript.instructions.md`,
  `./instructions/result-error.instructions.md`, `./instructions/structure-architecture.instructions.md`

_Last updated: 2025-10-08 • 
