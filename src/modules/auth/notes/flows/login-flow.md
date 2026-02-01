## 📊 Complete Login Flow Diagram

### **Forward Flow: UI → Database**

```
┌─────────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER                                                   │
├─────────────────────────────────────────────────────────────────────┤
│ 1. login.action.ts (Server Action)                                  │
│    ├─ Validates FormData against LoginRequestSchema                 │
│    ├─ Calls makeAuthComposition() for DI                            │
│    └─ Invokes auth.workflows.login(input)                           │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER - WORKFLOWS                                        │
├─────────────────────────────────────────────────────────────────────┤
│ 2. login.workflow.ts                                                 │
│    ├─ Orchestrates authentication + session establishment           │
│    ├─ Calls loginUseCase.execute(input)                             │
│    └─ Calls establishSessionForAuthUserWorkflow(authResult)         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER - USE CASES (Commands)                             │
├─────────────────────────────────────────────────────────────────────┤
│ 3. login.use-case.ts (LoginUseCase)                                 │
│    ├─ Calls repo.findByEmail({ email })                             │
│    ├─ Calls hasher.compare(password, user.password)                 │
│    └─ Maps to AuthenticatedUserDto via toAuthenticatedUserDto()     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER - ADAPTERS                                      │
├─────────────────────────────────────────────────────────────────────┤
│ 4. auth-user-repository.adapter.ts                                  │
│    └─ Delegates to authUsers.findByEmail(query)                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER - REPOSITORIES                                  │
├─────────────────────────────────────────────────────────────────────┤
│ 5. auth-user.repository.ts                                           │
│    ├─ Calls getUserByEmailDal(db, email, logger)                    │
│    └─ Maps UserRow to AuthUserEntity via toAuthUserEntity()         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE LAYER - DAL (Data Access Layer)                       │
├─────────────────────────────────────────────────────────────────────┤
│ 6. get-user-by-email.dal.ts                                          │
│    ├─ Executes Drizzle ORM query: db.select().from(users)           │
│    ├─ WHERE eq(users.email, email)                                  │
│    └─ Returns UserRow | null wrapped in Result                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ DATABASE                                                             │
├─────────────────────────────────────────────────────────────────────┤
│ 7. PostgreSQL users table                                            │
│    └─ Returns user record with hashed password                      │
└─────────────────────────────────────────────────────────────────────┘
```

### **Return Flow: Database → UI**

```
┌─────────────────────────────────────────────────────────────────────┐
│ DATABASE → DAL                                                       │
├─────────────────────────────────────────────────────────────────────┤
│ UserRow { id, email, username, password, role }                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE - MAPPER                                              │
├─────────────────────────────────────────────────────────────────────┤
│ toAuthUserEntity(row) → AuthUserEntity                               │
│ ├─ Converts id to branded UserId                                    │
│ ├─ Converts password to Hash type                                   │
│ └─ Parses role to UserRole enum                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ APPLICATION - MAPPER                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ toAuthenticatedUserDto(entity) → AuthenticatedUserDto                │
│ └─ Strips password hash (security boundary)                         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ APPLICATION - SESSION WORKFLOW                                       │
├─────────────────────────────────────────────────────────────────────┤
│ establishSessionForAuthUserWorkflow()                                │
│ ├─ Maps to SessionPrincipalDto via toSessionPrincipal()             │
│ └─ Calls sessionService.establish(principal)                        │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ APPLICATION - SESSION USE CASE                                       │
├─────────────────────────────────────────────────────────────────────┤
│ EstablishSessionUseCase.execute()                                    │
│ ├─ Calls sessionTokenService.issue({ userId, role })                │
│ ├─ Generates JWT with exp, iat, nbf claims                          │
│ └─ Calls setSessionCookieAndLogHelper() to set cookie               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE - SESSION TOKEN SERVICE                               │
├─────────────────────────────────────────────────────────────────────┤
│ SessionTokenService.issue()                                          │
│ ├─ Creates JWT claims (userId, role, exp, iat, nbf)                 │
│ ├─ Calls codec.encode() → SessionTokenCodecAdapter                  │
│ └─ Uses jose library to sign JWT                                    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE - SESSION STORE                                       │
├─────────────────────────────────────────────────────────────────────┤
│ SessionCookieStoreAdapter.set()                                      │
│ └─ Sets HTTP-only secure cookie via Next.js cookies()               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PRESENTATION - SERVER ACTION RESPONSE                                │
├─────────────────────────────────────────────────────────────────────┤
│ login.action.ts                                                      │
│ ├─ On success: revalidatePath() + redirect()                        │
│ └─ On error: toLoginFormResult() → FormResult with field errors     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ UI COMPONENT                                                         │
├─────────────────────────────────────────────────────────────────────┤
│ login-form.tsx (React component)                                     │
│ └─ Displays errors or redirects to dashboard                        │
└─────────────────────────────────────────────────────────────────────┘
```

---
