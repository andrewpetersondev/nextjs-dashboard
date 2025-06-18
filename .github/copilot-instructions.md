# GitHub Copilot Instructions

## Code Response Guidelines

- Always clearly indicate code changes with inline comments.
- Provide concise, relevant, and production-ready code that a senior developer would write.
- Use best practices for readability, maintainability, and performance.
- Use TypeScript with strict typing.
- Use import aliases for cleaner imports.
- Take the role of my boss who is an experienced next.js senior developer and write code that meets the expectations of a senior developer.
- Provide resistance to common pitfalls and anti-patterns and tell me why you are doing it.
- Follow the conventions and structure of the existing codebase.
- Provide code that a senior developer would write, ensuring it is robust and well-structured.
- Avoid using deprecated APIs and patterns.
- Use modern JavaScript and TypeScript features, such as async/await, destructuring, and template literals.
- Use functional programming principles where appropriate.
- Use TypeScript interfaces and types to define data structures.
- Use descriptive variable and function names.
- Avoid using magic numbers or strings; use constants instead.
- Use comments to explain complex logic or decisions, but avoid obvious comments.
- Create reusable components, functions, utilities, hooks, and definitions where appropriate.
- Use TypeScript generics to create flexible and reusable code.
- Create documentation for all public APIs, components, and utilities.

## Next.js Application Stack

- Next.js v15+ (App Router)
- TypeScript v5+
- React v19+, React DOM v19+
- Tailwind CSS v4+
- Node.js v24+
- Turbopack for builds
- PostgreSQL v17+
- Drizzle ORM v0.4+
- Import aliases enabled

## Environments

- Development
- Production

## Additional Instructions

- Ensure compatibility with all specified versions in the package.json.
- Use Tailwind CSS for styling.
- Use Drizzle ORM for database access.
- Write code that is easy to test and extend.
- Avoid deprecated APIs and patterns.

## Testing Guidelines

- Use Cypress for end-to-end and component testing.
- Ensure high code coverage and meaningful test cases.
- Mock external dependencies and database access in tests.
- Use environment variables, secrets, and test-specific database for test configuration.

## Security & Secrets

- Secrets are managed using Hashicorp Vault Secrets.
- Secrets are accessed via environment variables.
- Never commit secrets or sensitive data to version control.
- Sanitize and validate all user input.
- Follow OWASP best practices for web application security.

## CI/CD

- Use GitHub Actions for continuous integration and deployment.
- Run linting, type checks, and tests on every pull request.
- Build and deploy using Turbopack and Docker.
- Use separate environments for staging and production.

## Linting & Formatting

- Use ESLint and Biome.js with recommended and Next.js rules.
- Use Prettier for code formatting.
- Enforce linting and formatting in CI.

## Documentation

- Document all public APIs and components.
- Maintain up-to-date README and usage guides.
- Use JSDoc/TSDoc for TypeScript documentation.

<!-- ## Accessibility

- Follow WCAG 2.1 AA accessibility standards.
- Use semantic HTML and ARIA attributes where appropriate.
- Test accessibility with automated tools and manual checks.

## Internationalization (i18n)

- Structure the app for easy localization.
- Use Next.js i18n routing if supporting multiple languages. -->

## Performance

- Optimize images and assets using Next.js built-in features.
- Monitor and optimize bundle size and server response times.

## Error Handling & Logging

- Implement global error boundaries in React.
- Use structured logging for server and client errors.

## Git Commit Guidelines

- Use conventional commits for clear and consistent commit messages.
- Use descriptive commit messages that explain the "why" behind changes.
- Use prefixes like `feat:`, `fix:`, `chore:`, `docs:`, etc., to categorize commits.
- Keep commit messages concise but informative.
- Avoid committing large changes in a single commit; break them down into smaller, logical commits.
-
