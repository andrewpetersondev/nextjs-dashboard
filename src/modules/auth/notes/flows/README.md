# Auth module flow notes

The step-by-step **flow diagrams** for this module — login, session lifecycle,
and error handling — now live as verified Mermaid diagrams in
[`docs/diagrams/`](../../../../../docs/diagrams): `auth-login-flow.md`,
`session-lifecycle.md`, and `error-handling-flow.md`. The *why* behind the
decisions is in the [ADRs](../adr).

Two reference notes still live here, next to the code they describe:

- **[signup-flow.md](./signup-flow.md)** — the registration flow, end to end
- **[data-transformations.md](./data-transformations.md)** — the auth mapper
  reference: what each mapper does and where the security boundaries sit
