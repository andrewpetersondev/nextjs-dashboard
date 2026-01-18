# Auth Login Sequence Diagrams

This document illustrates the interactions between components during the authentication process, organized from the user action down to the database level.

## 1. Action Layer: `loginAction`

**Interaction:** The entry point for the login process. It handles user input validation and initiates the login workflow.

```mermaid
sequenceDiagram
  autonumber

  participant UI as UI / Client
  participant ACT as loginAction
  participant VAL as validateForm
  participant WF as loginWorkflow
  participant MAP as toLoginFormResult
  participant NX as Next.js

  UI->>ACT: loginAction(prevState, formData)
  activate ACT

  ACT->>ACT: Generate requestId
  ACT->>ACT: Get request metadata
  ACT->>ACT: Initialize PerformanceTracker
  ACT->>ACT: Initialize Scoped Logger

  ACT->>VAL: tracker.measure: validateForm(formData, LoginSchema, fields)
  VAL-->>ACT: Result

  alt validation failure
    ACT-->>UI: return validation result
  else validation success
    ACT->>ACT: createLoginUseCase(...)
    ACT->>ACT: createSessionService(...)

    ACT->>WF: tracker.measure: loginWorkflow(input, deps)
    activate WF
    WF-->>ACT: Result
    deactivate WF

    alt workflow failure
      ACT->>MAP: toLoginFormResult(error, input)
      MAP-->>ACT: FormResult
      ACT-->>UI: return FormResult
    else workflow success
      ACT->>NX: revalidatePath(ROUTES.dashboard.root)
      ACT->>NX: redirect(ROUTES.dashboard.root)
      note over ACT, NX: Redirect throws a Next.js error to stop execution
    end
  end

  deactivate ACT
```

## 2. Workflow Layer: `loginWorkflow`

**Interaction:** Orchestrates authentication and session establishment. Delegates both success and error cases to a shared sub-workflow.

```mermaid
sequenceDiagram
  autonumber

  participant AC as Action / Caller
  participant WF as loginWorkflow
  participant UC as LoginUseCase
  participant SUBWF as establishSessionForAuthUserWorkflow
  participant SS as SessionService

  AC->>WF: loginWorkflow(input, deps)
  activate WF

  WF->>UC: execute(input)
  UC-->>WF: Result<AuthenticatedUserDto, AppError>

  WF->>SUBWF: establishSessionForAuthUserWorkflow(authResult, deps)
  activate SUBWF

  SUBWF->>SUBWF: authResult.ok?

  alt authResult not ok
    SUBWF-->>WF: Result.Err(authResult.error)
  else authResult ok
    SUBWF->>SUBWF: toSessionPrincipalPolicy(authUserResult.value)
    SUBWF->>SS: establish(principal)
    SS-->>SUBWF: Result<SessionPrincipalDto, AppError>
    SUBWF-->>WF: Result<SessionPrincipalDto, AppError>
  end

  deactivate SUBWF

  WF-->>AC: Result<SessionPrincipalDto, AppError>

  deactivate WF
```

## 3. Application Use Cases

### 3.1. `LoginUseCase`

**Interaction:** Validates user credentials by looking up the user in the repository and verifying the password hash. Implements anti-enumeration by mapping both not_found and invalid_password to a generic error.

```mermaid
sequenceDiagram
  autonumber

  participant WF as Workflow / Caller
  participant UC as LoginUseCase
  participant REPO as AuthUserRepositoryContract
  participant HASH as PasswordHasherService
  participant ERR_FAC as AuthErrorFactory
  participant LOG as LoggingClient

  WF->>UC: execute(input)
  activate UC

  UC->>UC: try

  UC->>REPO: findByEmail({ email: input.email })
  REPO-->>UC: Result<AuthUserEntity | null, AppError>

  alt Repository Failure
    UC-->>WF: Result.Err(AppError)
  else User Not Found
    UC->>ERR_FAC: makeCredentialFailure("user_not_found", { email })
    note over ERR_FAC: Maps to invalid_credentials<br/>reason: "user_not_found"
    ERR_FAC-->>UC: AppError (anti-enumeration)
    UC-->>WF: Result.Err(AppError)
  else User Found
    UC->>HASH: compare(input.password, user.password)
    HASH-->>UC: boolean

    alt Invalid Password
      UC->>ERR_FAC: makeCredentialFailure("invalid_password", { userId })
      note over ERR_FAC: Maps to invalid_credentials<br/>reason: "invalid_password"
      ERR_FAC-->>UC: AppError (anti-enumeration)
      UC-->>WF: Result.Err(AppError)
    else Password Valid
      UC->>UC: Map to AuthenticatedUserDto
      UC-->>WF: Result.Ok(AuthenticatedUserDto)
    end
  end

  deactivate UC

  alt catch (unexpected error)
    UC->>LOG: error("An unexpected error occurred during authentication.")
    UC->>UC: safeExecute normalizes to AppError
    UC-->>WF: Result.Err(AppError)
  end
```

### 3.2. `EstablishSessionUseCase` (via `SessionService`)

**Interaction:** Issues a new session token and persists it via the session store.

```mermaid
sequenceDiagram
  autonumber

  participant SUBWF as Sub-workflow / Caller
  participant SS as SessionService
  participant TS as SessionTokenService
  participant STORE as SessionStore
  participant LOG as LoggingClient

  SUBWF->>SS: establish(principal: SessionPrincipalDto)
  activate SS

  SS->>SS: try (via safeExecute)

  SS->>TS: issue({ role, userId })
  TS-->>SS: Result<{ token, expiresAtMs }, AppError>

  alt Token Issue Failure
    SS-->>SUBWF: Result.Err(AppError)
  else Token Issue Success
    SS->>SS: Extract token & expiresAtMs
    SS->>STORE: set(token, expiresAtMs)
    STORE-->>SS: await completion
    SS->>LOG: operation("Session established", ...)
    SS->>SS: return Ok(principal)
    SS-->>SUBWF: Result.Ok(SessionPrincipalDto)
  end

  deactivate SS

  alt catch (unexpected error)
    SS->>LOG: error("An unexpected error occurred...")
    SS->>SS: safeExecute normalizes to AppError
    SS-->>SUBWF: Result.Err(AppError)
  end
```

## 4. Infrastructure Layer

### 4.1. Repository: `AuthUserRepository`

**Interaction:** Bridges the application layer to the database via DAL functions, mapping raw data to domain entities.

```mermaid
sequenceDiagram
  autonumber

  participant UC as Use Case / Service
  participant PORT as AuthUserRepositoryContract
  participant AD as AuthUserRepositoryAdapter
  participant REPO as AuthUserRepository (infra)
  participant DAL as getUserByEmailDal
  participant DB as Database

  UC->>PORT: findByEmail(AuthUserLookupQueryDto)

  PORT->>AD: findByEmail(query)
  AD->>REPO: findByEmail(query)

  activate REPO

  REPO->>DAL: getUserByEmailDal(db, email, logger)

  DAL->>DB: SELECT user WHERE email = ?
  DB-->>DAL: UserRow | null

  alt DAL failure
    DAL-->>REPO: Err(AppError)
    REPO-->>AD: Err(AppError)
    AD-->>PORT: Err(AppError)
    PORT-->>UC: Err(AppError)
  else DAL success
    DAL-->>REPO: Ok(UserRow | null)

    alt Row exists
      REPO->>REPO: authUserRowToEntity(UserRow)
      REPO-->>AD: Ok(AuthUserEntity)
    else Row is null
      REPO-->>AD: Ok(null)
    end

    AD-->>PORT: Result<AuthUserEntity | null, AppError>
    PORT-->>UC: Result<AuthUserEntity | null, AppError>
  end

  deactivate REPO
```

### 4.2. DAL: `getUserByEmailDal`

**Interaction:** Low-level database query execution wrapped with error handling and logging.

```mermaid
sequenceDiagram
    autonumber

    participant S as Service / Caller
    participant DAL as getUserByEmailDal
    participant WRAP as executeDalResult
    participant DB as Database

    S->>DAL: getUserByEmailDal(db, email, logger)

    DAL->>WRAP: executeDalResult(dalCoreLogic, metadata, logger, context)

    activate WRAP

    WRAP->>WRAP: try

    WRAP->>DAL: invoke dalCoreLogic()
    activate DAL

    DAL->>DB: SELECT user WHERE email = ?
    DB-->>DAL: UserRow | null

    alt User found
        DAL->>DAL: log.operation "User row fetched"
        DAL-->>WRAP: return UserRow
    else User not found
        DAL->>DAL: log.operation "User not found"
        DAL-->>WRAP: return null
    end

    deactivate DAL

    WRAP->>WRAP: wrap in Ok(...)
    WRAP-->>DAL: Result.Ok(UserRow | null)

    deactivate WRAP

    DAL-->>S: Result<UserRow | null, AppError>

    alt Database / Drizzle error
        WRAP->>WRAP: catch(error)
        WRAP->>WRAP: normalizePgError
        WRAP->>WRAP: log error with context
        WRAP-->>DAL: Result.Err(AppError)
        DAL-->>S: Result.Err(AppError)
    end
```
