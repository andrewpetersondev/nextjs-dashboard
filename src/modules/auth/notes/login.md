Based on the provided code, here is the analysis of the layers involved in the login process, focusing on how data and errors pass between them.

1. Data Access Layer (DAL)
   • Primary File: get-user-by-email.dal.ts
   • Role: Executes the raw database query using Drizzle ORM.
   • Data Handling: Returns a Result<UserRow | null, AppError>. It focuses purely on retrieving the raw database row.
   • Error Handling: Uses executeDalResult (from execute-dal-result.ts).
   ◦ Database Errors: Any Postgres/Drizzle errors are caught, normalized via normalizePgError, logged with context, and returned as an Err(AppError).
   ◦ Missing Data: If no user is found, it returns Ok(null) and logs an informative message.
2. Repository Layer
   • Primary Files: auth-user.repository.ts, auth-user-repository.adapter.ts
   • Role: Acts as a bridge between the infrastructure (database) and the application core.
   • Data Handling: Converts the raw UserRow into a domain-specific AuthUserEntity using a mapper (toAuthUserEntity).
   • Error Handling: It does not define authentication semantics (like "invalid credentials"). It simply propagates errors from the DAL up to the Use Case.
3. Application Use Case Layer
   • Primary File: login.use-case.ts
   • Role: Contains the core business logic for authentication.
   • Data Handling: Receives AuthLoginSchemaDto (validated email/password). Returns Result<AuthUserOutputDto, AppError>.
   • Logic & Errors:
   ◦ Calls the repository to find the user by email.
   ◦ User Not Found: If the repository returns null, the use case returns an explicit not_found application error.
   ◦ Password Verification: Uses a HashingService to compare the provided password with the stored hash.
   ◦ Invalid Password: If they don't match, it returns an invalid_credentials application error.
   ◦ Unexpected Errors: A try/catch block catches any unforeseen runtime exceptions, logs them, and normalizes them into an "unexpected" AppError.
4. Workflow Layer
   • Primary File: login.workflow.ts
   • Role: Orchestrates multiple use cases or services (authentication + session establishment).
   • Security & Error Mapping: This is a critical layer for security.
   ◦ It catches both not_found and invalid_credentials errors from the Use Case.
   ◦ Anti-Enumeration: It maps both error types into a single, unified invalid_credentials error. This prevents attackers from figuring out which emails are registered in the system.
   • Data Handling: Converts the AuthUserOutputDto into a SessionPrincipalDto for the session service.
5. Action Layer (Server Action)
   • Primary File: login.action.ts
   • Role: The entry point for the Next.js form submission.
   • Input Validation: Validates the raw FormData using LoginSchema (Zod). If validation fails, it returns a FormResult containing specific field errors (e.g., "Invalid email").
   • Workflow Integration: Calls the loginWorkflow.
   • Result Mapping: If the workflow returns an error, it uses mapLoginErrorToFormResult (from auth-form-error.adapter.ts).
   ◦ For the unified invalid_credentials error, it attaches the error message ("Invalid credentials. Please try again.") to both the email and password fields, as well as the form-level summary. This ensures the UI provides consistent feedback regardless of whether the email was missing or the password was wrong.
   Summary of Error Flow
6. DB Error $\rightarrow$ executeDalResult (Normalizes/Logs) $\rightarrow$ Repository (Propagates) $\rightarrow$ Use Case (Propagates) $\rightarrow$ Workflow (Propagates) $\rightarrow$ Action (Maps to UI).
7. Missing User $\rightarrow$ DAL (null) $\rightarrow$ Use Case (not_found) $\rightarrow$ Workflow (Maps to invalid_credentials) $\rightarrow$ Action (Maps to UI field errors).
8. Wrong Password $\rightarrow$ Use Case (invalid_credentials) $\rightarrow$ Workflow (Maps to invalid_credentials) $\rightarrow$ Action (Maps to UI field errors).
