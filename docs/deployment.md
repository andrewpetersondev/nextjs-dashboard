# Deployment

This app runs two ways, from the same codebase:

|          | **A. Managed (Vercel + Neon)** | **B. Self-hosted (Docker)**                |
| -------- | ------------------------------ | ------------------------------------------ |
| Best for | the always-on live demo        | proving it runs anywhere, local dev parity |
| Cost     | $0 on free tiers               | free locally; ~$4–6/mo on a VPS            |
| Ops      | none                           | yours (host, TLS, backups)                 |
| Database | Neon Postgres                  | Postgres container (or any Postgres)       |

The app is host-agnostic by design: it uses the standard `pg` driver and talks
to any Postgres over `DATABASE_URL`, has no Vercel-specific APIs, and builds to
a standalone Node server (`output: "standalone"`). Nothing below is locked in.

---

## Environment variables (the contract)

All environments need these. Validation lives in
`src/shared/core/config/` — the server **fails fast at startup** if any are
missing or malformed, so set them all.

| Variable                  | Example                               | Notes                                     |
| ------------------------- | ------------------------------------- | ----------------------------------------- |
| `DATABASE_URL`            | `postgresql://user:pass@host:5432/db` | Neon: append `?sslmode=require`           |
| `SESSION_SECRET`          | (long random string)                  | generate with `openssl rand -base64 48`   |
| `AUTH_BCRYPT_SALT_ROUNDS` | `12`                                  | positive integer                          |
| `SESSION_ISSUER`          | `my-app`                              | fixed value                               |
| `SESSION_AUDIENCE`        | `web`                                 | fixed value                               |
| `NODE_ENV`                | `production`                          |                                           |
| `DATABASE_ENV`            | `production`                          | selects the migration scope               |
| `LOG_LEVEL`               | `info`                                | `trace`\|`debug`\|`info`\|`warn`\|`error` |
| `NEXT_PUBLIC_NODE_ENV`    | `production`                          | inlined into the client bundle at build   |
| `NEXT_PUBLIC_LOG_LEVEL`   | `info`                                | inlined into the client bundle at build   |

**Demo logins** (created by the seed):

| Role  | Email             | Password            |
| ----- | ----------------- | ------------------- |
| Admin | `admin@admin.com` | `AdminPassword123!` |
| User  | `user@user.com`   | `UserPassword123!`  |
| Guest | `guest@guest.com` | `GuestPassword123!` |

---

## A. Vercel + Neon (managed)

The fastest path to a live URL. Steps marked 🔑 need your accounts.

1. **🔑 Neon** — create a project, copy its pooled `DATABASE_URL`, and append
   `?sslmode=require`.
2. **Migrate + seed Neon from your machine** — put the Neon URL in
   `.env.production.local`, then:
   ```bash
   pnpm db:migrate:prod   # apply schema
   pnpm db:seed:prod      # demo data + logins (only seeds an empty DB)
   ```
3. **🔑 Vercel** — import the GitHub repo (Next.js is auto-detected). Add every
   variable from the table above under Project → Settings → Environment
   Variables.
4. **Deploy** — Vercel builds on push to `main` and gives you a URL. Preview
   deploys per PR are on by default.
5. **Smoke test** — visit `/api/health` (expect `{"status":"ok","db":"up"}`),
   then sign in with the demo admin login.
6. **README** — add the live URL and CI badge.

Good to know:

- **Neon free tier scales to zero** when idle, so the _first_ request after a
  quiet period waits ~1s while the DB wakes. Fine for a demo.
- **Vercel Hobby is non-commercial / personal use only** — a portfolio project
  qualifies. Monetizing it would require Pro.

---

## B. Docker (self-hosted / standalone)

### One command, locally

```bash
docker compose up --build
# then open http://localhost:3000/auth/login  →  admin@admin.com / AdminPassword123!
```

This brings up three things: a **Postgres** container, a one-shot **migrate**
job that syncs the schema and seeds the demo data, then the **app** on
`:3000`. The seed only runs against an empty database, so re-running
`docker compose up` is safe.

```bash
curl localhost:3000/api/health     # {"status":"ok","db":"up",...}
docker compose down                # stop (keeps the DB volume)
docker compose down -v             # stop and wipe the DB
```

Override any default via the shell or a `.env` file beside `docker-compose.yml`
(`POSTGRES_PASSWORD`, `SESSION_SECRET`, `APP_PORT`, …).

### Just the image (bring your own Postgres)

```bash
docker build -t nextjs-dashboard .
docker run -p 3000:3000 --env-file .env.production.local nextjs-dashboard
```

Point `DATABASE_URL` at any reachable Postgres (managed or self-run).

### Putting it on a server

1. Build and push the image to a registry (or build on the host).
2. Run Postgres (a managed instance or its own container with a backed-up
   volume) and set `DATABASE_URL` to it.
3. Apply schema with the migration workflow — **not** the demo `push`:
   ```bash
   pnpm db:migrate:prod
   ```
4. Put a TLS-terminating reverse proxy in front (Caddy is the least effort —
   automatic HTTPS; Traefik or nginx + certbot also work).
5. Point your domain at the host.

> The compose `migrate` service uses `drizzle-kit push` because it targets a
> throwaway demo database — it syncs the current schema directly without
> depending on the migration history. A persistent production database should
> use `pnpm db:migrate:prod` (ordered, reviewable migration files) instead.
