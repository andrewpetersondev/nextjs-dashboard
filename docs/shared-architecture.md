# `src/shared` architecture

## What a `src/shared` folder is _for_

A good `shared/` is a **small, stable toolbox** that many parts of the app can depend on without creating cycles or
“everything imports everything” chaos.

In practice, `shared/` should contain things that are:

- **Domain-agnostic** (or at least not specific to one feature/module)
- **Low-level and reusable**
- **Dependency-light** (ideally depends on nothing outside `shared/`)
- **Clearly separated by environment** (browser vs server vs universal)

If something is only used by one feature, it usually belongs in that feature’s module, not in `shared/`.

---

### 1) Organize by “library” (purpose), not by “file type”

Inside `src/shared`, each top-level folder should represent a **cohesive mini-library** with a clear reason to exist and
a clear audience.

A good “shared library” typically answers one of these questions:

- **“What does it do?”** (e.g. `telemetry`, `http`, `time`, `routing`)
- **“What kind of building block is it?”** (e.g. `primitives`)
- **“What cross-cutting rule does it enforce?”** (e.g. `policies`)

Avoid organizing shared as “utils/types/constants” at the top level. Those categories are too vague, and they turn into
catch-alls.

---

## 2) Inside each library: keep a predictable internal layout

A simple, repeatable pattern helps refactors stay sane. A common shape is:

- `core/` → the stable public “heart” (types, pure functions, policies, value objects)
- `server/` → server-only adapters (DB, filesystem, Node APIs)
- `client/` or `browser/` → browser-only stuff (DOM, `window`, performance APIs)
- `shared/` or `universal/` → code safe in both environments (careful: this can become a junk drawer; use sparingly)
- `README.md` → what this library is, what it is not, and usage rules

This pattern matches what you already have in places: some “core vs server” separation is exactly the right direction.

**Rule of thumb:** if it imports Node-only things (or uses server-only runtime features), it belongs under `server/`. If
it’s purely functional/types, it belongs under `core/`.

---

## 3) Define a “public API” per library (and hide internals)

Refactoring gets much easier if each shared library has a deliberate entry point:

- `src/shared/<lib>/index.ts` exports the supported surface area
- Deep imports are discouraged (or considered “internal”)

Why this matters:

- You can reorganize internals without breaking the app
- You can prevent accidental coupling to “private” files
- You can spot when a library is getting too big (the `index.ts` becomes a map of responsibilities)

If you want stronger boundaries, you can even adopt a convention like:

- `src/shared/<lib>/_internal/**` is not imported from outside the lib

---

## 4) Keep dependencies flowing “downhill”

A shared folder becomes fragile when “low-level” things start depending on “high-level” things.

A healthy dependency direction is usually:

- `shared/primitives` (lowest)\
  ↓
- `shared/core` (cross-cutting foundations like error/result patterns, branding, base config contracts)\
  ↓
- “topic libraries” like `forms`, `http`, `telemetry`, `routing`, `policies`, `time`\
  ↓
- `modules/` (features) and `app/` (composition / Next.js routes)

**Red flags:**

- `shared/primitives` importing from `shared/forms` (inverted dependency)
- a “shared” library importing from `modules/*` (shared is no longer shared)
- circular imports between shared libraries

---

## 5) Decide what “shared” is allowed to contain (and what it must NOT)

### Good fits for `shared/`

- **Value-level building blocks:** branded IDs, money/period types, time helpers
- **Cross-cutting error/result patterns:** consistent error shape, safe execution helpers
- **Validation policies:** email/password/username rules
- **Protocols/contracts:** interfaces that features or server adapters implement
- **Thin adapters around third-party libs** _only if multiple parts of the app need them_

### Things that usually don’t belong in `shared/`

- Feature-specific business rules (belongs in `modules/<feature>`)
- UI components (belongs in `ui/` or feature UI)
- “Random utils” that aren’t reused (belongs where used)
- Big “god” libraries that combine concerns (e.g., `shared/core` becoming “everything”)

---

## 6) Naming conventions that keep the folder understandable

Try to make names answer _“what is this?”_:

- `*.contract.ts` → interface/port (no runtime)
- `*.adapter.ts` → implementation of a contract (often env-specific)
- `*.factory.ts` → constructs a value/entity
- `*.mapper.ts` → transforms between representations
- `*.schema.ts` → validation schemas (e.g., Zod)
- `*.constants.ts` → true constants (not “settings”)
- `*.utils.ts` → last resort; if a file grows, rename to something more specific

Also, prefer **nouns for folders** (`telemetry`, `routing`, `policies`) and **verbs for actions** in file names only
when it’s truly an operation (`normalize-*`, `convert`, `validate-*`).

---

## 7) Split “policy” from “plumbing”

A really effective way to keep `shared/` clean is to separate:

- **Policy**: rules and decisions (validation rules, normalization rules, allowed ranges)
- **Plumbing**: moving data around (request metadata, logging transport, serialization)

Your existing top-level categories already hint at this separation:

- `policies/` is “rules”
- `http/telemetry/routing` are “plumbing” libraries
- `primitives/time` are “foundations”

That’s a good baseline; the refactor question is mostly: _are any of these libraries secretly doing feature work?_ If
yes, push that into `modules/`.

---

## 8) Use “environment fences” deliberately (Next.js reality)

In Next.js, “shared” code will often be imported from both server and client contexts. So you want strict placement:

- Put server-only code under `server/` subfolders **and keep it out of universal barrels**.
- Keep universal code in `core/` (or `shared/`/`universal/`) and ensure it has no accidental environment assumptions.

A helpful mental model: **every file in `shared/**/core` should be safe to import anywhere** unless clearly labeled
otherwise.

---

## 9) When to split a new shared library vs keep inside an existing one

Create a new `shared/<lib>` when:

- there’s a clear “mini product” with a single purpose
- it will be reused by multiple modules
- it has distinct environment needs (core + server + client)

Keep it inside an existing library when:

- it’s a small extension that naturally belongs to that area
- splitting would create too many tiny packages that are hard to discover

**Smell test:** if you can’t write a 1–2 sentence README describing the library’s purpose and boundaries, it’s not a
good top-level `shared/<lib>` yet.

---

## 10) A lightweight checklist to guide your refactor

When you pick up any file in `src/shared`, ask:

1. **Is this reused by 2+ features?** If not, it likely belongs in the feature.
2. **Is it environment-specific?** If yes, move under `server/` or `browser/`.
3. **Is it “policy” or “plumbing” or “foundation”?** Put it in the right library.
4. **Can I export it from a single `index.ts` without embarrassment?** If not, it’s probably mixing concerns.
5. **Does it introduce a dependency uphill?** If yes, rethink placement.

---

If you tell me which pain you’re feeling most (too many deep imports, circular deps, `core` becoming a magnet, unclear
server/client boundaries, etc.), I can suggest a concrete refactor strategy (still high-level, but tailored to your
structure).
