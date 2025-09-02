Great progress. Here’s a pragmatic next-refactor plan to solidify boundaries and DX, in roughly highest value order:

1) Enforce the boundaries with linting/CI
- Biome rules:
    - Forbid process.env outside env-next.ts and env-node.ts (regex-based no-restricted-syntax).
    - Forbid importing node-only/** from src/app or any client-facing code.
    - Allow importing env-shared.ts from both env-next.ts and env-node.ts only.
- Add these checks to your CI so violations fail fast.

2) Add a client env module
- Create a tiny client-only module (e.g., src/shared/config/env-client.ts) that validates and exports only NEXT_PUBLIC_* variables with Zod. Throw at build time when missing/invalid.
- Replace any direct process.env usage in client components with imports from this module.
- This completes the separation: shared (types/helpers), server env, node env, client env.

3) Minimize duplication in DB URL resolution (optional now, easy later)
- If node-only tools (migrations, seeds) also need DB URL fallback logic, extract a framework-agnostic resolveDatabaseUrl helper to env-shared.ts and reuse it in env-next.ts and node tools.
- Keep it dependency-free; just pure types and logic.

4) Path aliases and import hygiene
- Add tsconfig baseUrl/paths so src/shared/config/env-shared is imported via a clean alias (e.g., @shared/config/env-shared). Improves clarity and enables stricter no-restricted-imports.
- Consider a dedicated alias for node-only (e.g., @node-only/*) so it’s easy to forbid in client code.

5) Make Node-only scripts deterministic
- Ensure node-only scripts (seeds, migrations, CLI) load envs deterministically:
    - Either rely on dotenv-cli in scripts (already present), or
    - Use @next/env’s loadEnvConfig at the script entrypoint to load .env.[mode] before parsing.
- Document which .env file each script expects.

6) Add smoke tests for each env module
- Write tiny tests that import env-next, env-node, and env-client (once added) with known env fixtures:
    - Success path: expected envs provided.
    - Failure path: confirm helpful error messages.
- This protects against accidental schema regressions.

7) Improve developer guidance
- Add a short ENV README to document:
    - Which module to import where (node-only, server, client).
    - Which variables are allowed in each (e.g., NEXT_PUBLIC_* for client).
    - How DATABASE_ENV is derived and how strict mode behaves.
    - How to run tooling with correct .env files.

8) Progressive migration away from process.env
- Run a project-wide search for process.env and migrate remaining call sites to the appropriate env module:
    - Server code -> env-next.ts exports.
    - Node tools -> env-node.ts exports.
    - Client -> client env module exports.
- Keep a temporary allowlist where migration isn’t trivial, then remove it.

9) Observability and safety niceties
- Mask secrets in error messages and logs (never echo full DATABASE_URL or SESSION_SECRET).
- Log the resolved DATABASE_ENV and whether strict mode is enabled at app start (server logs only).

10) Future hardening (optional)
- Add runtime detection guards:
    - env-next.ts: if imported in a browser bundle, throw an explicit error (defense-in-depth; Next’s “server-only” already helps).
    - env-node.ts: detect if running in a browser and warn/throw.

If you want, I can:
- Draft the client env module with Zod validation.
- Propose Biome rules to enforce “no process.env outside env modules” and “no node-only imports from client”.
