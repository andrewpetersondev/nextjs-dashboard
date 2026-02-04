# ADR 002: Separate Commands and Queries

## Status
Accepted

## Context
As the Auth module grows, mixing business logic that modifies state (Commands) with logic that only retrieves data (Queries) can lead to bloated service classes and complex side effects. We need a clear separation to improve maintainability and scalability.

## Decision
We will apply the Command Query Separation (CQS) principle at the Application layer.

- **Commands**: Encapsulated in "Use Cases" (e.g., `LoginUseCase`, `SignupUseCase`). These represent actions that change the state of the system or perform significant side effects (like setting cookies).
- **Workflows**: Used to orchestrate multiple Commands or complex multi-step processes (e.g., `LoginWorkflow` orchestrates `LoginUseCase` and `EstablishSessionUseCase`).
- **Queries**: Separate DTO-based lookup methods for data retrieval that don't change state.

## Consequences
### Positive
- **Single Responsibility**: Each Use Case or Query has a focused purpose.
- **Improved Testability**: Commands and Queries can be tested in isolation.
- **Better Observability**: We can easily track and measure individual operations.
- **Scalability**: Allows different optimization strategies for reads and writes if needed in the future.

### Negative
- **Increased File Count**: Requires more files and boilerplate compared to a single service class.
- **Complexity in Discovery**: Developers need to know where to find the specific Use Case or Workflow they need.
