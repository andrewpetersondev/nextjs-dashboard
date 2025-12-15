**Use-cases = application/business rules**, not framework code.

In a Next.js app, a common clean-architecture view:

**UI (pages/components)
→ Actions / Controllers (route handlers, server actions)
→ Use-cases (application logic)
→ Domain/Services (business rules, domain logic)
→ Repositories (data access)**

So **use-cases sit between actions and services/repositories**.

A use-case answers: _“What does the app do?”_
Example: `CreateOrder`, `ResetPassword`.

They orchestrate services and repositories but contain no UI, HTTP, or DB details.

Not exactly—they **overlap conceptually**, but they’re **different perspectives** in clean architecture:

| Concept                            | Focus                                    | Responsibility                                                                                       | Example in your code                               |
| ---------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Use-case / Application Service** | _What the system does for a user_        | Implements a single business operation, orchestrates domain rules, talks to repositories or services | `AuthUserService.login` → “authenticate this user” |
| **Service / Domain Service**       | _Domain logic or reusable business rule_ | Encapsulates domain knowledge, may be shared across multiple use-cases                               | `HashingService` or `SessionService`               |

So:

- Your **AuthUserService.login** is actually a **use-case**.
- Your **SessionService** or **HashingService** are **services** used by that use-case.

In smaller apps, people often merge the two and just call it “service,” which is why the terminology gets blurry.

If you want, I can **redraw your login layers with “Use-case vs Service” explicitly separated**.
