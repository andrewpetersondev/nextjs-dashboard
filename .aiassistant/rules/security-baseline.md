---
apply: off
---

# Security Baseline

## Purpose

Define minimum security practices for auth, data handling, logs, and external I/O.

## Scope & Audience

- Audience: all engineers, reviewers, and AI contributors.
- Applies to: server code, network calls, secrets management, logging, and uploads.
- Contexts: implementation, review, and CI security/audit checks.

## Secrets & Configuration

- Validate env via a Zod schema at startup; fail fast on missing/invalid values.
- Never log secrets or tokens; redact values in logs by default.

## Auth & Sessions

- Enforce server-side auth checks for mutations and sensitive reads.
- Normalize auth-related errors to safe codes/messages before returning to clients.

## Input & Output

- Treat all inputs as untrusted; validate and sanitize server-side.
- Protect against SSRF: restrict outbound fetch destinations or validate against allowlists.
- Encode/escape all user content in UI; avoid dangerouslySetInnerHTML unless sanitized.

## Logging & Redaction

- Use structured logs; redact PII/secrets via a centralized redactor.
- Include minimal context (operation, identifiers), never tokens or passwords.

## File Uploads

- Validate MIME and size; stream to storage; scan if available; never execute user files.

## Dependencies

- Pin versions; schedule regular updates; audit with CI.

_Last updated: 2025-10-05_
