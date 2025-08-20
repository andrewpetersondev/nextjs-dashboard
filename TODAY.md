Partial Organizational Refactor by runtime

/
├─ app/ # Next.js App Router routes
│ ├─ (marketing)/ # Route groups (example)
│ ├─ (dashboard)/ # Route groups (example)
│ ├─ api/ # Route handlers
│ └─ global-error.tsx # Global error boundary (optional)
├─ src/
│ ├─ core/ # Domain models, types, branded types
│ ├─ errors/ # Shared error classes
│ ├─ lib/
│ │ ├─ utils/
│ │ │ ├─ logger.ts # pino setup
│ │ │ └─ env.ts # runtime-safe env access
│ │ ├─ http/ # fetch clients, interceptors
│ │ └─ auth/ # auth helpers, jose utils
│ ├─ server/
│ │ ├─ db/ # drizzle schema, client
│ │ ├─ repositories/ # repository layer
│ │ ├─ services/ # business logic
│ │ └─ actions/ # server actions (App Router)
│ ├─ ui/ # shared components (client/server)
│ ├─ hooks/ # shared hooks
│ ├─ styles/ # Tailwind entry, globals.css
│ └─ schemas/ # zod schemas, validation
├─ cypress/
│ ├─ e2e/
│ ├─ fixtures/
│ ├─ support/
│ │ ├─ commands.ts
│ │ └─ e2e.ts
│ └─ tsconfig.json
├─ scripts/ # Node/TS scripts (migrations, seeds)
├─ drizzle/
│ ├─ migrations/
│ └─ meta/
└─ docs/ # Architectural docs, ADRs

{
"scripts": {
"dev": "next dev",
"build": "next build",
"start": "next start",
"typecheck": "tsc -p tsconfig.json --noEmit",
"lint": "biome check --error-on-warnings",
"format": "biome check --write",
"format:verify": "biome check",
"depcheck": "depcheck --skip-missing=true",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio",
"db:seed": "tsx scripts/seed.ts",
"test:e2e": "cypress run",
"test:e2e:open": "cypress open",
"test:ci": "pnpm typecheck && pnpm lint && pnpm build && pnpm test:e2e"
}
}
