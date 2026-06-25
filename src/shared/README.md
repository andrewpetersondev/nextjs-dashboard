# Shared Folder

This folder contains generic, reusable modules and utilities for both server and client code. All code is designed to be
isomorphic, tree-shakable, and side-effect free unless otherwise noted.

## Structure

- `core/`: Generic types, error/result modeling, validation, and branding utilities.
- `forms/`: Shared form logic, errors, field types, and mapping.
- `http/`: HTTP header utilities and types.
- `policies/`: Reusable validation/business-rule policies for domain primitives (email, password, username, user-role).
- `primitives/`: Primitive types and utilities.
- `routing/`: Shared route definitions.
- `telemetry/`: Logging and telemetry utilities.
- `time/`: Date and time utilities.
