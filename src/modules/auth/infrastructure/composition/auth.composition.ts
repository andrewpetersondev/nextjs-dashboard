/**
 * Add a “composition root” inside the auth module (recommended)
 * Right now, each action wires dependencies independently (DB + factories + logger + request id). That tends to sprawl.
 * Create a single place that builds auth workflows/use-cases for the request, e.g.:
 * •
 * src/modules/auth/infrastructure/composition/auth.composition.ts (or presentation/_composition/auth.composition.ts)
 * Responsibilities:
 * •
 * fetch DB connection (or accept it)
 * •
 * create logger + requestId
 * •
 * create use cases via *UseCaseFactory
 * •
 * create session services (sessionServiceFactory)
 */
