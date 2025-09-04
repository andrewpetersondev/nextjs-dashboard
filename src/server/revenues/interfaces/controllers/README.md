# Revenues Interfaces / Controllers

Purpose:
- Entry points for handling incoming interactions (e.g., API controllers, RPC handlers) specific to Revenues.
- Translate transport details into application use-case requests.

Notes:
- Keep controllers thin: validate input, call use-cases, map responses.
- Do not add barrel files. Do not move existing code yet; migrate later.
