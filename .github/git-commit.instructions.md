---
applyTo: '**'
description: 'Commit message standards and workflow for Next.js + TypeScript monorepo.'
---

# Git Commit Instructions

## Purpose

Enforce Conventional Commits for clarity, traceability, and automation.  
Reference [Coding Style Instructions](./instructions/coding-style.instructions.md)
and [TypeScript Instructions](./instructions/typescript.instructions.md) for code changes.

---

## Conventional Commit Format

All commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

`<type>(<scope>)<optional !>: <description>`

- **type**: feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert
- **scope**: component, file, or domain (optional)
- **!**: breaking change indicator
- **description**: concise summary (imperative, lower case, no period)

**Examples:**

- feat(auth): add OAuth2 login with Google
- fix(api): sanitize user input to prevent SQL injection
- docs(readme): update setup instructions for macOS
- chore(deps): upgrade next.js to v15.2.0
- feat(api)!: change user authentication method (BREAKING CHANGE)

---

## Guidelines

- Explain "why" in the body, not just "what".
- Subject line ≤72 characters.
- Use body for context, rationale, or breaking changes.
- Start breaking change notes with `BREAKING CHANGE:`.
- Reference issues/PRs (e.g., `Closes #123`).
- Split large changes into logical commits.
- Never commit secrets or sensitive data.
- Run lint, type checks, and tests before committing.
- Use [commitlint](https://commitlint.js.org/) and [Husky](https://typicode.github.io/husky/#/) to enforce standards.

---

## Commit Message Template

`<type>(<scope>)<optional !>: <short summary>`

[Optional body: what, why, context, breaking changes.
For breaking changes, begin with `BREAKING CHANGE:`]

[References: issues, PRs]

---

## Example (non-breaking change)

feat(dashboard): add user activity graph

Add a new user activity graph to the dashboard page using Chart.js.
Improves visibility into user engagement trends.

Closes #42

---

## Example (breaking change)

feat(auth)!: migrate authentication to OAuth2

BREAKING CHANGE: The authentication system now uses OAuth2 exclusively.
Legacy login endpoints have been removed.
Clients must update to use the new authentication flow.

Closes #180

---

## Review Checklist

- Commit format follows Conventional Commits.
- Subject is concise and imperative.
- Body explains rationale and context.
- Breaking changes are clearly marked.
- No secrets or sensitive data.
- Lint, type checks, and tests pass.

---

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Commitizen](https://github.com/commitizen/cz-cli)
- [commitlint](https://commitlint.js.org/)
- [Husky](https://typicode.github.io/husky/#/)
