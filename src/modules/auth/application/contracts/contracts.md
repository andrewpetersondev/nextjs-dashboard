# Contracts for Authentication Module

## What are Contracts?

- Reference: (Typical location: `src/modules/auth/application/contracts/unit-of-work.contract.ts` or similar)
- Contracts are TypeScript interfaces that define the required methods and signatures for a dependency (e.g., a repository, service, or unit of work).
- Example: `UnitOfWorkContract` might specify methods like `commit(): Promise<void>` and `rollback(): Promise<void>`, but not the data itself.
- Contracts define what a class or service must implement, enabling dependency inversion and testability.
- In code: A repository contract might have a method like `findByLogin(input: AuthLoginRepoInput): Promise<User | null>`, where `AuthLoginRepoInput` is the DTO and the contract is the interface for the repository.
