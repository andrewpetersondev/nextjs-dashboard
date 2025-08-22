You can do either, but don’t conflate concepts. Use “auth” as the umbrella and nest “sessions” inside it. That keeps boundaries clear while avoiding fragmentation.

How to decide
- Keep sessions inside auth (recommended for most apps) if:
    - You have one session mechanism (e.g., JWT cookie) and a couple of auth flows (email/password, maybe OAuth).
    - Session lifecycle is tightly coupled to authentication flows.
- Split sessions from auth if:
    - You support multiple session backends (JWT + Redis) or need sessions for non-user actors (service-to-service).
    - You plan to reuse session machinery independently from user authentication.

Recommended organization
- Server-only
    - src/server/auth/
        - sessions/
            - session.jwt.ts — signing/verification, cookie read/write
            - cookies.ts — cookie helpers, names, flags
            - storage.ts — optional: server-side session store (Redis/DB) if you add one
        - strategies/
            - password.ts — sign-in/sign-up, password hashing, password reset
            - oauth/<provider>.ts — OAuth handlers if applicable
        - authorization/
            - rbac.ts — role matrices, permission checks
            - policy.ts — domain-level canX(actor, resource) rules
        - actions.ts — server actions (signIn, signOut, refreshSession)
        - schema.ts — server-side validation (login form, sign-up) if heavy transforms
        - types.server.ts — server-only DTOs if needed
    - Notes:
        - Keep import "server-only" at the top of all server files here.
        - Session secret/env access stays here.

- Feature (client-safe)
    - src/features/auth/
        - components/ — LoginForm, LogoutButton, Protected component, etc.
        - hooks/ — useSession, useAuth
        - lib/
            - mappers.ts — map server session payload/DTO → UI shape
            - to-user-role.ts — map/validate role string → UserRole
        - types.ts — UserRole, client-safe session preview shape (e.g., { userId, role, expiresAt })
        - schema.client.ts — minimal client-side validation if needed
    - src/features/users/ remains responsible for user UI and user-specific client types.

- Shared (generic primitives only)
    - src/shared/brands/domain-brands.ts — branded ids
    - src/shared/result, validation, date utils
    - Avoid putting auth-specific types in shared unless they are truly app-wide primitives.

What moves from your current setup
- session.jwt.ts → src/server/auth/sessions/session.jwt.ts
- Any cookies/constants for sessions → src/server/auth/sessions/cookies.ts (and import constants from a small src/shared/constants/auth only if they’re truly client-safe, e.g., cookie name; secrets never)
- Zod schemas used only on server → src/server/auth/schema.ts
- Pure mappers/types used by UI → src/features/auth/lib and src/features/auth/types.ts

Import boundaries
- Client code must never import from src/server/auth/**.
- Server code can import client-safe types from src/features/auth/types.
- Authorization checks (RBAC/policies) live on the server. If you mirror tiny guards in the client, they should be non-authoritative and purely for UI gating.

Migration checklist
- Split types from schemas: client-safe TS types in features; heavy Zod schemas on server.
- Centralize token/cookie handling under src/server/auth/sessions.
- Expose server actions (signIn, signOut, refresh) from src/server/auth/actions.ts.
- Ensure route handlers under src/app call into server/auth, not vice versa.
- Add “server-only” at the top of server files; verify no client code imports them.

Pitfalls to avoid
- Exporting Zod schemas from a file that client components import (pulls Zod into client bundle).
- Sprinkling authorization checks in UI; keep source of truth on server.
- Mixing session cookies logic with UI components.

Bottom line
- Use a single auth module with a sessions submodule. It scales, stays coherent, and keeps boundaries crisp.
