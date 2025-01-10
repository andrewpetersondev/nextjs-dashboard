This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, create schema with:
```sql
CREATE SCHEMA IF NOT EXISTS public;
```
Second, apply changes to the database with:
```shell
npx drizzle-kit push
```

Third, seed db with:
```shell
pnpm dlx tsx ./src/db/seed.ts
```