# Cookies module: Ports & Adapters (Hexagonal)

This folder keeps cookie **policy** (what the app wants) separate from cookie **integration** (how Next.js stores/reads them). The goal is to make cookie usage consistent across the app and keep framework details contained.

## What each piece is responsible for

- **Port**  
  The contract the app depends on. It defines the operations and types the rest of the code can rely on.

- **Adapter**  
  The framework-facing implementation of the port. It translates the port’s contract into calls to the underlying runtime/framework API.

- **Service**  
  The app-facing API for cookies. It enforces shared rules (for example: secure defaults) and delegates storage mechanics to the port.

- **Factory**  
  The wiring point. It constructs the service with the chosen adapter so callers don’t need to know about concrete implementations.

## Directional flow

### Write / Delete (command → effect)

App code  
`input` (name, value?, options?)  
⬇  
Service  
`input` (name, value?, options) → `output` (void)  
⬇  
Port  
`input` (name, value?, options) → `output` (void)  
⬇  
Adapter  
`input` (name, value?, options) → `output` (void)  
⬇  
Framework cookie store  
`effect` (cookie stored/removed)

### Read (request → response)

App code  
`input` (name)  
⬇  
Service  
⬇  
Port  
⬇  
Adapter  
⬇  
Framework cookie store  
⬆  
`output` (value | undefined) flows back through Adapter → Port → Service → App code

### Composition (wiring / creation)

Factory  
`output` (ready-to-use service instance)  
⬇  
Service (constructed with an adapter implementation)

## Related patterns used

- **Ports & Adapters** (aka **Hexagonal Architecture**) for separation of concerns
- **Dependency Injection** (service receives a port implementation)
- **Factory** for centralized construction/wiring
