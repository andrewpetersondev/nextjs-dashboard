# Repository

This directory contains base repository abstractions for data access, supporting clean architecture and separation of concerns.

## Files

- **`base-repository.ts`**  
  Provides a generic abstract class for CRUD operations, using dependency injection for the database instance. Designed for extension by domain-specific repositories. All methods are strictly typed and documented.

- **`README.md`**  
  Documentation for the repository module, including architecture, usage, and extension guidelines.

## Usage

- Extend `BaseRepository` to implement domain-specific repositories for your entities.
- Inject the `Database` instance via the constructor to enable testability and flexibility.
- Implement the abstract CRUD methods with domain logic and error handling.

## Conventions

- All repositories are documented using TSDoc.
- Use branded types for domain identifiers.
- Update this README when adding or modifying repository files.
