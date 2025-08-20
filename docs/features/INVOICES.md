# Feature: Invoice

## Layers

### Actions

Actions layer for invoice management in the application.

Responsibility:
The entry point that receives requests (from HTTP, RPC, or other sources) and calls the service layer.

Contains:

- Request parsing and validation.
- Invocations of service methods.
- Response formatting and error handling.

Purpose:

- Translate external requests into service calls and return appropriate responses (JSON, HTML, etc.).
- Handle HTTP concerns (status codes, headers).

### Service

Service layer for invoice business logic.

This layer should:

- Extract and validate form data
- Transform form data.
- Apply business rules and validation schemas

Responsibility:
The business logic layer that orchestrates repositories and other services to implement actual use cases.

Contains:

- Core application logic (validations, calculations, workflows).
- Calls to repositories for data access.
- Domain rules (e.g., “A user cannot be deleted if they have active subscriptions”).

Purpose:

- Decouple business logic from infrastructure.
- Define the “verbs” of your application.

### Repository

Repository layer for invoice operations.

Responsibility:

- The repository acts as an abstraction over the DAL, providing domain-oriented data operations rather than raw database queries.

Contains:

- Aggregates multiple DAL calls.
- Performs object mapping (e.g., converts DB entities to domain models).
- Caches or batches queries when necessary.

Purpose:

- Provides a clean, domain-specific API for working with data (e.g., UserRepository.findActiveUsers()).
- Helps in mocking/stubbing during tests since it hides DAL complexity.

### Data Access Layer

Data Access Layer for invoice operations.

This layer should:

- Work with entities (branded types) from repository layer
- Handle database-specific errors and transformations
- Return entities to repository layer.

Responsibility:

- The DAL is responsible for direct interaction with the database—executing queries and returning raw data (often as DTOs or raw objects).

Contains:

- Low-level SQL or ORM queries (Drizzle, Prisma, TypeORM).
- Functions that map raw query results to domain-neutral objects.

Purpose:

- Acts as the only place where your app talks directly to the database.
- Shields the rest of the system from SQL/ORM details.

### Database

## Zod

### parse vs safeParse vs safeParseAsync

Handling errors
When validation fails, the .parse() method will throw a ZodError instance with granular information about the validation issues.

Zod
Zod Mini

```typescript

try {
Player.parse({ username: 42, xp: "100" });
} catch(error){
if(error instanceof z.ZodError){
error.issues;
/_ [
{
expected: 'string',
code: 'invalid_type',
path: [ 'username' ],
message: 'Invalid input: expected string'
},
{
expected: 'number',
code: 'invalid_type',
path: [ 'xp' ],
message: 'Invalid input: expected number'
}
] _/
}
}
```

To avoid a try/catch block, you can use the
`.safeParse()` method to get back a plain result object containing either the successfully parsed data or a ZodError. The result type is a discriminated union, so you can handle both cases conveniently.

```typescript
const result = Player.safeParse({ username: 42, xp: "100" });
if (!result.success) {
  result.error; // ZodError instance
} else {
  result.data; // { username: string; xp: number }
}
```

Note — If your schema uses certain asynchronous APIs like async refinements or transforms, you'll need to use the `.safeParseAsync()` method instead.

```typescript
await schema.safeParseAsync("hello");`
```
