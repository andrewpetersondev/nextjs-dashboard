# Banner Module

A small, self-contained feature: a **one-time dismissible banner**. Once a user
dismisses it, it stays dismissed — the choice is stored in a cookie (180 days)
so it survives reloads and sessions.

Unlike the other feature modules, banner is **not a data module**: it has no
database table, no domain entity, and no `Result`/DTO machinery. Its "domain" is
just the cookie's name and lifetime; everything else is a thin cookie adapter and
a React component.

---

## Directory structure

```
banner/
├── domain/banner.constants.ts           # BANNER_DISMISSED_COOKIE ("banner_dismissed_v1"), max-age (180d)
├── infrastructure/
│   ├── banner-cookie.adapter.ts         # BannerCookieAdapter — dismiss / isDismissed / clear (over the shared cookie service)
│   └── banner-cookie.ts                 # functional facade: isBannerDismissed(), dismissBanner()
└── presentation/
    ├── one-time-banner.tsx              # <OneTimeBanner> client component (renders + Dismiss button)
    └── actions/dismiss-banner.action.ts # dismissBannerAction() — sets the cookie, revalidates "/"
```

---

## How it works

```
Server render ─▶ isBannerDismissed()  → false ⇒ render <OneTimeBanner/>
                                       → true  ⇒ render nothing

User clicks Dismiss ─▶ dismissBannerAction()  ─▶ dismissBanner() sets cookie ─▶ revalidatePath("/")
```

- **Gating is the caller's job.** `<OneTimeBanner>` always renders when mounted;
  the server code that includes it should check `isBannerDismissed()` first and
  skip mounting it when the cookie is set. The component owns only the dismiss
  interaction (optimistic `useState` + `useTransition`).
- **The adapter** (`BannerCookieAdapter`) wraps the shared cookie service
  (`@/server/cookies`) and centralizes the cookie options; `banner-cookie.ts` is a
  two-function facade so callers don't construct the adapter themselves.

---

## Key concepts

### Versioned cookie = a re-show switch

The cookie name carries a version suffix (`banner_dismissed_v1`). To show a *new*
banner to everyone who already dismissed the old one, **bump the suffix** (e.g.
`_v2`) — old cookies no longer match, so the banner reappears. The banner copy
notes this too.

### Cookie options (deliberate)

Set in `banner-cookie.adapter.ts`:

| Option | Value | Why |
|---|---|---|
| `httpOnly` | `false` | This is a non-secret UI flag; client JS may read it. |
| `sameSite` | `lax` | Standard for a first-party preference cookie. |
| `secure` | `isProd()` | HTTPS-only in production, relaxed in local dev. |
| `maxAge` | `15_552_000` (180 days) | How long a dismissal sticks. |
| `path` | `/` | Applies site-wide. |

`httpOnly: false` is intentional here — keep it that way only for non-sensitive
flags like this one.

---

## Related documentation

- [project-structure.md](../../../docs/project-structure.md) — where code belongs across the repo.
- Cookie service: `@/server/cookies` (the shared adapter this module builds on).

---

**Last updated:** 2026-06-04
