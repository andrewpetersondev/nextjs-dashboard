# .github/git-commit-instructions.md

# Git Commit Instructions

## Conventional Commit Format

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification:

<type>[optional scope]: <description>

- **type**: feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert
- **optional scope**: (component, file, or domain in parentheses)
- **description**: concise summary of the change (imperative, lower case, no period)

**Examples:**

- feat(auth): add OAuth2 login with Google
- fix(api): sanitize user input to prevent SQL injection
- docs(readme): update setup instructions for macOS
- chore(deps): upgrade next.js to v15.2.0

## Guidelines

- Use the commit message to explain the "why" behind the change, not just the "what".
- Keep the subject line under 72 characters.
- Use the body (after a blank line) for additional context, rationale, or breaking changes.
- Reference related issues or pull requests (e.g., `Closes #123`).
- Separate large changes into multiple, logical commits.
- Do not commit secrets, sensitive data, or environment-specific configuration.
- Run lint, type checks, and tests before committing.

## Commit Message Template

<type>(<scope>): <short summary>

[Optional body: what, why, context, breaking changes]

[References: issues, PRs]

---

**Example:**

feat(dashboard): add user activity graph

Add a new user activity graph to the dashboard page using Chart.js.
Improves visibility into user engagement trends.

Closes #42

---

## Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Commitizen](https://github.com/commitizen/cz-cli) for interactive commit messages
