# Phase 2 Feature Slices

## Working method

Phase 2 moves Nightingale from a client-side synthetic demonstration toward a persistent, role-scoped collaboration prototype. Work is organised as **Phase → Role → Feature Slice**. A slice is complete only when its data model, server-side authorization rule, user-visible behaviour, automated tests, and audit evidence agree.

> The Phase 1 role picker remains a demonstration entry point. In Phase 2, the server becomes the authority for membership, role, clinic scope, and allowed actions.

## Phase 2 goal

The goal is to persist a small synthetic care workflow and prove that a user can only read or change data permitted by their clinic membership and role. This phase does not add an external LLM or real patient data.

## Slice sequence

| Slice | Phase | Role focus | Minimal demonstrable outcome | Required proof |
|---|---|---|---|---|
| F0 — Trusted foundation | Phase 2 | All roles | Synthetic clinic, users, memberships, one patient, timeline entries, and role capabilities are persisted. | Schema migration, deterministic seed, clinic-scope and role tests. |
| F1 — Staff follow-up | Phase 2 | Staff | A Staff member opens only their assigned task, changes its status, and raises one clinician escalation. | Task status, comment/escalation, audit event, forbidden cross-clinic and wrong-role tests. |
| F2 — Clinician review | Phase 2 | Clinician | A Clinician reviews an escalation and updates one protected care-plan section using `baseVersion`. | New section version, audit event, conflict response, Staff cannot perform the edit. |
| F3 — Patient visibility | Phase 2 | Patient | A Patient sees only approved next steps and patient-visible entries. | Internal Staff, system, and review content are absent from the server response. |
| F4 — Governance view | Phase 2 | Admin | An Admin sees clinic-scoped audit and governance signals without clinical write actions. | Clinic scope filter, read-only procedure, denied clinical write test. |

## F0 — trusted foundation contract

The first slice introduces only the entities required by all later slices: `User`, `Clinic`, `ClinicMember`, `Patient`, `CareEntry`, `Task`, and `AuditLog`. It also establishes the basic role vocabulary: `Clinician`, `Staff`, `Patient`, and `Admin`.

The server must derive the acting identity from the authenticated session in the production path. For a synthetic local demo, any identity fixture must be explicit, deterministic, and labelled as a fixture; it must never be treated as production authorization.

| Rule | F0 requirement |
|---|---|
| Clinic scope | Every patient, entry, task, and audit event belongs to exactly one clinic. Queries first resolve membership, then filter by that clinic. |
| Patient scope | A Patient may read only their own patient-visible data. |
| Staff scope | A Staff member may read clinic information needed for coordination and write only allowed operational actions. |
| Clinician scope | A Clinician may read their clinic context and later edit clinician-owned care-plan sections. |
| Admin scope | An Admin is clinic-scoped and governance-oriented; it does not receive clinical write capability by default. |
| Audit | Any later write action records actor, clinic, target, action, timestamp, and non-sensitive metadata. |

## Commit boundary

Each feature slice receives one meaningful commit only after its tests pass. Examples are `feat(data): add clinic-scoped foundation` and `feat(staff): add assigned-task escalation workflow`. A commit must not claim an external service, clinical outcome, or server-enforced protection that the code does not implement.

## Out of scope for Phase 2

External model calls, PHI redaction, human review of AI output, feedback ranking, presence indicators, cache projections, and semantic merge proposals remain Phase 3 or Phase 4 work. The Phase 2 dataset stays synthetic.
