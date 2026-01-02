# Auth Login Flowcharts

This document details the logic flow for the user authentication process, organized from the entry point (Action) down to the data access layer (DAL).

## 1. Action Layer: `loginAction`

**Responsibility:** Next.js Server Action boundary. Handles form validation, performance tracking, and mapping results to UI feedback or redirects.

```mermaid
flowchart TD
%% Inputs
  A["Input<br/>(formData)"] --> B[loginAction]

%% Preparation
  B --> C["Generate requestId"]
  B --> D["Get Request Metadata<br/>(IP, User Agent)"]
  D --> TRACK["Initialize PerformanceTracker"]

%% Validation
  TRACK --> E["validateForm(formData, LoginSchema)"]

%% Validation Decision
  E --> F{"validated.ok?"}

%% Validation Error Path
  F -->|No| G["Extract Field Errors"]
  G --> H["Return validated (Err Result)"]

%% Workflow Execution
  F -->|Yes| I["Create UseCase & SessionService Factories"]
  I --> J["loginWorkflow(input, deps)"]

%% Workflow Result Decision
  J --> K{"sessionResult.ok?"}

%% Workflow Failure Path
  K -->|No| L["mapLoginErrorToFormResult(error, input)"]
  L --> M["Return FormResult"]

%% Workflow Success Path
  K -->|Yes| N["Log Success & Revalidate Path"]
  N --> O["redirect(ROUTES.dashboard.root)"]

%% Outputs
  H --> Z["Action Result"]
  M --> Z
  O --> Z
```

## 2. Workflow Layer: `loginWorkflow`

**Responsibility:** Orchestrates the login "story". It coordinates authentication and session establishment while providing anti-enumeration security by unifying error responses.

```mermaid
flowchart TD
%% Inputs
  A["Input<br/>AuthLoginSchemaDto<br/>(email, password)"] --> B[loginWorkflow]

%% Use Case Call
  B --> C["loginUseCase.execute(input)"]

%% Auth Result Decision
  C --> D{authResult.ok?}

%% Error Handling Branch
  D -->|No| E["isCredentialFailure?<br/>(invalid_credentials OR not_found)"]

%% Anti-Enumeration mapping
  E -->|Yes| F["makeAppError('invalid_credentials')<br/>(Unified Error)"]
  E -->|No| G["Propagate Original Error"]

F --> Z["Return Result.Err(AppError)"]
G --> Z

%% Success Branch
D -->|Yes| H["Map AuthUserOutputDto to SessionPrincipalDto<br/>(id, role)"]
H --> I["sessionService.establish(principal)"]

%% Session Result Decision
I --> J{sessionResult.ok?}

J -->|No| K["Propagate Session Error"]
J -->|Yes| L["Return Result.Ok(SessionPrincipalDto)"]

K --> Z
L --> Z1["Return Result.Ok(...)"]
```

## 3. Application Use Cases

### 3.1. `LoginUseCase`

**Responsibility:** Executes core authentication logic by finding the user and verifying their credentials using a hashing service.

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
  G -->|No| H["makeAppError('not_found', { cause: 'user_not_found' })"]
  H --> Z

%% Password Verification
  G -->|Yes| I["hasher.compare(password, user.password)"]

%% Password Decision
  I --> J{Password OK?}

%% Invalid Credentials Path
  J -->|No| K["makeAppError('invalid_credentials', { cause: 'invalid_password' })"]
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

### 3.2. `EstablishSessionUseCase`

**Responsibility:** Handles session lifecycle by issuing a new token and persisting it to the session store.

```mermaid
flowchart TD
%% Inputs
  A["Input<br/>SessionPrincipalDto<br/>(id, role)"] --> B[EstablishSessionUseCase.execute]

%% Token Generation
  B --> C["tokenService.issue({ role, sessionStart, userId })"]

%% Issue Result Decision
  C --> D{"issueResult.ok?"}

%% Token Error path
  D -->|No| E["Propagate Err(AppError)"]
  E --> Z["Return Result.Err(AppError)"]

%% Success path: Persistence
  D -->|Yes| F["Extract token & expiresAtMs"]
  F --> G["store.set(token, expiresAtMs)"]

%% Completion
  G --> H["Log info: Session established"]
  H --> I["Ok(user)"]
  I --> Z1["Return Result.Ok(SessionPrincipalDto)"]

%% Catch block
  B -. catch .-> J["Normalize to 'unexpected'"]
  J --> Z
```

## 4. Infrastructure Layer

### 4.1. Repository: `AuthUserRepository`

**Responsibility:** Provides a clean interface for auth-related data persistence, mapping raw database rows to domain entities.

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

### 4.2. DAL: `getUserByEmailDal`

**Responsibility:** Executes the raw database query to find a user by their email address.

```mermaid
flowchart TD
    %% Caller Layer
    A[Caller / Service Layer] -->|calls| B[getUserByEmailDal]

    %% DAL Function
    B -->|wraps execution| C[executeDalResult]

    %% DAL Core Logic
    C -->|try| D["DAL Core Logic<br/>async () => {...}"]

    %% Database Interaction
    D -->|query| E[(Database)]
    E --> D

    %% Decision: user found?
    D --> F{User found?}

    %% Success path
    F -->|Yes| G["Log success: User row fetched"]
    G --> H[return UserRow]

    %% Not found path
    F -->|No| I["Log info: User not found"]
    I --> J[return null]

    %% Successful result
    H --> K["Ok(UserRow)"]
    J --> L["Ok(null)"]

    %% Error path
    D -. throws .-> M[Database / Drizzle Error]
    M --> N["executeDalResult: normalizePgError + log"]
    N --> O["Err(AppError)"]

    %% Return to caller
    K --> P[Caller receives Result]
    L --> P
    O --> P
```
