# ADR 006: Prevent Credential Enumeration

## Status
Accepted

## Context
Authentication systems are often vulnerable to "Credential Enumeration" attacks, where an attacker can determine if a specific email exists in the database by observing differences in server responses (e.g., "User not found" vs "Invalid password", or differences in response time).

## Decision
We will implement measures to ensure that attackers cannot distinguish between a non-existent user and an incorrect password.

- **Unified Error Messages**: The login flow must return the same generic error message (e.g., "Invalid email or password") regardless of whether the email was found or the password was incorrect.
- **Consistent Timing**: We should aim for consistent response times. While difficult to achieve perfectly, avoiding early exits when a user is not found is a key practice.
- **Error Mapping**: Mappers at the presentation layer (e.g., `toLoginFormResult`) must normalize different domain errors (`user_not_found`, `invalid_password`) into a single UI error.

## Consequences
### Positive
- **Security**: Protects user privacy by not leaking whether an email is registered.
- **Reduced Attack Surface**: Makes it significantly harder for attackers to build lists of valid users.

### Negative
- **User Experience**: Slightly less helpful for legitimate users who might have made a typo in their email.
- **Debugging**: Can make it slightly more difficult to debug authentication issues in production without detailed internal logs.
