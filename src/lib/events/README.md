# Events

This directory contains event-driven utilities and type definitions for domain events, supporting decoupled communication between features.

## Files

- **`eventBus.ts`**  
  In-memory event bus for publishing and subscribing to domain events. Enables decoupling between event publishers and subscribers. Includes structured error logging.

- **`invoice.events.ts`**  
  Type definitions and constants for invoice domain events, including base event interfaces and supported invoice operations.

## Usage

- Use the `EventBus` to publish and subscribe to domain events by name.
- Import event name constants and types to ensure consistency when handling events.
- Extend or compose event interfaces for new domain event types as needed.

## Conventions

- All types, interfaces, and utilities are documented using TSDoc.
- Use string literal types and `as const` for event names.
- Update this README when adding or modifying event-related files.
