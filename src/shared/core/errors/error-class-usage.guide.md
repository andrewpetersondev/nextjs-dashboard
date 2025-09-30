# Error Class Usage Guide

This document explains when to use each custom error class in the project. All errors extend `BaseError` and provide
standardized codes and HTTP status codes for API and service layers.

## `ValidationError`

**Use when:**  
Input data fails validation (e.g., missing required fields, invalid formats).

**HTTP Status:**  
400 Bad Request

**Example:**

- User submits a form with invalid email.
- API receives malformed request payload.

---

## `NotFoundError`

**Use when:**  
Requested resource does not exist (e.g., missing database record, invalid endpoint).

**HTTP Status:**  
404 Not Found

**Example:**

- User requests a non-existent user ID.
- API endpoint is not defined.

---

## `UnauthorizedError`

**Use when:**  
Authentication is required but missing or invalid (e.g., missing token, invalid credentials).

**HTTP Status:**  
401 Unauthorized

**Example:**

- User tries to access a protected route without logging in.
- Invalid or expired JWT token.

---

## `ForbiddenError`

**Use when:**  
User is authenticated but lacks permission for the requested action.

**HTTP Status:**  
403 Forbidden

**Example:**

- User tries to access another user's data.
- Insufficient role or ACL for operation.

---

## `ConflictError`

**Use when:**  
Request cannot be completed due to a conflict with current state (e.g., duplicate data, version mismatch).

**HTTP Status:**  
409 Conflict

**Example:**

- Attempt to create a resource that already exists.
- Concurrent update causes version conflict.

---
