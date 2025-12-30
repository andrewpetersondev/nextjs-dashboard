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
