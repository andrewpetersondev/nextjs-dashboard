---
apply: manually
---

# Next.js Rules

- Components:
    - Prefer Server Components for data/heavy logic; Client Components for interactivity only.
    - Keep Suspense/streaming boundaries intentional and minimal.
- Data & Actions:
    - Validate inputs in Server Actions; enforce auth/ACL server-side.
    - Don’t fetch on client when server can pre-render.
- Zod/Validation:
    - Use z.output<typeof schema>, prefer safeParse; return client-safe unions, not raw ZodError.
