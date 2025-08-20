Here is a simple, production-ready `README.md` for your project root, following senior-level Next.js and TypeScript best practices. It documents the project purpose, structure, tech stack, and key conventions.

# Next.js Dashboard

A modern, production-ready dashboard application built with Next.js (App Router), TypeScript, Drizzle ORM, and Tailwind CSS.

## Features

- Next.js v15+ (App Router, Server Components)
- TypeScript v5+ with strict typing
- Drizzle ORM v0.4+ and PostgreSQL v17+
- Tailwind CSS v4+ for styling
- Cypress v14.5+ for E2E and component testing
- Hashicorp Vault for secrets management
- Biome, ESLint, and Prettier for code quality
- Turbopack for builds
- GitHub Actions for CI/CD

## Project Structure

```
nextjs-dashboard/
├── src/
└── ...
```

## Getting Started

1. **Install dependencies:**

   ```sh
   pnpm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` and configure as needed.
   - Secrets are managed via Hashicorp Vault and injected as environment variables.

3. **Run the development server:**

   ```sh
   pnpm dev
   ```

4. **Run tests:**
   - Unit/Integration: `pnpm test`
   - Cypress: `pnpm cypress open`

## Conventions

- **TypeScript:** Use strict typing everywhere.
- **Components:** Prefer server components; use client components only when necessary.
- **Testing:** Use Cypress for E2E/component tests, Jest/Vitest for unit/integration.
- **Secrets:** Never commit secrets. Use environment variables and Vault.
- **Linting/Formatting:** Enforced via Biome, ESLint, and Prettier.

## Documentation

- See `src/README.md` and subfolder `README.md` files for detailed structure and conventions.
- All public APIs and components are documented with TSDoc.

## License

MIT
