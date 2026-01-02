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
  participant MAP as mapLoginErrorToFormResult
  participant NX as Next.js

  UI->>ACT: loginAction(prevState, formData)
  activate ACT

  ACT->>ACT: Generate requestId
  ACT->>ACT: Get request metadata
  ACT->>ACT: Initialize PerformanceTracker

  ACT->>VAL: tracker.measure: validateForm(formData, LoginSchema)
  VAL-->>ACT: Result

  alt validation failure
    ACT-->>UI: return validation result
  else validation success
    ACT->>WF: tracker.measure: loginWorkflow(input, deps)
    activate WF
    WF-->>ACT: Result
    deactivate WF

    alt workflow failure
      ACT->>MAP: mapLoginErrorToFormResult(error, input)
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

**Interaction:** Orchestrates authentication and session establishment. Implements anti-enumeration logic to ensure consistent error messaging.

```mermaid
sequenceDiagram
  autonumber

  participant AC as Action / Caller
  participant WF as loginWorkflow
  participant UC as LoginUseCase
  participant SS as SessionService

  AC->>WF: loginWorkflow(input, deps)
  activate WF

  WF->>UC: execute(input)
  UC-->>WF: Result<AuthUserOutputDto, AppError>

  alt authResult failure
    alt isCredentialFailure (not_found | invalid_credentials)
      note over WF: Anti-enumeration logic
      WF->>WF: makeAppError(APP_ERROR_KEYS.invalid_credentials, { cause, message, metadata })
      WF-->>AC: Result.Err(AppError)
    else other error
      WF-->>AC: Result.Err(AppError)
    end
  else authResult success
    WF->>WF: Extract id, role from AuthUserOutputDto
    WF->>SS: establish(principal)
    SS-->>WF: Result<SessionPrincipalDto, AppError>

    alt sessionResult failure
      WF-->>AC: Result.Err(AppError)
    else sessionResult success
      WF-->>AC: Result.Ok(SessionPrincipalDto)
    end
  end

  deactivate WF
```

## 3. Application Use Cases

### 3.1. `LoginUseCase`

**Interaction:** Validates user credentials by looking up the user in the repository and verifying the password hash.

```mermaid
sequenceDiagram
  autonumber

  participant WF as Workflow / Caller
  participant UC as LoginUseCase
  participant REPO as AuthUserRepositoryContract
  participant HASH as HashingService
  participant LOG as LoggingClientPort

  WF->>UC: execute(input)
  activate UC

  UC->>UC: try

  UC->>REPO: login({ email: input.email })
  REPO-->>UC: Result<AuthUserEntity | null, AppError>

  alt Repository Failure
    UC-->>WF: Result.Err(AppError)
  else User Not Found
    UC->>UC: makeAppError("not_found", { cause: "user_not_found" })
    UC-->>WF: Result.Err(AppError)
  else User Found
    UC->>HASH: compare(input.password, user.password)
    HASH-->>UC: boolean

    alt Invalid Password
      UC->>UC: makeAppError("invalid_credentials", { cause: "invalid_password" })
      UC-->>WF: Result.Err(AppError)
    else Password Valid
      UC-->>WF: Result.Ok(AuthUserOutputDto)
    end
  end

  deactivate UC

  alt catch (unexpected error)
    UC->>LOG: error("login.use-case.execute failed...")
    UC->>UC: normalizeUnknownToAppError(err, "unexpected")
    UC-->>WF: Result.Err(AppError)
  end
```

### 3.2. `EstablishSessionUseCase`

**Interaction:** Issues a new session token and persists it via the session store.

```mermaid
sequenceDiagram
  autonumber

  participant WF as Workflow / Caller
  participant UC as EstablishSessionUseCase
  participant TS as SessionTokenService
  participant ST as SessionStoreContract

  WF->>UC: execute(user)
  activate UC

  UC->>UC: try

  UC->>TS: issue({ role, sessionStart: now, userId })
  TS-->>UC: Result<{ token, expiresAtMs }, AppError>

  alt Token Issue Failure
    UC-->>WF: Result.Err(AppError)
  else Token Issue Success
    UC->>ST: set(token, expiresAtMs)
    ST-->>UC: await completion
    UC->>UC: log.operation "Session established"
    UC-->>WF: Result.Ok(user)
  end

  deactivate UC

  alt catch (unexpected error)
    UC->>UC: normalizeUnknownToAppError(err, "unexpected")
    UC-->>WF: Result.Err(AppError)
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

  UC->>PORT: login(AuthLoginInputDto)

  PORT->>AD: login(input)
  AD->>REPO: login(input)

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
      REPO->>REPO: toAuthUserEntity(UserRow)
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
