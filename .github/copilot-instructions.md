# GitHub Copilot Instructions

## Code Response Guidelines

- Always clearly indicate code changes with inline comments or highlights.
- Provide concise, relevant, and production-ready code.
- Use best practices for readability, maintainability, and performance.
- Prefer TypeScript with strict typing.
- Use import aliases for cleaner imports.
- Follow the conventions and structure of the existing codebase.
- Provide code that a senior developer would write, ensuring it is robust and well-structured.

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

<!--
## Docker Setup

- Docker Compose v2.33+
- Services:
  - Node.js (web)
  - PostgreSQL (db)
  - PostgreSQL (testDB)
  - Adminer (adminer)
  - Cypress (cypress)
- Use secrets for sensitive configuration
-->

## Environments

- Development
- Production

## Additional Instructions

- Ensure compatibility with all specified versions.
- Use Tailwind CSS for styling.
- Use Drizzle ORM for database access.
- Write code that is easy to test and extend.
- Avoid deprecated APIs and patterns.

## Testing Guidelines

- Use Cypress for end-to-end testing.
- Run end-to-end tests in docker container.
- Use Cypress for component tests.
- Ensure high code coverage and meaningful test cases.
- Mock external dependencies and database access in tests.
- Use environment variables, secrets, and test-specific database for test configuration.

## Security & Secrets

- Store secrets using Docker secrets or environment variables.
- Never commit secrets or sensitive data to version control.
- Sanitize and validate all user input.
- Follow OWASP best practices for web application security.

## CI/CD

- Use GitHub Actions for continuous integration and deployment.
- Run linting, type checks, and tests on every pull request.
- Build and deploy using Turbopack and Docker.
- Use separate environments for staging and production.

## Linting & Formatting

- Use ESLint with recommended and Next.js rules.
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
- Use React Suspense and streaming for improved UX.
- Monitor and optimize bundle size and server response times.

## Error Handling & Logging

- Implement global error boundaries in React.
- Use structured logging for server and client errors.
- Store logs securely and monitor for anomalies.
