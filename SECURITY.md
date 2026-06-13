# Security Policy

This is a personal portfolio project rather than a production service with
real users. I still take security seriously and welcome reports — the app
demonstrates authentication, sessions, and database access, so finding and
fixing issues here is part of the point.

## Supported versions

Only the latest commit on the `main` branch is maintained. There are no
released or supported older versions.

| Version | Supported |
| ------- | --------- |
| `main`  | ✅        |
| older   | ❌        |

## Reporting a vulnerability

Please report security issues **privately** — do not open a public issue or PR
that describes the vulnerability.

- **Preferred:** GitHub private vulnerability reporting — open the repository's
  **Security** tab and choose **Report a vulnerability**. (If that option isn't
  visible, the feature may need to be enabled in repository settings; use the
  fallback below in the meantime.)
- **Fallback:** contact the repository owner via the address listed on their
  GitHub profile.

When reporting, please include steps to reproduce, the potential impact, and
any relevant logs or a proof-of-concept. I'll acknowledge reports as soon as I
reasonably can; as a side project maintained in spare time, response times are
best-effort.

## Scope

**In scope:** application code in this repository — authentication, sessions,
server actions, database access, and input handling.

**Out of scope:** the third-party platforms this project deploys to (e.g.
Vercel, Neon) and vulnerabilities originating in dependencies — please report
those to their upstream maintainers. Dependency updates here are tracked by
Dependabot and dependency review.
