# Role Access Decision

## Phase 1 demo boundary

The Phase 1 experience starts with a single-role demo entry screen. The user selects one role before entering the workspace, and the UI renders only the cards, tasks, navigation labels, and timeline entries intended for that active role. The demo uses synthetic identities and local state so the interaction can be demonstrated without a database or API key.

This role selection is a **presentation state**, not a security mechanism. The page explicitly tells the reviewer that server-enforced authentication and RBAC are Phase 2 work.

## Role visibility rules

| Role | Default focus | Internal context excluded from the view |
|---|---|---|
| Clinician | Clinical review, care-plan questions, and clinician-owned decisions. | None of the synthetic care-team context is hidden in this demo role. |
| Staff | Assigned follow-up, patient updates, and team coordination. | No separate clinician-only action controls. |
| Patient | Approved shared plan, personal updates, and patient-facing next steps. | Staff notes, system review queues, internal risk scores, and pending AI review state. |
| Admin | Governance status, audit context, and access-scope signals. | Patient-facing and direct clinical action workflows. |

## Phase 2 security requirement

The server must repeat all scope and role checks using the authenticated user, clinic membership, and authorized resource relationships. Client-side filtering must never be treated as authorization. Every source jump, task mutation, comment, section edit, version action, and audit query must be checked on the server before data is returned or written.
