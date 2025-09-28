# Update Form Standards

## TL;DR
- Prefer PATCH-style partial updates: users only change what they need.
- Pre-fill fields; password is optional on update.
- Treat empty strings as “no change” by default.
- Only allow clearing values via explicit UI controls.
- Normalize inputs server-side (trim, lowercase email) and skip no-op writes.

## UX Guidelines
- Pre-fill all editable fields with current values.
- Require only fields that must remain non-empty (e.g., email, username).
- Keep password optional; update it only when provided.
- For clearing optional fields, use an explicit “Clear value” action instead of relying on blanks.

## API Semantics
- Default to PATCH semantics (partial updates).
- Use PUT (full replacement) only when the domain truly demands it.

## Handling Blanks
- Do not interpret blank inputs as “clear this field” by default.
- Normalize trim("") → undefined to avoid noisy, accidental updates.

## Validation and Normalization
- Trim all text inputs; lowercase emails.
- Keep update schema permissive (optional fields), but reject attempts to blank required fields.
- Ensure client and server validation rules are consistent.

## Backend Behavior
- Compute a minimal patch (diff against current values).
- Skip database writes and return a friendly “No changes” message when nothing changed.
- Log with context; do not expose sensitive values.

## When to Require All Fields
- Rare cases only:
    - Regulatory or strongly consistent workflows needing full replacement.
    - Intentional PUT semantics with explicit product requirements.
