# Event-Driven Strategies in Next.js App Router

This document outlines strategies to implement event-driven features in a Next.js application using the App Router. These techniques can be used to decouple features like "Invoices" and "Revenues".

---

## 1. In-Memory Event Emitter (Simple Case)

**Best for:** Local development or single-instance deployments.

### Setup

```ts
// src/lib/event-bus.ts
import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();
````

```ts
// src/features/invoices/invoice.actions.ts
import { eventBus } from '@/lib/event-bus';

export async function createInvoice(data: InvoiceInput) {
  const invoice = await db.insert(invoices).values(data).returning();
  eventBus.emit('invoice:created', invoice);
  return invoice;
}
```

```ts
// src/features/revenue/revenue.handlers.ts
eventBus.on('invoice:created', (invoice) => {
  // update revenue from invoice
});
```

### ⚠ Limitations

* Not persistent across deployments
* Does not work in serverless or horizontally scaled environments

---

## 2. Internal API + Async Side Effects

**Best for:** Lightweight decoupling with native Node features.

### Example

```ts
export async function createInvoiceAction(data: InvoiceInput) {
  const invoice = await createInvoice(data);

  queueMicrotask(async () => {
    await updateRevenueFromInvoice(invoice);
  });

  return invoice;
}
```

### 🔍 Notes

* You can also use `setImmediate()` or `Promise.resolve().then()`
* Keeps response time fast while handling side effects

---

## 3. Database Event Table + Background Worker

**Best for:** Serverless or persistent event tracking.

### Schema

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE
);
```

### Emit an Event

```ts
await db.insert(events).values({
  type: 'invoice:created',
  payload: JSON.stringify(invoice),
});
```

### Worker Process

```ts
const events = await db.select().from(events).where({ processed: false });

for (const event of events) {
  if (event.type === 'invoice:created') {
    await updateRevenue(JSON.parse(event.payload));
  }

  await db.update(events)
    .set({ processed: true })
    .where({ id: event.id });
}
```

---

## 4. Message Queue (Redis, Kafka, RabbitMQ)

**Best for:** Distributed, scalable production systems.

### Publish Event

```ts
await redis.publish('invoice:created', JSON.stringify(invoice));
```

### Subscribe to Event

```ts
redis.subscribe('invoice:created', async (message) => {
  const invoice = JSON.parse(message);
  await updateRevenue(invoice);
});
```

### Considerations

* Durable messaging
* Great for microservices and multi-instance apps
* Requires operational overhead (infrastructure)

---

## Summary

| Use Case            | Strategy                        |
| ------------------- | ------------------------------- |
| Dev/local only      | In-memory EventEmitter          |
| Simple apps         | queueMicrotask or internal call |
| Need persistence    | Database Event Table + Worker   |
| Distributed systems | Message Queue (Redis, Kafka)    |

---

## Best Practices

* Use typed event names like `'invoice:created'`
* Separate event logic from user logic
* Persist events for observability and replay
* Centralize event dispatching and handling
* Avoid blocking the main request/response path
