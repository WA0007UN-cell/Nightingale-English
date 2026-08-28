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

- [x] Add the independent English MySQL database and Drizzle schema.
- [x] Add server-side clinic scope and RBAC enforcement for the P2-F05 persisted workspace read path.
- [ ] Add persistent comments, mentions, tasks, section versions, reverts, and audit logs.
- [ ] Add optimistic concurrency using baseVersion.

## P2-S01 to P2-S02 — Staff assigned tasks and status transitions

- [x] Add a server-authorised Staff task list limited to the current signed actor, their clinic scope, and open/in-progress tasks.
- [x] Add Staff-only Start/Complete transitions with assignee, clinic, and allowed-transition validation plus audit events.
- [x] Replace the Staff local task fallback with an authorised persisted task panel, loading/error/empty states, and mutation feedback.
- [x] Add focused tests for task read scope, invalid updates, valid transitions, audit events, and preview-token production rejection.
- [x] Provide a short-lived development-only synthetic Staff preview token held in the current browser tab; production rejects this token path.

## P2-F02 to P2-F06 — clinic-scoped persisted workspace foundation

- [x] Add a server-only Drizzle/MySQL connection module with clean close handling.
- [x] Generate, review, apply, and validate a clinic-scoped migration for clinics, memberships, patients, entries, tasks, and audit events.
- [x] Add an idempotent synthetic seed with fixed `.example.test` actors and one synthetic patient.
- [x] Add a server read procedure that validates server session, role, clinic membership, patient scope, and entry visibility before returning workspace data.
- [x] Connect the existing workspace to a non-sensitive persisted-foundation status and returned timestamp without replacing its Phase 1 UI.
- [x] Cover role/scope denial, authorised reads, seed idempotency, and loading/success/error status states with automated tests.

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

## Bad cases — role boundary and first-screen hierarchy

- [x] Record the oversized patient identity header as a first-screen information-budget bad case.
- [x] Record the in-workspace multi-role switcher as a role-boundary bad case; a signed-in user should have one active role.
- [x] Move the signed-in role identity and sign-out action to the top-right header area.
- [x] Reduce the patient identity header so Glance View is visible above the fold.
- [x] Re-verify the mobile layout after moving identity controls to the top-right header.

## GitHub sync

- [ ] Review the Phase 1 files selected for GitHub sync.
- [ ] Commit the reviewed Phase 1 source, tests, and design documentation.
- [ ] Push the verified commit to the Nightingale-English repository.

## P2-F01 — clinic role capability lookup

- [x] Define the four clinic roles and their pure capability lookup without database or UI changes.
- [x] Add focused Vitest coverage for permitted and denied role capabilities.
- [x] Review only the P2-F01 source and test files before proposing its standalone commit.
