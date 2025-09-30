# Git Commit Instructions

## Conventional Commit Format

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification:

<type>[optional scope][!]: <description>

- **type**: feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert
- **optional scope**: (component, file, or domain in parentheses)
- **!**: add immediately after type or scope to indicate a breaking change (e.g., `feat(api)!: ...`)
- **description**: concise summary of the change (imperative, lower case, no period)

**Examples:**

- feat(auth): add OAuth2 login with Google
- fix(api): sanitize user input to prevent SQL injection
- docs(readme): update setup instructions for macOS
- chore(deps): upgrade next.js to v15.2.0
- feat(api)!: change user authentication method (BREAKING CHANGE)

## Guidelines

- Use the commit message to explain the "why" behind the change, not just the "what".
- Keep the subject line under 72 characters.
- Use the body (after a blank line) for additional context, rationale, or breaking changes.
- Start breaking change notes in the body with `BREAKING CHANGE:` followed by details.
- Reference related issues or pull requests (e.g., `Closes #123`).
- Separate large changes into multiple, logical commits.
- Do not commit secrets, sensitive data, or environment-specific configuration.
- Run lint, type checks, and tests before committing.
- Optionally use tooling (e.g., [commitlint](https://commitlint.js.org/), [Husky](https://typicode.github.io/husky/#/)) to enforce commit standards.

## Commit Message Template

<type>(<scope>)<optional !>: <short summary>

[Optional body: what, why, context, breaking changes.  
For breaking changes, begin with `BREAKING CHANGE:`]

[References: issues, PRs]

---

**Example (non-breaking change):**

feat(dashboard): add user activity graph

Add a new user activity graph to the dashboard page using Chart.js.
Improves visibility into user engagement trends.

Closes #42

---

**Example (breaking change):**

feat(auth)!: migrate authentication to OAuth2

BREAKING CHANGE: The authentication system now uses OAuth2 exclusively. 
Legacy login endpoints have been removed. 
Clients must update to use the new authentication flow.

Closes #180

---

## Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Commitizen](https://github.com/commitizen/cz-cli) for interactive commit messages
- [commitlint](https://commitlint.js.org/) for linting commit messages
- [Husky](https://typicode.github.io/husky/#/) for Git hooks
