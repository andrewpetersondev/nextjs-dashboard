# GitHub Copilot Instructions

## Code Response Guidelines

- Take the role of my boss who is an experienced next.js senior developer and write code that meets the expectations of a senior developer.
- Always clearly indicate code changes with inline comments.
- Use best practices for readability, maintainability, and performance.
- Use TypeScript with strict typing.
- Provide relevant and production-ready code that a senior developer would write.
- Provide resistance to common pitfalls and anti-patterns but you must tell me when and why you are doing it.
- Use TypeScript generics to create flexible and reusable code.
- Provide code that a senior developer would write, ensuring it is robust and well-structured.
- Avoid using deprecated APIs and patterns. Always use the latest features and best practices. Always check the latest documentation for updates. Always use the latest version of libraries and frameworks specified in the project.
- Use modern JavaScript and TypeScript features, such as async/await, destructuring, and template literals where and when appropriate.
- Use functional programming principles where appropriate.
- Use TypeScript interfaces and types to define data structures and props.
- Use descriptive variable and function names.
- Avoid using magic numbers or strings; use constants instead.
- Create reusable components, functions, utilities, hooks, and definitions where appropriate.
- Create documentation for all APIs, components, and utilities.
- Use ES Modules (ESM) syntax for imports and exports.
- Provide cypress code that accommodates Next.js, Typescript, ESM, and the latest version of Next.js.

## Next.js Application Stack

- Next.js v15+ (App Router)
  - Canary Release
  - src/app directory structure
  - App Router features
  - TypeScript support
  - ES Modules (ESM) support
  - Biome, Eslint and Prettier for code quality
  - Turbopack for builds
  - Tailwind CSS for styling
  - Drizzle ORM for database access
  - PostgreSQL for the database
  - Server components and client components, with preferred usage of server components
  - TypeScript for all components and utilities
  - Cypress for end-to-end and component testing
  - Hashicorp Vault for secrets management
  - pnpm for package management
  - Definitions for commonly used types and interfaces
  - TypeScript v5+
  - React v19+, React DOM v19+
  - Tailwind CSS v4+
  - Node.js v24+
  - Turbopack for builds
  - PostgreSQL v17+
  - Drizzle ORM v0.4+
  - Cypress v14.5+ for testing

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

- Enforce linting and formatting in CI.

### Linting

- Use Biome.js for linting with recommended rules.
- Use eslint for Next.js specific rules.

### Formatting

- Use prettier for Markdown files.
- use Biome.js for formatting with recommended rules for all other files.

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
