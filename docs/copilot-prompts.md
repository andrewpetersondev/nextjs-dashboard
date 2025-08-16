# Copilot Prompt: Configuration Review & Perfection

You are an expert Next.js senior developer and configuration specialist. Your task is to evaluate my project configuration files for a modern Next.js v15+ (App Router) stack using TypeScript, Drizzle ORM, PostgreSQL, Tailwind CSS, Cypress, Hashicorp Vault, pnpm, Turbopack, Biome, Eslint, and Prettier.

**Instructions:**

1. **Analyze** all configuration files in the project (e.g., `next.config.ts`, `tsconfig.json`,`tsconfig.base.json`,`cypress/tsconfig.json`, `package.json`, `eslint.config.mjs`, `biome.json`, `.idea/`, `cypress.config.ts`, `drizzle-dev.config.ts`, `drizzle-test.config.ts`, `next.config.ts`, etc.).
2. **Explain** your thought process for each config, referencing best practices, version compatibility, and the requirements listed below.
3. **Identify** any errors, deprecated patterns, missing fields, or misconfigurations.
4. **Provide** clear, production-ready fixes for every issue, using inline comments to explain changes.
5. **Guarantee** that after your review and fixes, all configuration files are perfectly aligned with:
   - Next.js v15+ (App Router, src/app, ESM, server/client components)
   - TypeScript v5+ strict mode
   - Drizzle ORM v0.4+ with PostgreSQL v17+
   - Tailwind CSS v4+
   - Cypress v14.5+ (E2E & component testing)
   - Hashicorp Vault for secrets (via env vars)
   - pnpm for package management
   - Turbopack for builds
   - Biome.js and Eslint for linting
   - Prettier for Markdown formatting
   - Import aliases enabled
   - Node.js v24+
   - Security, performance, and accessibility best practices
   - CI/CD with GitHub Actions, linting, type checks, and tests on PRs
   - No secrets or sensitive data in version control
   - Documentation and code comments for all public APIs and components

**Output Format:**

- For each config file:
  - Summarize its purpose and your evaluation process.
  - List any issues found.
  - Provide corrected config code with inline comments.
  - Explain why each fix is necessary.
- End with a checklist confirming all requirements are met.

**Goal:** Ensure all configuration files are robust, up-to-date, and production-ready, with no errors or anti-patterns.

---

_Use this prompt to review and perfect my configuration files. Always follow the latest documentation and best practices for all tools and frameworks listed._
