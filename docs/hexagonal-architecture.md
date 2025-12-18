# Hexagonal Architecture (Ports & Adapters)

Hexagonal Architecture organizes code so that **business logic is isolated from technical details**.

The core idea:

> **The domain does not depend on infrastructure. Infrastructure depends on the domain.**

---

## 1. Layers (at a glance)

```
[ External World ]
      |
   Adapters
      |
     Ports
      |
   Application / Domain
```

```
Service --> Port (interface)
    ^           ^
    |           |
    |       implements
    |           |
    Adapter ----+
      |
      v
Repository --> [ DAL / Database / External System ]
```

---

## 2. Domain (Core)

The **domain** contains business rules and concepts.

### Entities

- Business objects (e.g. `User`, `Order`)
- Contain rules and invariants

### Services (Domain Services)

- Business logic that doesn’t fit inside a single entity
- No database, no HTTP, no frameworks

```ts
class RegisterUserService {
  register(email: Email) {
    return new User(email);
  }
```

---

## 3. Ports (Interfaces)

**Ports define what the domain needs**, not how it’s done.

### Repository Ports

```ts
interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}
```

### Transaction / Unit of Work Port

```ts
interface UnitOfWork {
  run<T>(fn: () => Promise<T>): Promise<T>;
}
```

Ports live close to the domain or application layer.

---

## 4. Application Layer

Coordinates business logic.

- Calls domain services
- Uses ports
- Defines transaction boundaries

```ts
class RegisterUserUseCase {
  constructor(
    private readonly uow: UnitOfWork,
    private readonly users: UserRepository,
  ) {}

  async execute(email: string) {
    return this.uow.run(async () => {
      const user = new User(email);
      await this.users.save(user);
    });
  }
}
```

---

## 5. Adapters (Infrastructure)

Adapters **implement ports** using real technology.

### Repository Adapter

```ts
class SqlUserRepository implements UserRepository {
  async save(user: User) {
    // SQL / ORM logic
  }
}
```

### Transaction Adapter

```ts
class DbUnitOfWork implements UnitOfWork {
  async run<T>(fn: () => Promise<T>) {
    return db.transaction(fn);
  }
}
```

---

## 6. DAL (Data Access Layer)

DAL functions are **low-level helpers** used by adapters.

```ts
async function insertUserRow(db, data) {
  // raw SQL or query builder
}
```

- DAL is infrastructure
- Domain never sees DAL

---

## 7. Factories

Factories wire everything together.

```ts
function makeRegisterUserUseCase() {
  const repo = new SqlUserRepository();
  const uow = new DbUnitOfWork();

  return new RegisterUserUseCase(uow, repo);
}
```

Factories usually live at the **edge of the app**.

---

## 8. Server Actions / Controllers

Entry points from the outside world.

- HTTP handlers
- Server actions
- Message consumers

```ts
export async function registerUserAction(email: string) {
  const useCase = makeRegisterUserUseCase();
  await useCase.execute(email);
}
```

They:

- Parse input
- Call a use case
- Return output

---

## 9. Transactions (Where they belong)

- Defined in the **application layer**
- Implemented in **infrastructure**
- Never in domain entities

> Domain says: _"this must be atomic"_
> Infrastructure decides: _"SQL transaction"_

---

## 10. Dependency Rule (Most Important)

Dependencies always point **inward**:

```
Adapters → Ports → Application → Domain
```

The domain knows nothing about:

- Databases
- Frameworks
- HTTP
- Transactions

---

## Mental Model

- **Ports** = what the app needs
- **Adapters** = how it’s done
- **Domain** = business rules
- **Application** = orchestration
- **Infrastructure** = details

That’s hexagonal architecture.
