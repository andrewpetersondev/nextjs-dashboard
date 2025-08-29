# Auth: Signup Process (Current)

TL;DR
- Single-step “validate then redirect” flow.
- Server action ignores prevState and validates current FormData.
- On failure: returns FormState with errors and sanitized values; form repopulates from state.values.
- On success: creates user, sets session, redirects to /dashboard.

## End-to-end Flow
1. User submits form via useActionState(signup, INITIAL_STATE).
2. Server action receives (prevState, formData) but only uses formData.
3. Validate using schema and adapters; normalize email/username.
4. On validation failure: return FormState { success: false, errors, values, message? }.
5. On validation success:
    - Create user in DB.
    - On DAL failure: return failure FormState with failure message.
    - On DAL success: set session token and redirect("/dashboard").
6. Client re-renders:
    - If success: browser navigates due to redirect.
    - If failure: inputs repopulate from state.values and show state.errors and server message.

## Server Action Behavior
- Signature: signup(prevState, formData) but prevState is intentionally unused.
- Normalization: email.toLowerCase().trim(), username.trim().
- Errors: converted to dense error map; failure messages for DAL or unexpected errors.
- Security/Privacy: password redaction handled by form adapter defaults.
- Success Path: setSessionToken(userId, "user") → redirect("/dashboard").

## Client Form Behavior
- useActionState provides [state, action, pending].
- Inputs use defaultValue={state.values?.field} and error={state.errors?.field}.
- Submit button shows pending state.
- Optional server message shown if state.message exists.
- No client-side prevState usage; the UI reflects exactly the server-returned FormState for the current submission.

## Why prevState Is Not Used
- For a single-step submission, using only the current formData avoids mixing old and new attempts.
- The server returns a complete FormState for the current attempt; the client reads from it to repopulate fields and errors.
- prevState is reserved for multi-step flows or when you need to carry metadata between attempts.

## Notes and Guardrails
- Keep all normalization/validation on the server; avoid trusting client values.
- Ensure DAL and error paths never leak sensitive info (e.g., do not confirm if email already exists in a way that enables enumeration).
- Logging uses serverLogger with redaction; continue to avoid logging raw passwords.

## Future Work (Login and Demo User)
- Login:
    - Mirror the same FormState pattern (validate → toFormState).
    - On failure, return errors and values for repopulation.
    - On success, set session and redirect similarly.
    - Consider rate-limiting/lockout counters; prevState could track attempts if needed.
- Demo User:
    - Provide a server action that signs in a pre-provisioned user or creates a temporary one.
    - Reuse the same FormState shape for consistency, even if there are no inputs.
    - Ensure permissions are minimal; consider expiration or scoped capabilities.

Checklist
- [ ] Keep server actions in the (prevState, formData) signature.
- [ ] Always return FormState on failure, redirect on success.
- [ ] Inputs read from state.values and state.errors only.
- [ ] Centralize messages in shared constants to avoid leaking details.
- [ ] Add tests for:
    - Validation errors populate fields and messages.
    - Successful signup redirects and sets session.
    - DAL failure returns failure message.
