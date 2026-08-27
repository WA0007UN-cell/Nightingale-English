# Design Log: Phase 1 Bad Cases

## Bad case 01 — the patient header dominated the first screen

The first implementation gave the patient identity banner too much vertical space and used an oversized patient name. As a result, Glance View was pushed below the fold, weakening the product's primary promise: identify the next action quickly.

**Correction:** keep patient identity compact and authoritative, then place Glance View immediately after it. The patient name remains visible, but the main action hierarchy owns the first screen.

**Lesson:** identity context needs an information budget. It should support action selection, not compete with it.

## Bad case 02 — a role switcher implied cross-role visibility

The first implementation displayed Clinician, Staff, Patient, and Admin as tabs inside one workspace. This was useful for demonstrating four states, but it did not model how a signed-in user should experience the product: one identity should enter one role-scoped workspace.

**Correction:** Phase 1 now starts with an explicit demo entry screen. After one role is selected, the workspace shows only that role's cards, navigation labels, tasks, and timeline entries. A compact current-role control in the top-right provides sign-out rather than cross-role switching.

**Boundary:** this is a visual demo state, not authorization. Phase 2 must repeat all scope and role checks on the server using authenticated users and clinic membership.

## Verification note

The role selectors are covered by Vitest tests for role-owned cards, patient timeline exclusion, and role-owned task lists. TypeScript checking and the production build must pass before this correction is checkpointed.
