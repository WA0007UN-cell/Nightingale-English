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

## P2-F01 — clinic role capability lookup

- [x] Define the four clinic roles and their pure capability lookup without database or UI changes.
- [x] Add focused Vitest coverage for permitted and denied role capabilities.
- [x] Review only the P2-F01 source and test files before proposing its standalone commit.

## P2-F02 to P2-F06 — clinic-scoped persisted workspace foundation

- [x] Add a server-only Drizzle/MySQL connection module with clean close handling.
- [x] Re-validate the final source-controlled clinic-scoped migration on a clean temporary schema before closing this item.
- [x] Add an idempotent seed script with fixed synthetic actors and one synthetic patient.
- [x] Add a server read procedure that validates actor role, clinic membership, patient scope, and entry visibility before returning workspace data.
- [x] Connect the existing workspace to show persisted-foundation status and a returned timestamp without replacing its Phase 1 UI.
- [x] Add and run focused tests for role/scope denial, authorized reads, seed idempotency, and the persisted workspace state.
- [x] Review the exact final Foundation file list from the Git diff before proposing its standalone Git commit.

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

## Login welcome content

- [x] Replace the login-page right panel with welcoming user-oriented copy.
- [x] Verify the revised login page at desktop and mobile sizes.
- [ ] Synchronize the approved login-page welcome update to GitHub.

## Time-aware login greeting

- [x] Add a browser-local Good morning, Good afternoon, or Good evening greeting to the login welcome panel.
- [x] Add deterministic unit coverage for the greeting time boundaries.
- [ ] Verify the login page after the greeting update and synchronize the approved change to GitHub.

## Development environment maintenance

- [x] Fix the Vite development hot-reload WebSocket connection after the Express/tRPC server integration.

## Phase 2 Staff role — assigned tasks and status transitions

- [x] P2-S01: Add a server-authorised Staff assigned-task read path limited to the current user, clinic, and open/in-progress statuses.
- [x] P2-S02: Add Staff-only Start/Complete task transitions with assignee validation, allowed-transition checks, and audit logging.
- [x] Add focused tests for Staff task reads, cross-clinic/incorrect-assignee denial, valid transitions, invalid transitions, and audit events.
- [x] Add the minimal Staff task UI with loading, error, empty, Start, and Complete states without adding escalation or Care Plan editing.
- [x] Receive user confirmation after the Staff task loop and final changed-file review before commit.
- [x] Run the final Staff regression suite, perform a sensitive-file audit, create the verified Staff commit, and push it to GitHub.

- [x] Verify the Staff persisted task API with a real signed server session; the browser demo remains explicitly Phase 1 fallback without a real login session.
- [x] Add user-visible mutation error handling for Staff task Start/Complete failures and focused UI coverage.

- [x] Resolve the Staff preview boundary so the persisted Start/Complete path is understandable and verifiable without bypassing server authorisation.

- [x] Add a second deterministic synthetic open Staff task fixture so the persisted preview can demonstrate Start/Complete after the earlier validation task is complete.

- [x] Align the Staff preview clinic scope with the seeded synthetic clinic ID without weakening server-side clinic validation.
- [x] Remove the Phase 1 local-task fallback from the Staff panel and show only authorised persisted tasks or a clear session-required state.
- [x] Verify visible Start/Complete buttons update the database and remain updated after a browser refresh.
- [x] Preserve one deterministic open synthetic Staff task after the verification flow so the refreshed preview still exposes the real Start button.
- [x] Make the Staff development preview create its synthetic server session automatically when entering the Staff workspace, without exposing that behavior in production.
- [x] Replace the unreliable automatic Staff preview session with an explicit development-only session button that refetches persisted tasks in place.
- [x] Replace the preview cookie dependency with a short-lived server-signed synthetic Staff token carried only by the current development browser tab; production rejects it.
- [x] Diagnose the Staff preview `Failed to fetch` error across database schema, synthetic seed, server route, and frontend request layers.
- [x] Repair the preview session connection layer and verify the Staff preview loads persisted tasks without a fetch error.
