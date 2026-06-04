# Signup Flow

Complete documentation of the user registration flow from form submission through database insertion to session
establishment.

## 🎯 Overview

**Entry Point**: `signup.action.ts` (Next.js Server Action)  
**Exit Point**: Redirect to dashboard or form errors  
**Purpose**: Register new users and automatically establish authenticated session

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER                                               │
│ signup.action.ts (Server Action)                                 │
│ ├─ Validates FormData against SignupRequestSchema               │
│ ├─ Calls makeAuthComposition() for DI                            │
│ └─ Invokes auth.workflows.signup(input)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER - WORKFLOWS                                    │
│ signup.workflow.ts                                               │
│ ├─ Orchestrates user creation + session establishment            │
│ ├─ Calls signupUseCase.execute(input)                            │
│ └─ Calls establishSessionForAuthUserWorkflow(authResult)         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER - USE CASES (Commands)                         │
│ signup.use-case.ts (SignupUseCase)                               │
│ ├─ Calls hasher.hash(password) to hash password                  │
│ ├─ Calls uow.execute() with transaction                          │
│ │   └─ repo.signup({ email, username, hashedPassword, role })   │
│ └─ Maps to AuthenticatedUserDto via toAuthenticatedUserDto()     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER - UNIT OF WORK                              │
│ auth-unit-of-work.adapter.ts                                     │
│ └─ Wraps repository call in database transaction                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER - REPOSITORY                                │
│ auth-user.repository.ts                                          │
│ ├─ Calls insertUserDal(db, input, logger)                        │
│ ├─ Catches Postgres unique violation (23505)                     │
│ ├─ Maps to email_already_exists or username_already_exists       │
│ └─ Maps UserRow to AuthUserEntity via toAuthUserEntity()         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER - DAL (Data Access Layer)                   │
│ insert-user.dal.ts                                               │
│ ├─ Executes Drizzle ORM insert: db.insert(users).values(...)    │
│ ├─ Returns inserted UserRow                                      │
│ └─ Wrapped in Result<UserRow, AppError>                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ DATABASE                                                         │
│ PostgreSQL users table                                           │
│ ├─ Inserts new user record                                       │
│ ├─ Enforces unique constraints (email, username)                 │
│ └─ Returns inserted row with generated ID                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ RETURN PATH: Same as Login Flow                                  │
│ AuthUserEntity → AuthenticatedUserDto → SessionPrincipalDto      │
│ → JWT Token → HTTP Cookie → Redirect to Dashboard               │
└─────────────────────────────────────────────────────────────────┘
```

## 🔍 Step-by-Step Breakdown

### Step 1: Form Submission (Presentation Layer)

**File**: `presentation/authn/actions/signup.action.ts`

**Input**: FormData from signup form

- `email`: User's email address
- `username`: Desired username
- `password`: Plain text password

**Validation**: SignupRequestSchema (Zod)

- Email format validation
- Username length and format
- Password strength requirements

**Output**: Validated SignupRequestDto or validation errors

---

### Step 2: Workflow Orchestration (Application Layer)

**File**: `application/auth-user/workflows/signup.workflow.ts`

**Responsibilities**:

1. Coordinate signup use case execution
2. Handle successful signup by establishing session
3. Propagate errors to presentation layer

**Key Logic**:

```typescript
const authResult = await signupUseCase.execute(input);
if (!authResult.ok) {
    return authResult; // Propagate error
}

// Automatically establish session for new user
return await establishSessionForAuthUserWorkflow(authResult, {
    sessionService,
});
```

---

### Step 3: Password Hashing (Application Layer)

**File**: `application/auth-user/commands/signup.use-case.ts`

**Before Database Insertion**:

```typescript
const hashedResult = await this.hasher.hash(input.password);
if (!hashedResult.ok) {
    return hashedResult; // Crypto error
}

const hashedPassword = hashedResult.value;
```

### Step 3.1: Default Role Selection (Domain Policy)

**File**: `domain/auth-user/policies/registration.policy.ts`

The signup request does **not** accept a `role` input. Instead, the role is assigned
server-side by a domain policy.

**Implementation detail**: `SignupUseCase` calls `getDefaultRegistrationRole()` and
includes the returned value in the `AuthUserCreateDto` passed to the repository:

```typescript
const signupCommand: AuthUserCreateDto = {
  email: input.email,
  password: hashedPassword,
  role: getDefaultRegistrationRole(),
  username: input.username,
};
```

**Hashing Details**:

- Algorithm: bcrypt
- Cost factor: 10 (configurable)
- Salt: Automatically generated per password
- Output: 60-character hash string

---

### Step 4: Database Transaction (Infrastructure Layer)

**File**: `infrastructure/persistence/auth-user/adapters/auth-unit-of-work.adapter.ts`

**Transaction Wrapper**:

```typescript
await uow.execute(async (repo) => {
    return await repo.signup({
        email: input.email,
        username: input.username,
        password: hashedPassword,
        role: input.role,
    });
});
```

**Benefits**:

- Atomic operation (all-or-nothing)
- Automatic rollback on error
- Consistent state

---

### Step 5: User Insertion (Infrastructure Layer)

**File**: `infrastructure/persistence/auth-user/dal/insert-user.dal.ts`

**Database Operation**:

```typescript
const [insertedRow] = await db
    .insert(users)
    .values({
        email: input.email,
        username: input.username,
        password: input.password, // Already hashed
        role: input.role,
    })
    .returning();
```

**Constraints Enforced**:

- `users_email_key`: Email must be unique
- `users_username_key`: Username must be unique
- `users_pkey`: Auto-generated primary key (ID)

---

### Step 6: Error Handling - Duplicate Detection

**File**: `application/shared/mappers/flows/signup/pg-unique-violation-to-signup-conflict-error.mapper.ts`

**Postgres Error 23505 Mapping**:

At the Server Action boundary, signup conflict errors are surfaced as validation-style
field errors so the UI can render them deterministically.

**Implementation detail**: `toSignupFormResult()` detects Postgres `23505` (`UNIQUE_VIOLATION`) and returns a
`FormResult<never>` with:

- `key: "validation"`
- `fieldErrors.email = ["alreadyInUse"]` when the constraint indicates email
- `fieldErrors.username = ["alreadyInUse"]` when the constraint indicates username
- fallback: if the field cannot be determined, both are marked

**Security**: Prevents database error leakage while providing useful feedback

---

### Step 7: Entity Mapping (Infrastructure → Domain)

**File**: `infrastructure/persistence/auth-user/mappers/to-auth-user-entity.mapper.ts`

**Transformation**: UserRow → AuthUserEntity

```typescript
{
    id: toUserId(row.id),           // string → UserId (branded)
        email
:
    row.email,                // string
        username
:
    row.username,          // string
        password
:
    toHash(row.password),  // string → Hash (branded)
        role
:
    parseUserRole(row.role),   // string → UserRole enum
}
```

---

### Step 8: DTO Mapping (Domain → Application)

**File**: `application/shared/mappers/flows/login/to-authenticated-user.mapper.ts`

**Transformation**: AuthUserEntity → AuthenticatedUserDto

**Security Boundary**: Password hash is stripped here

```typescript
{
    id: entity.id,        // UserId
        email
:
    entity.email,  // string
        username
:
    entity.username,  // string
        role
:
    entity.role,    // UserRole
    // password: REMOVED (security boundary)
}
```

---

### Step 9: Session Establishment

**Same as Login Flow** - See [auth-login-flow.md](../../../../../docs/diagrams/auth-login-flow.md) for details

1. Map to SessionPrincipalDto
2. Generate JWT token
3. Set HTTP-only secure cookie
4. Return session principal

---

### Step 10: Response (Presentation Layer)

**Success**:

- Revalidate dashboard path
- Redirect to dashboard
- User is now authenticated

**Failure**:

- Map errors to FormResult
- Return field-specific errors
- Display in signup form

---

## 🔄 Data Transformations

### Forward Path (Success)

```
FormData (raw)
  ↓ [SignupRequestSchema validation]
SignupRequestDto { email, username, password }
  ↓ [Password hashing]
AuthUserCreateDto { email, username, password: Hash, role }
  ↓ [Database insertion]
UserRow { id, email, username, password, role, created_at, updated_at }
  ↓ [toAuthUserEntity]
AuthUserEntity { id: UserId, email, username, password: Hash, role }
  ↓ [toAuthenticatedUserDto]
AuthenticatedUserDto { id: UserId, email, username, role }
  ↓ [toSessionPrincipal]
SessionPrincipalDto { id: UserId, role }
  ↓ [SessionTokenService.issue]
IssuedTokenDto { token: JWT, expiresAtMs }
  ↓ [SessionCookieStoreAdapter.set]
HTTP Cookie (session=JWT; HttpOnly; Secure; SameSite=strict)
```

### Error Path

```
Postgres Error 23505 (unique_violation)
  ↓ [toSignupFormResult]
FormResult {
  ok: false,
  error: AppError {
    key: "validation",
    metadata: {
      fieldErrors: {
        email: ["alreadyInUse"],
        password: [],
        username: [],
      },
      formErrors: [],
    },
  },
}
```

---

## 🛡️ Security Considerations

### 1. Password Security

**Hashing**:

- ✅ bcrypt with cost factor 10
- ✅ Automatic salt generation
- ✅ One-way function (cannot reverse)
- ✅ Slow by design (prevents brute force)

**Never Stored**:

- ❌ Plain text password never persisted
- ❌ Password never logged
- ❌ Password never returned in responses

### 2. Duplicate Detection

**Email Uniqueness**:

- Database constraint enforced
- User-friendly error message
- No information leakage

**Username Uniqueness**:

- Database constraint enforced
- Helps users choose available username
- Prevents impersonation

### 3. Input Validation

**Schema Validation** (Zod):

- Email format (RFC 5322)
- Username: 3-20 characters, alphanumeric + underscore
- Password: Minimum 8 characters, complexity rules

**SQL Injection Prevention**:

- ✅ Drizzle ORM parameterized queries
- ✅ No string concatenation
- ✅ Type-safe query building

### 4. Transaction Safety

**Atomicity**:

- User creation wrapped in transaction
- Rollback on any error
- Consistent database state

**Isolation**:

- Prevents race conditions
- Unique constraint checked within transaction
- No partial user records

---

## ⚠️ Error Scenarios

### Scenario 1: Email Already Exists

**Flow**:

1. User submits signup form with existing email
2. Database insert fails with error 23505
3. Constraint name: `users_email_key`
4. Mapper transforms to `email_already_exists`
5. Form shows error on email field

**User Sees**: "This email is already registered"

**Action**: User can try different email or go to login

---

### Scenario 2: Username Already Taken

**Flow**:

1. User submits signup form with existing username
2. Database insert fails with error 23505
3. Constraint name: `users_username_key`
4. Mapper transforms to `username_already_exists`
5. Form shows error on username field

**User Sees**: "This username is taken"

**Action**: User can try different username

---

### Scenario 3: Weak Password

**Flow**:

1. User submits signup form with weak password
2. Zod schema validation fails
3. Error returned before database access
4. Form shows error on password field

**User Sees**: "Password must be at least 8 characters"

**Action**: User strengthens password

---

### Scenario 4: Invalid Email Format

**Flow**:

1. User submits signup form with invalid email
2. Zod schema validation fails
3. Error returned before database access
4. Form shows error on email field

**User Sees**: "Please enter a valid email address"

**Action**: User corrects email format

---

### Scenario 5: Database Connection Error

**Flow**:

1. User submits valid signup form
2. Database connection fails
3. DAL returns `database_error`
4. Propagated through layers
5. Generic error shown to user

**User Sees**: "Service temporarily unavailable. Please try again."

**Action**: User retries later

---

### Scenario 6: Password Hashing Failure

**Flow**:

1. User submits valid signup form
2. bcrypt hashing fails (rare)
3. Use case returns `crypto_error`
4. Generic error shown to user

**User Sees**: "Unable to process request. Please try again."

**Action**: User retries

---

## 📊 Performance Considerations

### Database Operations

**Single Insert**: ~5-10ms

- One INSERT query
- Constraint validation
- Index updates

**Optimization**:

- ✅ Indexed columns (email, username)
- ✅ Efficient constraint checking
- ✅ Minimal columns returned

### Password Hashing

**bcrypt Cost 10**: ~100-200ms

- Intentionally slow (security)
- CPU-intensive operation
- Blocks during hashing

**Trade-offs**:

- Higher cost = More secure, slower
- Lower cost = Less secure, faster
- Cost 10 = Good balance

### Total Signup Time

**Typical**: 150-300ms

- Validation: ~5ms
- Password hashing: ~150ms
- Database insert: ~10ms
- Session establishment: ~50ms
- Cookie setting: ~5ms

**Optimization Opportunities**:

- ⚠️ Don't reduce bcrypt cost (security)
- ✅ Ensure database indexes exist
- ✅ Use connection pooling
- ✅ Minimize transaction scope

---

## 🔗 Related Files

### Presentation Layer

- `presentation/authn/actions/signup.action.ts` - Entry point
- `presentation/authn/components/forms/signup-form.tsx` - UI form

### Application Layer

- `application/auth-user/workflows/signup.workflow.ts` - Orchestration
- `application/auth-user/commands/signup.use-case.ts` - Business logic
- `application/auth-user/schemas/signup-request.schema.ts` - Validation
- `application/shared/mappers/flows/signup/to-signup-form-result.mapper.ts` - Error mapping
- `application/shared/mappers/flows/signup/pg-unique-violation-to-signup-conflict-error.mapper.ts` - DB error mapping

### Infrastructure Layer

- `infrastructure/persistence/auth-user/repositories/auth-user.repository.ts` - Repository
- `infrastructure/persistence/auth-user/dal/insert-user.dal.ts` - Database query
- `infrastructure/persistence/auth-user/adapters/auth-unit-of-work.adapter.ts` - Transaction
- `infrastructure/crypto/adapters/password-hasher.adapter.ts` - Password hashing

### Session Establishment

- See [auth-login-flow.md](../../../../../docs/diagrams/auth-login-flow.md) for session establishment details

---

## 🔄 Comparison with Login Flow

| Aspect           | Signup                    | Login                      |
|------------------|---------------------------|----------------------------|
| **Entry**        | signup.action.ts          | login.action.ts            |
| **Validation**   | Email, username, password | Email, password            |
| **Database**     | INSERT new user           | SELECT existing user       |
| **Password**     | Hash then store           | Compare with stored hash   |
| **Unique Check** | Database constraint       | N/A                        |
| **Transaction**  | Required (insert)         | Not required (read)        |
| **Session**      | Establish after creation  | Establish after validation |
| **Redirect**     | Dashboard                 | Dashboard                  |

---

## 📝 Testing Considerations

### Unit Tests

**Use Case**:

- ✅ Test password hashing
- ✅ Test duplicate email handling
- ✅ Test duplicate username handling
- ✅ Test validation errors
- ✅ Test successful signup

**Repository**:

- ✅ Test database insertion
- ✅ Test constraint violation mapping
- ✅ Test transaction rollback

### Integration Tests

**Full Flow**:

- ✅ Test complete signup flow
- ✅ Test session establishment
- ✅ Test cookie setting
- ✅ Test redirect

**Error Scenarios**:

- ✅ Test duplicate email
- ✅ Test duplicate username
- ✅ Test database errors
- ✅ Test validation errors

---

**Last Updated**: 2026-02-01  
**Maintained By**: Auth Module Team
