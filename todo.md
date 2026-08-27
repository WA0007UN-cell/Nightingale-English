# Project TODO

## Project foundation

- [x] Choose Care Canvas visual direction and document the Phase 1 design rationale.
- [x] Establish an English React/TypeScript frontend baseline.
- [x] Add English synthetic patient, timeline, Glance View, and task data.
- [x] Add a Nightingale brand mark with a reliable CSS fallback.

## Phase 1 core demo

- [x] Build the English patient workspace shell and responsive layout.
- [x] Build a Glance View with one primary card and no more than two secondary cards.
- [x] Add concise reasons, actions, severity labels, scores, and traceable source labels.
- [x] Add Timeline entries with visible authors, roles, timestamps, tags, and review states.
- [x] Add source-jump feedback from Glance cards to Timeline entries.
- [x] Add visible notices for Phase 2/Phase 3 placeholder actions.
- [x] Make Glance View the first major content block after the compact patient identity header.
- [x] Replace the visible role switcher with a login/demo entry screen that establishes one active role.
- [x] Ensure each active role receives role-specific cards, actions, tasks, and navigation labels.
- [x] Keep server-enforced RBAC explicitly marked as Phase 2; do not present the demo role selection as security.
- [x] Verify Clinician, Staff, Patient, and Admin entry states separately on desktop and mobile.
- [x] Verify source-jump interactions remain available only where the active role has access.
- [x] Document the role-isolation decision in the project notes before the next checkpoint.

## Phase 2 planned scope

- [ ] Add the independent English MySQL database and Drizzle schema.
- [ ] Add server-side clinic scope and RBAC enforcement.
- [ ] Add persistent comments, mentions, tasks, section versions, reverts, and audit logs.
- [ ] Add optimistic concurrency using baseVersion.

## Phase 3 planned scope

- [ ] Add server-side PHI redaction before any external model request.
- [ ] Add reviewable system-authored AI summary entries with provenance.
- [ ] Add automated tests for permissions, provenance, versioning, and AI review states.
- [ ] Measure and document the Glance View performance target honestly.
- [ ] Prepare the final two-to-three-page Technical Brief and demo scenarios.

## Phase 4 planned scope

- [ ] Add adaptive feedback ranking with bounded, clinic-scoped adjustments.
- [ ] Add Hot/Warm/Cold history policy without silent source deletion.
- [ ] Add real-time presence and expiring soft field locks while retaining baseVersion.
- [ ] Add NER/SLM placeholder mapping and protected re-identification.
- [ ] Add event-driven priority projections and measure whether Redis is needed.
- [ ] Add non-clinical semantic merge proposals with mandatory human confirmation.
