# Adapters

**Adapters** implement the port interfaces with concrete technology choices. They wrap actual implementations (like bcrypt for hashing, Drizzle repositories) and translate between your application's domain types and infrastructure details. They're the "glue" connecting your service layer to real databases/libraries while respecting port contracts.

---

Let me clarify with a simple analogy:

## The Problem

Your service needs to hash passwords and store users. But it shouldn't care _how_ - whether you use bcrypt vs argon2, or Postgres vs MongoDB.

## The Solution

**`infrastructure/ports/`** = Interface contracts

- "I need something that can hash passwords"
- "I need something that can save/fetch users"

**`application/services/adapters/`** = Concrete implementations

- "Here's bcrypt doing the hashing"
- "Here's the actual Postgres repository doing the database work"

## Why the adapters folder exists

The adapters **wrap** your real implementations (bcrypt library, database repository) so they match the port interfaces. Your service only knows about ports - you can swap adapters without changing service code.

Think of it like USB ports (interface) and USB adapters (implementations that plug into different devices).

---

🧱 “Adapters” — Application-side bridges into or out of the domain

Your application/services/adapters/ folder is a bit different — these are likely adapters that make application services usable by other parts of the system, such as:

Inbound adapters (API routes, server actions, job runners, etc.)

Facades or translators from external types to domain types

Orchestrators that call application use cases

---
