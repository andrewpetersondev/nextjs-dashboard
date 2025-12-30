## DAL Function: getUserByEmailDal

### Flowchart

```mermaid
flowchart TD
    %% Caller Layer
    A[Caller / Service Layer] -->|calls| B[getUserByEmailDal]

    %% DAL Function
    B -->|wraps execution| C[executeDalResult]

    %% Execution Wrapper
    C -->|try| D["DAL Core Logic<br/>async () => {...}"]

    %% Database Interaction
    D -->|query| E[(Database)]
    E --> D

    %% Decision: user found?
    D --> F{User found?}

    %% Success path
    F -->|Yes| G[Log: User row fetched]
    G --> H[return UserRow]

    %% Not found path
    F -->|No| I[Log: User not found]
    I --> J[return null]

    %% Successful result
    H --> K["Ok(UserRow)"]
    J --> L["Ok(null)"]

    %% Error path
    D -. throws .-> M[Database / Drizzle Error]
    M --> N[normalizePgError + log]
    N --> O["Err(AppError)"]

    %% Return to caller
    K --> P[Caller receives Result]
    L --> P
    O --> P
```

### Sequence Diagram

```mermaid
sequenceDiagram
    autonumber

    participant S as Service / Caller
    participant DAL as getUserByEmailDal
    participant WRAP as executeDalResult
    participant DB as Database

    S->>DAL: getUserByEmailDal(db, email, logger)

    DAL->>WRAP: executeDalResult(dalCoreLogic, metadata, logger)

    activate WRAP

    WRAP->>WRAP: try

    WRAP->>DAL: invoke dalCoreLogic()
    activate DAL

    DAL->>DB: SELECT user WHERE email = ?
    DB-->>DAL: UserRow | null

    alt User found
        DAL->>DAL: log "User row fetched"
        DAL-->>WRAP: return UserRow
    else User not found
        DAL->>DAL: log "User not found"
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

## Repository Class

### (input: Readonly<AuthLoginInputDto>): Promise<Result<AuthUserEntity | null, AppError>>

### Flowchart

```mermaid
flowchart TD
%% Inputs
  A["Input<br/>AuthLoginInputDto<br/>(email)"] --> B[AuthUserRepository.login]

%% DAL call
B -->|call| C["getUserByEmailDal<br/>(db, email, logger)"]

%% DAL result decision
C --> D{Result.ok?}

%% Error propagation
D -->|No| E["Propagate Err(AppError)"]
E --> Z["Return Result.Err(AppError)"]

%% Success path
D -->|Yes| F["Extract UserRow | null"]

%% User existence decision
F --> G{Row exists?}

%% Mapping path
G -->|Yes| H["Map UserRow → AuthUserEntity<br/>(toAuthUserEntity)"]
H --> I["Wrap in Ok(AuthUserEntity)"]

%% Null passthrough
G -->|No| J["Return Ok(null)"]

%% Outputs
I --> K["Output<br/>Result.Ok(AuthUserEntity)"]
J --> K

```

### Sequence Diagram

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

## Use Case Class: LoginUseCase

### execute(input: Readonly<AuthLoginSchemaDto>): Promise<Result<AuthUserOutputDto, AppError>>

#### Flowchart

```mermaid
flowchart TD
%% Inputs
  A["Input<br/>AuthLoginSchemaDto<br/>(email, password)"] --> B[LoginUseCase.execute]

%% Repository Call
  B --> C["repo.login({ email })"]

%% Repo Result Decision
  C --> D{Result.ok?}

%% Repo Error Propagation
  D -->|No| E["Propagate Err(AppError)"]
  E --> Z["Return Result.Err(AppError)"]

%% Repo Success path
  D -->|Yes| F["Extract AuthUserEntity | null"]

%% User existence decision
  F --> G{User exists?}

%% Not Found Path
  G -->|No| H["makeAppError('not_found')"]
  H --> Z

%% Password Verification
  G -->|Yes| I["hasher.compare(password, hash)"]

%% Password Decision
  I --> J{Password OK?}

%% Invalid Credentials Path
  J -->|No| K["makeAppError('invalid_credentials')"]
  K --> Z

%% Success Path
  J -->|Yes| L["Map to AuthUserOutputDto"]
  L --> M["Ok(AuthUserOutputDto)"]

%% Outputs
  M --> Z1["Return Result.Ok(...)"]

%% Catch block
  B -. catch .-> N["Log error & normalize to 'unexpected'"]
  N --> Z
```

#### Sequence Diagram

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
    UC->>UC: makeAppError("not_found")
    UC-->>WF: Result.Err(AppError)
  else User Found
    UC->>HASH: compare(input.password, user.password)
    HASH-->>UC: boolean

    alt Invalid Password
      UC->>UC: makeAppError("invalid_credentials")
      UC-->>WF: Result.Err(AppError)
    else Password Valid
      UC-->>WF: Result.Ok(AuthUserOutputDto)
    end
  end

  deactivate UC

  alt catch (unexpected error)
    UC->>LOG: error("login.use-case.execute failed...")
    UC->>UC: normalizeUnknownToAppError
    UC-->>WF: Result.Err(AppError)
  end
```
