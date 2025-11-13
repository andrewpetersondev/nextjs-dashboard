# Ports Folder

The **ports folder** defines **interfaces** (contracts) that your business logic depends on, without caring about implementation details. It's the **Ports & Adapters** (Hexagonal Architecture) pattern: ports are "what you need," adapters (in `application/services/adapters/`) are "how it's implemented." This decouples your domain from infrastructure concerns like databases or hashing libraries.

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

🧩 “Ports” — External interfaces your infrastructure must implement

In your layout, infrastructure/ports are the abstract definitions of capabilities that the application layer needs from the outside world.

They are the contracts between the application and infrastructure layers.

Think of them as outbound ports — application → infrastructure.
