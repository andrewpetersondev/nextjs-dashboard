# Oddity with Transactions in Use Cases

Question: i find it strange that my use-cases contain code for transactions. for example, @file:signup.command.ts
uses a transaction so it basically forces me to map errors like `email already exists` in the use case instead of the repo @file:auth-user.repository.ts . this is partially because of a wrapper @file:execute-dal-result.ts . should i move transaction logic into the repo?

---

In **Clean Architecture**, your observation about "strangeness" is spot-on. Transaction management is a classic "cross-cutting concern" that often creates friction between layers.

### Should you move transaction logic into the Repo?

**No.** According to your `clean-architecture.md` rules and general Clean Architecture principles:

1.  **Use Cases own the Transaction Boundary:** A Use Case represents a single "unit of work" from the user's perspective. If a Use Case needs to perform three database operations, they must all succeed or fail together. If you move the transaction into the Repository, the Use Case loses the ability to coordinate multiple repository calls atomically.
2.  **Repositories are for Persistence, not Orchestration:** A Repository should be "transaction-agnostic"—it performs an operation on whatever connection/transaction context it is given.

### The Real Problem: Leakage of Infrastructure Concerns

The reason it feels strange in `SignupCommand` is that you are currently forced to handle `createdResultTx.ok` checks inside the transaction block to decide whether to continue.

To fix the "error mapping" issue while keeping transactions in the Use Case, we should lean into the **Unit of Work** pattern and **Repository responsibilities**.

#### 1. The Repository should handle the Mapping

Your `AuthUserRepository.signup` implementation _is_ already doing the mapping via `toSignupUniquenessConflict`. This is correct. The Infrastructure layer knows about Postgres/Drizzle, so it should be the one to translate a `UniqueViolation` into a Domain-friendly `Conflict` error.

#### 2. Refactor the Use Case to be "Flatter"

The Use Case shouldn't feel like it's "forcing" mapping; it should just be orchestrating.

Here is how to clean up `SignupCommand` to respect the boundaries:

```typescript
// ... existing code ...
      async execute(
        input: Readonly<AuthSignupSchemaDto>,
      ): Promise<Result<AuthUserOutputDto, AppError>> {
        const _logger = this.logger.child({ email: input.email });

        try {
          // The Use Case defines the boundary of the atomic operation.
          return await this.uow.withTransaction(async (tx) => {
            const passwordHash = await this.hasher.hash(input.password);

            const signupResult = await tx.authUsers.signup({
              email: input.email,
              password: passwordHash,
              role: parseUserRole("USER"),
              username: input.username,
            });

            // If the repo returns an Err (e.g., Conflict/Email exists),
            // the UoW handles the rollback automatically.
            if (!signupResult.ok) {
              return signupResult;
            }

            const user = signupResult.value;

            return Ok<AuthUserOutputDto>({
              email: user.email,
              id: toUserId(user.id),
              role: parseUserRole(user.role),
              username: user.username,
            });
          });
        } catch (err: unknown) {
// ... existing code ...
```

### Why this is "Clean":

- **Infrastructure (`AuthUserRepository`)**: Knows that `23505` in Postgres means "Unique Violation". It maps it to an `AppError` with key `conflict`.
- **Application (`SignupCommand`)**: Receives a `Result`. It doesn't care _why_ it failed (Postgres vs. Memory DB), it just sees a `Conflict` error and returns it.
- **Interface Adapter (`loginAction`)**: Receives the `Conflict` error and decides how to show it to the user (e.g., "Email already in use").

### Summary of Decisions:

1.  **Keep `withTransaction` in the Use Case:** It defines the business "Unit of Work".
2.  **Keep Error Mapping in the Repo/DAL:** The repo is the "Adapter" for the database; it is the only place that should know how to interpret DB-specific error codes.
3.  **Refinement**: Ensure your `UnitOfWork` implementation (the adapter) correctly propagates the `Result` out of the transaction block so the Use Case can return it cleanly.
