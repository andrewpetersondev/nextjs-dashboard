# JWT Claims Decoupling - Summary

## Overview

Successfully decoupled JWT claims from application and domain logic by simplifying the JWT payload to contain only standard claims and minimal cached data, while removing redundant `sessionStart` field.

## Key Changes

### 1. Simplified JWT Structure (`SessionJwtClaims`)

**File**: `src/modules/auth/infrastructure/serialization/session-jwt.claims.ts`

- **Standard JWT claims**:
  - `sub` (subject): User ID as UUID string
  - `iat` (issued-at): Token issue time in seconds
  - `exp` (expiration): Token expiration time in seconds

- **Performance optimization**:
  - `role`: User role (cached as string for performance, avoiding DB lookups)

**Key improvement**: Role is treated as an opaque string at the infrastructure layer, maintaining decoupling while enabling performance optimization.

### 2. Application-Layer Type Conversion

**File**: `src/modules/auth/application/dtos/session-token.claims.ts`

Created `SessionTokenClaims` type that extends `SessionJwtClaims` with strongly-typed `UserRole`:

```typescript
export type SessionTokenClaims = Omit<SessionJwtClaims, "role"> & {
  role: UserRole; // Strongly typed for application layer
};
```

### 3. Type Enrichment Layer

**File**: `src/modules/auth/infrastructure/mappers/enrich-jwt-claims.mapper.ts`

Created `toSessionTokenClaims()` mapper that:

- Converts infrastructure `SessionJwtClaims` to application `SessionTokenClaims`
- Parses role string into strongly-typed `UserRole` enum
- Returns `Result` type for safe error handling

### 4. Removed `sessionStart` Field

Eliminated the redundant `sessionStart` field from:

- `SessionEntity`
- `IssueTokenRequestDto`
- `UnbrandedIssueTokenRequestDto`
- JWT claims

**Rationale**: `sessionStart` was redundant with `iat` (issued-at time). Session age is now calculated using `issuedAt`.

### 5. Updated Domain Entity

**File**: `src/modules/auth/domain/entities/session.entity.ts`

```typescript
export type SessionEntity = Readonly<{
  expiresAt: number; // Maps from exp
  issuedAt: number; // Maps from iat (also serves as session start)
  role: UserRole;
  userId: UserId;
}>;
```

### 6. Updated Schema Validation

**File**: `src/modules/auth/domain/schemas/auth-session.schema.ts`

`DecryptPayloadSchema` now validates:

- `sub`: UUID string
- `iat`: Non-negative timestamp with clock skew tolerance
- `exp`: Positive timestamp greater than `iat`
- `role`: Non-empty string

### 7. Updated Mappers

**`toJwtClaims`**: Maps application data to JWT claims

```typescript
{
  sub: userIdCodec.encode(input.userId),
  iat: iatSec,
  exp: expiresAtSec,
  role: input.role  // Cached for performance
}
```

**`toSessionEntity`**: Maps JWT claims to domain entity

```typescript
{
  userId: userIdCodec.decode(tokenClaims.sub),
  issuedAt: tokenClaims.iat,
  expiresAt: tokenClaims.exp,
  role: tokenClaims.role
}
```

### 8. Updated Use Cases

Modified the following to work with new structure:

- `establish-session.use-case.ts`: Removed `sessionStart` calculation
- `rotate-session.use-case.ts`: Use `sub` instead of `userId`
- `verify-session.use-case.ts`: Check `sub` for presence validation
- `read-session.use-case.ts`: Check `sub` for presence validation

### 9. Updated Adapters

**`SessionTokenAdapter`**:

- `decode()`: Now converts `SessionJwtClaims` → `SessionTokenClaims`
- `validate()`: Applies type conversion after schema validation

**`SessionJwtAdapter`**:

- `encode()`: Accepts `SessionJwtClaims` (infrastructure type)
- `decode()`: Returns `SessionJwtClaims` (infrastructure type)

### 10. Updated Policies

**`evaluate-route-access.policy.ts`**:

- Check `claims?.sub` instead of `claims?.userId` for authentication

## Benefits

### 1. Architectural Cleanliness

- **Clear layer separation**: Infrastructure (JWT) vs Application (business logic)
- **Technology independence**: JWT implementation can be swapped without affecting domain
- **Type safety**: Strong typing at each layer with explicit conversions

### 2. Performance

- Role cached in JWT avoids DB lookups on every request
- Role changes require re-authentication (acceptable tradeoff)

### 3. Maintainability

- Removed redundant `sessionStart` field
- Single source of truth for session start time (`iat`)
- Explicit type conversions make data flow clear

### 4. Standards Compliance

- Uses standard JWT claims (`sub`, `iat`, `exp`)
- Infrastructure layer treats all non-standard claims as opaque data
- Application layer provides semantic meaning to cached data

## Migration Impact

### Breaking Changes

- **Existing JWT tokens are invalid** - Users must re-authenticate
- Session structure changed (removed `sessionStart`, changed field names)

### Non-Breaking Changes

- All internal APIs remain the same
- Use case interfaces unchanged
- Domain entity interfaces simplified

## Files Modified

### Core Types (8 files)

1. `session-jwt.claims.ts` - Infrastructure JWT claims
2. `session-token.claims.ts` - Application enriched claims
3. `session.entity.ts` - Domain entity
4. `issue-token-request.dto.ts` - Token issuance DTO
5. `unbranded-issue-token-request.dto.ts` - Unbranded variant
6. `auth-session.schema.ts` - Validation schemas
7. `session-token-codec.contract.ts` - Codec interface
8. `session-token-service.contract.ts` - Service interface (unchanged)

### Mappers (4 files)

1. `to-jwt-claims.mapper.ts` - Application → Infrastructure
2. `enrich-jwt-claims.mapper.ts` - Infrastructure → Application (NEW)
3. `to-session-entity.mapper.ts` - Claims → Entity
4. `to-issue-token-request-dto.mapper.ts` - DTO conversion

### Adapters (2 files)

1. `session-jwt.adapter.ts` - JWT encoding/decoding
2. `session-token.adapter.ts` - Token service implementation

### Use Cases (4 files)

1. `establish-session.use-case.ts`
2. `rotate-session.use-case.ts`
3. `verify-session.use-case.ts`
4. `read-session.use-case.ts`

### Helpers & Policies (2 files)

1. `authorize-request.helper.ts`
2. `evaluate-route-access.policy.ts`

## Testing Recommendations

1. **Unit tests**: Verify type conversion logic in `toSessionTokenClaims()`
2. **Integration tests**: Test full authentication flow with new JWT structure
3. **End-to-end tests**: Verify session lifecycle (create, rotate, expire)
4. **Migration tests**: Ensure old tokens are properly rejected

## Future Improvements

1. **Optional**: Extract `role` to separate signed cookie for even cleaner separation
2. **Consider**: Add `jti` (JWT ID) for token revocation support
3. **Explore**: Using `nbf` (not-before) claim for scheduled activations
4. **Evaluate**: Periodic role refresh from DB for long-lived sessions

## Conclusion

The JWT claims structure is now properly decoupled from application logic while maintaining pragmatic performance optimizations. The architecture clearly separates:

- **Infrastructure concerns**: JWT encoding/decoding with standard claims
- **Application concerns**: Business logic with strongly-typed data
- **Domain concerns**: Pure business rules independent of technology

This provides a solid foundation for future enhancements while keeping the codebase maintainable and testable.
