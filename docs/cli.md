# CLI

## Using the CLI & Hashicorp Vault

CLI commands must be run with `hcp vault-secrets run --` to ensure that the secrets are available in the environment.

### Example

```bash
hcp vault-secrets run -- pnpm drizzle-kit up --config=drizzle-test.config.ts
```

## Commands that require Vault

### Next.js

- `hcp vault-secrets run -- pnpm next build --turbopack`
- `hcp vault-secrets run -- pnpm next start`
- `hcp vault-secrets run -- pnpm next dev --turbopack`

### Drizzle Kit

- `hcp vault-secrets run -- pnpm drizzle-kit up --config=drizzle-test.config.ts`
- `hcp vault-secrets run -- pnpm drizzle-kit generate --config=drizzle-test.config.ts`


### Viewing Secrets

- `hcp vault-secrets secrets open SESSION_SECRET`
- `hcp vault-secrets secrets open POSTGRES_URL_TESTDB`
