# ADR 004: Strip Passwords at Application Boundary

## Status
Accepted

## Context
Handling hashed passwords (sensitive data) within the application layer increases the risk of accidental leakage (e.g., in logs, API responses, or through DTOs passed to other services). We need a clear boundary where sensitive authentication data is removed and replaced with safe representations.

## Decision
We will strictly strip password hashes when moving data from the Domain/Infrastructure layer to the Application/Presentation layer.

- **Infrastructure Layer**: Can handle `UserRow` and `AuthUserEntity` (which contains the hashed password) for authentication purposes.
- **Application Layer**: Use Cases that don't specifically need the password (most of them) should work with `AuthenticatedUserDto` or similar objects that do not contain the password field.
- **Mappers**: Dedicated mappers (e.g., `toAuthenticatedUserDto`) must be used at the boundary to ensure the password field is explicitly removed.
- **Validation**: Any entity containing a password must be validated before use, but its lifecycle must be as short as possible.

## Consequences
### Positive
- **Security**: Significantly reduces the risk of password hash leakage.
- **Least Privilege**: Application services only receive the data they need to function.
- **Compliance**: Easier to audit where sensitive data is handled in the codebase.

### Negative
- **Mapping Overhead**: Requires additional DTOs and mappers to facilitate the data stripping.
- **Complexity**: Developers must be mindful of which type they are using and where they are in the layer hierarchy.
