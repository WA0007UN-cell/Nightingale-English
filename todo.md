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
- [ ] Add server-side clinic scope and RBAC enforcement.
- [ ] Add persistent comments, mentions, tasks, section versions, reverts, and audit logs.
- [ ] Add optimistic concurrency using baseVersion.

## Phase 2 role-based feature slices

- [ ] Foundation slice: persist synthetic clinics, memberships, patients, timeline entries, and role capabilities.
- [ ] Add a minimal server read path that returns persisted clinic-scoped foundation data and verify it end-to-end.
- [ ] Configure Vitest to run the new server and shared-domain authorization tests.
- [ ] Staff slice: receive own assigned task, update its status, and create a clinician escalation with audit evidence.
- [ ] Clinician slice: review the escalation, update one protected care-plan section with baseVersion, and inspect the version/audit trail.
- [ ] Patient slice: retrieve only approved patient-visible context and no internal comments or system entries.
- [ ] Admin slice: retrieve clinic-scoped governance and audit information without clinical write actions.
- [ ] Run independent automated tests for every completed role slice before moving to the next slice.

## Minimal component delivery rule

- [ ] Deliver one smallest understandable component or vertical feature slice at a time, with a named user outcome.
- [ ] For each slice, inspect the changed files, run focused tests, verify the visible result, and explain the next smallest step before expanding scope.
- [ ] Use one meaningful Git commit per verified slice; do not create artificial history or bundle unrelated work.

## Slice implementation guide

- [x] Publish a numbered component-and-feature-slice guide with role, input, processing, output, validation, and commit boundaries.

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

## Architecture alignment review

- [ ] Map the proposed core, features, role-view, and shared-ui folders to current Nightingale modules and phases.
- [ ] Document which domain logic must move to the server before Phase 2 rather than remain in the client.
- [ ] Propose a staged directory refactor that preserves the working Phase 1 Demo.
