# Junie Guidelines: Auditing and Refactoring AI Rules

## Purpose

Provide a concise, repeatable process to audit and refactor AI rule documents in `./.aiassistant/rules`.

## Audience

Rule authors, reviewers, and maintainers.

## Precedence & Scope

1. Follow the established precedence order; do not restate higher-precedence rules—only add deltas/clarifications.
2. Each rule file must declare its purpose and link to its upstream references.
3. On conflict, pause, identify the higher-precedence source, document a short resolution note, then proceed.

## Authoring Conventions

1. Structure each rule file with: Title, Purpose, Audience, Precedence link(s), Rules (numbered), Examples (only if non-obvious), Changelog, Last updated (ISO).
2. Use “must/must not”; avoid “should/try”.
3. Keep files ≤ 200 lines; split by domain rather than aggregating.
4. Use numbered lists for normative rules; bullets for context-only notes.
5. Add “Non-goals” to prevent scope creep.

## Hygiene Rules

1. No duplication across files; centralize shared guidance in the highest relevant document and cross-link elsewhere.
2. Keep rules atomic, testable, and scoped to the file’s stated Purpose.
3. Normalize language; remove ambiguous qualifiers and redundant restatements.
4. Prefer links/anchors over copy-paste.

## Versioning & Governance

1. Every edit updates “Last updated” and appends a Changelog entry with summary and owner.
2. Introduce new rules as “Proposed” if upstream impact is unclear; promote after adoption.
3. Deprecate with a sunset date and migration notes.

## Security & Privacy Baseline

1. Require JSON-safe logs; redact secrets/PII by default.
2. Prefer least-privilege defaults and safe fallbacks.
3. Keep error/result formats serializable and consistent.

## Results & Errors

1. Centralize discriminated unions and error shapes in a single canonical file; reference it from domain-specific rules.
2. Do not redefine shared shapes in other files.

## Compliance Checklist (per file)

1. Precedence header present and correct.
2. Purpose/Audience/Last updated/Changelog present.
3. Only deltas/clarifications to upstream; no restatements.
4. Rules are numbered, unambiguous, and testable.
5. No contradictions with higher-precedence docs.
6. Domain-focused; ≤ 200 lines or split.
7. Cross-links resolve and anchors exist.
8. Examples minimal and aligned to rules.
9. Security/privacy statements align with the baseline.
10. Result/error modeling references the canonical source.

## Refactor Triggers

1. Duplicate content across multiple files.
2. Conflicts or repeated exceptions noted in reviews.
3. File exceeds its stated Purpose or length.
4. Excessive rationale/examples overshadow rules.

## Refactor Playbook

1. Deduplicate: keep guidance in the highest-precedence relevant file; replace others with “See: …”.
2. Resolve conflicts per precedence; add a short Conflict Resolution note.
3. Split oversized or mixed-domain files; maintain anchors and update inbound links.
4. Normalize language to “must/must not”; remove ambiguity.
5. Extract shared glossary/terminology; link to it.
6. Update Changelog and Last updated; notify owners of impacted files.

## Traceability & Verification

1. Assign an Audit ID to each rule (e.g., RULE-FORMS-003).
2. Map rules to verification steps (lint, CI, review checklist).
3. Add “Verification” bullets where automation is feasible.

## Change Management Template

- Title:
- Purpose:
- Motivation:
- Impact radius:
- Migration steps:
- Owner:
- Status: Proposed | Adopted | Deprecated (sunset: YYYY-MM-DD)
- Last updated: YYYY-MM-DD

## Changelog

- YYYY-MM-DD: Initial guidelines added (owner: <name>).

## Last updated

YYYY-MM-DD
