# DTOs for Authentication Module

This folder contains Data Transfer Objects (DTOs) used as explicit input and output shapes for use cases and repositories in the authentication feature.

## What are DTOs?

DTOs are plain TypeScript interfaces or types that define the structure of data passed between Clean Architecture layers (e.g., from a use case to a repository). They ensure data integrity and decouple business logic from infrastructure concerns.

- **Reference**: [`auth-login-repo.dto.ts`](/auth-login-repo.dto.ts)
- **Example**:
  ```ts
  /**
   * Input shape for repository login lookup.
   * @remarks
   * Used to pass login credentials from the use case to the repository.
   */
  export interface AuthLoginRepoInput {
    /** User email address for authentication. */
    email: string;
  }
  ```

DTOs are used to transfer data in and out of methods, especially across architectural boundaries. For example, a repository contract might have a method like:

```ts
findByLogin(input: AuthLoginRepoInput): Promise<User | null>;
```

Here, `AuthLoginRepoInput` is the DTO, and the contract is the interface for the repository.

## DTOs vs. Contracts

- **DTOs**: Define the shape of data exchanged between layers.
- **Contracts (Interfaces/Ports)**: Define the required methods and signatures for dependencies (e.g., repositories, services).

## Organization & Naming

- Place DTOs in the `application/dto/` folder of each feature module.
- Name DTOs with a clear suffix (e.g., `XyzInput`, `XyzOutput`, `XyzDto`).
- Do not provide default values for DTO properties; validate presence using Zod schemas if needed.

## Best Practices

- Explicitly type all DTO properties.
- Minimize optional properties; if a property is optional, document why and how it is handled.
- Do not use fallback values or defaults—let `undefined` propagate and handle it explicitly.

For more on contracts/interfaces, see the `contracts/` folder in this module.
