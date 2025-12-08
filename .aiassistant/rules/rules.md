---
apply: always
---

- Use APIs compatible with Next.js v15+, React 19+, and TypeScript 5.9+. Do not use deprecated APIs.
- Sort object literal properties, interfaces, and types alphabetically (Biome's style).
- Organize feature-specific code in `src/modules/{feature}` with `domain`, `server`, and `ui` subdirectories.
- Place shared UI components in `src/ui` following Atomic Design (atoms, molecules).
- Use the Result pattern (`Ok`/`Err`) for service layer operations instead of throwing exceptions.
- Always explicitly type function return values and arguments.
- Do not use re-exports or create barrel files.
- Do not automatically add test files.
- If generating documentation, use TSDoc. Avoid JSDoc.
- Use error factories from src/shared/errors/app-error.factory.ts.
- Use error codes instead of custom error subclasses.
