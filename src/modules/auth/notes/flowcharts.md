# Auth Login Flowcharts

This document details the logic flow for the user authentication process, organized from the entry point (Action) down
to the data access layer (DAL).

## 1. Action Layer: `loginAction`

**Responsibility:** Next.js Server Action boundary. Handles form validation, performance tracking, and mapping results
to UI feedback or redirects.

```mermaid
flowchart TD
%% Inputs
  A["Input<br/>(formData)"] --> B[loginAction]

%% Preparation
  B --> C["Generate requestId"]
  B --> D["Get Request Metadata<br/>(IP, User Agent)"]
  D --> TRACK["Initialize PerformanceTracker<br/>& Scoped Logger"]

%% Validation
  TRACK --> E["validateForm(formData, LoginSchema, fields)"]

%% Validation Decision
  E --> F{"validated.ok?"}

%% Validation Error Path
  F -->|No| G["Extract Field Errors<br/>(extractFieldErrors)"]
  G --> H["Return validated (Err Result)"]

%% Workflow Execution
  F -->|Yes| I["Create UseCase & SessionService Factories"]
  I --> J["loginWorkflow(input, deps)"]

%% Workflow Result Decision
  J --> K{"sessionResult.ok?"}

%% Workflow Failure Path
  K -->|No| L["toLoginFormResult(error, input)"]
  L --> M["Return FormResult"]

%% Workflow Success Path
  K -->|Yes| N["Log Success & Revalidate Path"]
  N --> O["redirect(ROUTES.dashboard.root)<br/>(no payload)"]

%% Outputs
  H --> Z["Action Result"]
  M --> Z
  O --> Z
```

## 2. Workflow Layer: `loginWorkflow`

**Responsibility:** Orchestrates the login "story" by coordinating authentication and session establishment.

```mermaid
flowchart TD
%% Inputs
  A["Input<br/>LoginRequestDto<br/>(email, password)"] --> B[loginWorkflow]

%% Use Case Call
  B --> C["loginUseCase.execute(input)"]

%% Auth Result
  C --> D["authResult"]

%% Sub-workflow delegation
  D --> E["establishSessionForAuthUserWorkflow<br/>(authResult, deps)"]

%% Sub-workflow execution
  E --> F{authResult.ok?}

  F -->|No| G["Propagate error"]
  F -->|Yes| H["Map AuthenticatedUserDto → SessionPrincipalDto<br/>(toSessionPrincipalPolicy)"]

  H --> I["sessionService.establish(principal)"]

%% Results
  G --> Z["Return Result.Err(AppError)"]
  I --> J{sessionResult.ok?}
  J -->|No| Z
  J -->|Yes| Z1["Return Result.Ok<SessionPrincipalDto (id, role)>"]
```

## 3. Application Use Cases

### 3.1. `LoginUseCase`

**Responsibility:** Executes core authentication logic by finding the user and verifying their credentials using a
hashing service. Implements anti-enumeration by mapping specific credential failures to a unified error.

```mermaid
flowchart TD
%% Inputs
  A["Input<br/>LoginRequestDto<br/>(email, password)"] --> B[LoginUseCase.execute]

%% Wrapper
  B --> B1["safeExecute wrapper"]

%% Repository Call
  B1 --> C["repo.findByEmail({ email })"]

%% Repo Result Decision
  C --> D{Result.ok?}

%% Repo Error Propagation
  D -->|No| E["Propagate Err(AppError)"]
  E --> Z["Return Result.Err(AppError)"]

%% Repo Success path
  D -->|Yes| F["Extract AuthUserEntity | null"]

%% User existence decision
  F --> G{User exists?}

%% Not Found Path - Anti-Enumeration
  G -->|No| H["AuthErrorFactory.makeCredentialFailure<br/>('user_not_found', { email })"]
  H --> H1["Maps to: invalid_credentials<br/>(reason: 'user_not_found')"]
  H1 --> Z

%% Password Verification
  G -->|Yes| I["hasher.compare(password, user.password)"]

%% Password Decision
  I --> J{Password OK?}

%% Invalid Credentials Path - Anti-Enumeration
  J -->|No| K["AuthErrorFactory.makeCredentialFailure<br/>('invalid_password', { userId })"]
  K --> K1["Maps to: invalid_credentials<br/>(reason: 'invalid_password')"]
  K1 --> Z

%% Success Path
  J -->|Yes| L["Map to AuthenticatedUserDto<br/>(toAuthUserOutputDto)"]
  L --> M["Ok(AuthenticatedUserDto)"]

%% Outputs
  M --> Z1["Return Result.Ok(...)"]

%% Catch block
  B1 -. catch .-> N["Log error & normalize to 'unexpected'"]
  N --> Z
```

### 3.2. `EstablishSessionUseCase` (via `SessionService`)

**Responsibility:** Handles session lifecycle by issuing a new token via `SessionTokenService` and persisting it via
`SessionStore`.

```mermaid
flowchart TD
%% Inputs
  A["Input<br/>SessionPrincipalDto<br/>(id, role)"] --> B[SessionService.establish]

%% Token Generation
  B --> C["sessionTokenService.issue<br/>({ role, userId })"]

%% Issue Result Decision
  C --> D{"issuedResult.ok?"}

%% Token Error path
  D -->|No| E["Propagate Err(AppError)"]
  E --> Z["Return Result.Err(AppError)"]

%% Success path: Extract values
  D -->|Yes| F["Extract token & expiresAtMs"]

%% Persistence via SessionStore
  F --> G["sessionStore.set<br/>(token, expiresAtMs)"]

%% Completion
  G --> H["Log operation: Session established"]
  H --> I["Ok(SessionPrincipalDto: id, role)"]
  I --> Z1["Return Result.Ok<SessionPrincipalDto>"]

%% Catch block
  B -. catch .-> J["safeExecute: Normalize to 'unexpected'"]
  J --> Z
```

## 4. Infrastructure Layer

### 4.1. Repository: `AuthUserRepository`

**Responsibility:** Provides a clean interface for auth-related data persistence, mapping raw database rows to domain
entities via contract.

```mermaid
flowchart TD
%% Inputs
  A["Input<br/>AuthUserLookupQuery<br/>(email)"] --> B[AuthUserRepository.findByEmail]

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
G -->|Yes| H["Map UserRow → AuthUserEntity<br/>(authUserRowToEntity)"]
H --> I["Wrap in Ok(AuthUserEntity)"]

%% Null passthrough
G -->|No| J["Return Ok(null)"]

%% Outputs
I --> K["Output<br/>Result.Ok<AuthUserEntity | null>"]
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
