# Session Data Flow Diagram

## ReadSessionUseCase Flow

```
Cookie/SessionStore
        ↓
readSessionTokenHelper
        ↓
   SessionTokenClaims
   - userId: string
   - role: UserRole
   - expiresAt: number (seconds)
   - iat: number (seconds)
   - sessionStart: number
        ↓
toSessionEntity (branded type conversion)
        ↓
   SessionEntity
   - userId: UserId (branded)
   - role: UserRole
   - expiresAt: number (milliseconds)
   - issuedAt: number (milliseconds)
   - sessionStart: number
        ↓
toReadSessionOutcome (compute session state)
        ↓
   ReadSessionOutcomeDto
   {
     id: UserId
     role: UserRole
     expiresAt: number
     issuedAt: number
     timeLeftMs: number (computed)
   }
        ↓
   Client/Caller
   (now has full session visibility)
```

## VerifySessionUseCase Flow

```
Cookie/SessionStore
        ↓
readSessionTokenHelper
        ↓
   SessionTokenClaims
   - userId: string
        ↓
toSessionEntity (branded type conversion)
        ↓
   SessionEntity
   - userId: UserId (branded)
   - role: UserRole
        ↓
   SessionTransport
   {
     isAuthorized: true
     role: UserRole
     userId: string (converted back for transport)
   }
        ↓
   Client/Caller
   (verification result)
```

## Type Hierarchy

```
JWT Payload (string types)
    ↓
SessionTokenClaims
    ↓
SessionEntity (domain entity with branded types)
    ↓
    ├─→ SessionIdentityDto (identity only)
    │   - id: UserId
    │   - role: UserRole
    │
    └─→ ReadSessionOutcomeDto (identity + lifecycle)
        - id: UserId
        - role: UserRole
        - expiresAt: number
        - issuedAt: number
        - timeLeftMs: number
```

## Mapper Responsibilities

### `toSessionEntity(claims: SessionTokenClaims) → SessionEntity`

**Responsibility:** Branded type conversion & timestamp normalization

- Converts `userId: string` → `userId: UserId` via codec
- Normalizes timestamp units: seconds → milliseconds
- Preserves domain state: role, sessionStart

### `toReadSessionOutcome(session: SessionEntity) → ReadSessionOutcomeDto`

**Responsibility:** Add session lifecycle metadata

- Projects identity: userId, role
- Includes session state: expiresAt, issuedAt
- Computes freshness: timeLeftMs (for clients to know when to refresh)

### `toSessionPrincipalPolicy(dto: AuthenticatedUserDto | UpdateSessionSuccessDto) → SessionIdentityDto`

**Responsibility:** Simple identity mapping (for non-token sources)

- Maps from authenticated user DTOs
- Already has branded types (no codec needed)
- Used for session establishment/rotation flows

## Timestamp Units

⚠️ **Important:** Be aware of timestamp unit differences

| Type                  | Field                   | Unit         | Example       |
| --------------------- | ----------------------- | ------------ | ------------- |
| JWT Claims            | `exp`, `iat`            | Seconds      | 1705000000    |
| SessionEntity         | `expiresAt`, `issuedAt` | Milliseconds | 1705000000000 |
| ReadSessionOutcomeDto | `expiresAt`, `issuedAt` | Milliseconds | 1705000000000 |
| timeLeftMs            | N/A                     | Milliseconds | 450000        |

Conversion happens in `toSessionEntity()`:

```typescript
issuedAt: tokenClaims.iat,          // JWT seconds → SessionEntity milliseconds
expiresAt: tokenClaims.exp,         // JWT seconds → SessionEntity milliseconds
```

Actually, looking at SessionClaimsSchema, `exp` and `expiresAt` might both be milliseconds.
Review the schema to clarify!

## Client Usage Example

```typescript
// Old way (identity only)
const session = await sessionService.read();
if (session) {
  console.log(session.id, session.role);
  // No visibility into expiry/freshness
}

// New way (full session state)
const session = await sessionService.read();
if (session) {
  console.log(session.id, session.role);
  console.log(`Session expires in ${session.timeLeftMs}ms`);

  // Can make smart refresh decisions
  if (session.timeLeftMs < 120_000) {
    // 2 minutes
    await sessionService.rotate();
  }
}
```
