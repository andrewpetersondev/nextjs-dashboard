# GitHub Copilot Instructions

## Table of Contents

- [Code Response Guidelines](#code-response-guidelines)
- [TypeScript Best Practices](#typescript-best-practices)
- [Naming Conventions](#naming-conventions)
- [Testing Guidelines](#testing-guidelines)
- [Security & Secrets](#security--secrets)
- [Documentation](#documentation)
- [Performance](#performance)
- [Error Handling & Logging](#error-handling--logging)
- [Accessibility & Internationalization](#accessibility--internationalization)
- [AI Code Review & Traceability](#ai-code-review--traceability)
- [AI Prompt Engineering & Feedback](#ai-prompt-engineering--feedback)
- [Resolving Instruction Conflicts](#resolving-instruction-conflicts)
- [Version Constraints](#version-constraints)
- [Additional Instructions](#additional-instructions)

## Code Response Guidelines

- Write code as an expert Next.js senior developer.
- Use TypeScript with strict typing and latest ECMAScript features.
- Provide code that satisfies `tsconfig.json`. Notably, tsconfig sets `exactOptionalPropertyTypes` to `true`.
- Avoid deprecated APIs and patterns.
- Ensure code is secure, maintainable, and scalable.
- Provide clear explanations for complex logic and architectural decisions.
- Prefer visual representations (diagrams, flowcharts) when explaining complex patterns.
- Always check the latest documentation for updates.
- Ensure compatibility with versions specified in `package.json`.

## TypeScript Best Practices

- Use `interface` for object shapes, `type` for unions/intersections.
- Use generics for flexible, type-safe utilities, components, and hooks.
- Explicitly annotate function parameters, return types, and component props.
- Use `enum` or `as const` for related constants.
- Avoid `any`; use `unknown` or specific types.
- Leverage utility types (`Partial`, `Pick`, `Omit`, `Record`, etc.).
- Use type guards and assertion functions to narrow types.
- Document all types, interfaces, and generics with TSDoc.
- Handle `undefined` and `null` explicitly.
- Prefer `readonly` and immutable types where possible.

## Naming Conventions

- Use kebab-case for file and directory names.
- Use PascalCase for React components and TypeScript types/interfaces.
- Use camelCase for variables and functions.

## Testing Guidelines

- Use Cypress for end-to-end and component testing.
- Ensure compatibility with Next.js, TypeScript, ESM, and latest Next.js version.
- Achieve high code coverage and meaningful test cases.
- Mock external dependencies and database access.
- Use environment variables and test-specific databases for configuration.

## Security & Secrets

- Manage secrets with Hashicorp Vault, accessed via environment variables.
- Never commit secrets or sensitive data to version control.
- Sanitize and validate all user input.
- Follow OWASP best practices for web application security.

## Documentation

- Document all files, components, utilities, and APIs using TSDoc.
- Keep README and usage guides up to date.
- Use TSDoc for TypeScript documentation.

## Performance

- Optimize images and assets using Next.js built-in features.
- Monitor and optimize bundle size and server response times.

## Error Handling & Logging

- Implement global error boundaries in React using ErrorBoundary components.
- Use structured logging (e.g., JSON format) for server and client errors.
- Log errors with sufficient context for debugging, without exposing sensitive data.

## Accessibility & Internationalization

- Ensure all UI components are accessible (WCAG 2.1 AA or better).
- Use semantic HTML and ARIA attributes where appropriate.
- Support internationalization and localization best practices.

## AI Code Review & Traceability

- Review all AI-generated code for correctness, security, and maintainability.
- Ensure AI-generated code does not introduce licensing or attribution issues.
- Document significant AI-generated code contributions in commit messages or PR descriptions.

## AI Prompt Engineering & Feedback

- Provide clear, specific prompts to Copilot for optimal results.
- Give feedback on AI suggestions to improve future code quality.

## Resolving Instruction Conflicts

- If instructions conflict, consult the project maintainer for clarification.

## Version Constraints

- All version requirements are specified in the `package.json` file. Ensure responses are compatible with these versions.

## Additional Instructions

- Avoid deprecated APIs and patterns.
- Ensure code is inclusive and free from bias.
