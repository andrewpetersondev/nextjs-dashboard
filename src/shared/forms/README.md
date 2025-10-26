# Forms (Shared)

## Folder Layout

Domain = Framework-agnostic business logic

- No Zod, no FormData, no Next.js
- Pure types, factories, guards

Application = Use case orchestration

- Coordinates domain + infrastructure
- validateForm lives here

Infrastructure = External dependencies

- Zod adapters
- FormData extraction
- Framework-specific code

State = UI/Presentation concerns

- Mappers for React components
- Initial state helpers
