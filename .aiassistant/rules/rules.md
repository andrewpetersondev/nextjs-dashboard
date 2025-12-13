---
apply: always
---

- Use APIs compatible with Next.js v15+, React 19+, and TypeScript 5.9+. Do not use deprecated APIs.
- Sort object literal properties, interfaces, and types alphabetically (Biome's style).
- Organize features under `@/modules/{feature}/{domain,server,ui}`.
- Place shared UI components in `@/ui` using Atomic Design (atoms, molecules).
- Use the Result pattern (Ok/Err) from @/shared/result at system boundaries (adapters, services). Adapters must return Result and not throw; application layers handle mapping and policy.
- Always explicitly type function return values and arguments.
- Do not use re-exports or create barrel files.
- Do not automatically add test files.
- If generating documentation, use TSDoc. Avoid JSDoc.
- Use error factories from `@/shared/errors/factories/app-error.factory`
- Use error codes instead of custom error subclasses.
