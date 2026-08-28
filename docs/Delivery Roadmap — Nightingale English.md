# Delivery Roadmap — Nightingale English

**Product:** Nightingale English — AI-Assisted Clinical Collaboration and Longitudinal Care Note Prototype  
**Version:** 0.1 — Four-phase working roadmap  
**Data boundary:** Synthetic data only.  
**How to use this document:** `PRD.md` explains what the product must do. `ARCHITECTURE.md` explains how the system is intended to work. This roadmap explains the order in which the team should build, verify, and honestly describe the work.

---

## 1. Delivery Principle

Nightingale should be built in four phases. Each phase is a **quality gate**, not merely a visual milestone. A later capability must not be used to hide an unresolved earlier safety or trust requirement.

> **Build order:** first demonstrate the English user experience; then make collaboration persistent and server-authorised; then add governed AI and challenge evidence; finally evolve the architecture for real-time collaboration, privacy-preserving context, scale, and readable conflict assistance.

| Phase | Outcome | Why it comes at this point |
|---|---|---|
| **Phase 1** | A coherent, fully English, synthetic-data product experience. | Validates the patient story, information hierarchy, and source-navigation interaction before infrastructure work. |
| **Phase 2** | Persistent, server-enforced, auditable collaboration. | Turns visual role differences into real trust boundaries. |
| **Phase 3** | Governed AI support plus automated evidence and submission readiness. | AI is added only after provenance, permissions, and audit foundations exist. |
| **Phase 4** | Real-time, privacy-preserving, scalable collaboration evolution. | Optimises a stable, measured core rather than increasing early build risk. |

---

## 2. Before Phase 1 — Documentation Baseline

This is preparation, **not a fifth delivery phase**. Its purpose is to make the first repository commit truthful and useful.

| Deliverable | Required purpose |
|---|---|
| `README.md` | Concise project entry point: problem, current status, stack, local run instructions when available, and links to documents. |
| `docs/PRD.md` | Product requirements, roles, Glance View rules, risk/urgency logic, and four-phase acceptance criteria. |
| `docs/ARCHITECTURE.md` | Target system diagram, conceptual schema, core interaction logic, security boundaries, and Phase 4 evolution. |
| `docs/ROADMAP.md` | This ordered plan, dependencies, and phase gates. |
| `.gitignore` | Prevent committing `.env`, dependencies, local database volumes, logs, build output, and real/sensitive files. |

**Recommended first commit after the documents have been reviewed:**

```text
docs: define product scope and delivery roadmap
```

---

## 3. Phase 1 — English Product Experience and Evidence Flow

### 3.1 Objective

Create a fully English, desktop-first demonstration that communicates the core product story: a user opens one patient workspace, understands the current situation quickly, sees a limited number of role-appropriate actions, and can navigate directly from a Glance View card to its Timeline evidence.

### 3.2 Build Scope

| Build now | Implementation approach | Explicitly not claimed yet |
|---|---|---|
| React + TypeScript interface | Vite-based front end with local TypeScript/JSON synthetic fixtures. | Persistent shared backend state. |
| Patient workspace | Patient header, Glance View, Timeline, care sections, task/comment visual placeholders where appropriate. | Production EHR integration. |
| Glance View | Three-card information budget: one primary action, up to two secondary actions, optional configured Critical banner, and overflow route. | Automated clinical risk prediction. |
| Static explainable ranking | Deterministic synthetic score breakdown: clinical attention, role action urgency, bounded mock feedback. | Measured large-scale/cached read performance. |
| Role demonstration | Visual switcher for Patient, Staff, Clinician, and Admin views using appropriate content fixtures. | Server-enforced RBAC or real authentication. |
| Timeline/provenance | Human, Patient, System, and three AI summary entry types; click card to source entry/span. | AI provider request and server-side redaction. |
| English quality | All product-facing labels, source records, cards, buttons, examples, and empty states in English. | Translation/localisation framework beyond English. |

### 3.3 Phase 1 Acceptance Gate

- [ ] English interface opens locally with synthetic data only.
- [ ] A Clinician or Staff user can identify the top action, concise reason, and source within 10 seconds.
- [ ] Default Glance View shows no more than three cards and does not duplicate related signals.
- [ ] Selecting a card navigates to its exact timeline source entry/span.
- [ ] AI entries are visibly system-generated and unconfirmed in the UI.
- [ ] Role switcher demonstrates different permitted experiences, with clear demo-only disclaimer.
- [ ] No screen claims that client-side visibility is final RBAC.

### 3.4 Phase 1 Non-Goals

Do not delay this phase for MySQL migration repair, external AI credentials, WebSockets, Redis, voice capture, or CRDT/OT. Those are not substitutes for a clear product flow.

---

## 4. Phase 2 — Persistent, Server-Authorised Collaboration

### 4.1 Objective

Move the validated product flow behind a TypeScript server and synthetic MySQL data model. The key outcome is that permissions, clinic scope, ownership, revisions, and audit evidence become **real server behaviour** rather than visual convention.

### 4.2 Build Scope

| Build now | Required behaviour |
|---|---|
| API + authenticated context | Server derives user identity/role; client-supplied role fields cannot be trusted. |
| Drizzle + MySQL schema/migrations | Persist clinics, members, patients, entries, sections, versions, comments, tasks, highlights, provenance, feedback, and audit records. |
| Clinic-scoped RBAC | Every protected read/write verifies role, membership, patient clinic scope, and section/entry ownership. |
| Patient protection | Patient endpoint omits internal comments, Staff/Clinician internal notes, raw AI notes, internal risk queue, and other users’ data. |
| Comments, mentions, tasks | Staff/Clinician collaboration loop uses valid clinic membership and permitted targets. |
| Version and audit system | Protected section edit stores `baseVersion`, new version snapshot/diff, and metadata-only audit event. |
| Deterministic conflict baseline | Different protected sections may update independently; stale same-section writes return base/current/proposed conflict state. |

### 4.3 Phase 2 Acceptance Gate

- [ ] Refreshing the page preserves synthetic care data and collaboration actions.
- [ ] Tests prove Staff and Clinician cannot edit/write as each other.
- [ ] Tests prove Patient cannot receive internal comments or raw AI-scribed notes.
- [ ] Cross-clinic read/write requests fail server-side.
- [ ] Section edit creates new version and audit event.
- [ ] Revert creates a new version based on an earlier snapshot; history is not erased.
- [ ] Same-section stale write cannot silently overwrite current content.

### 4.4 Phase 2 Non-Goals

Do not replace `baseVersion` checks with an untested real-time solution. Do not claim fully live multi-user editing solely because a UI mock-up displays an “editing” message.

---

## 5. Phase 3 — Governed AI, Validation, and Submission Evidence

### 5.1 Objective

Add assistive AI only through a controlled server pathway, then complete the tests, measurement notes, project documentation, and demo evidence required by the challenge.

### 5.2 Build Scope

| Build now | Required behaviour |
|---|---|
| Server-side minimum redaction | Mask supported names, phone numbers, and IC/ID patterns before model/provider call; no raw protected values in application logs. |
| AI summary adapter | Produce Doctor–Patient, Nurse–Patient, and AI–Patient system `CareEntry` types with provenance/session pointer and review-required state. |
| Clinician review UI | Accept/reject/pin/comment actions are fast, auditable, and never silently turn AI text into active clinical conclusion. |
| Explainable adaptive feedback baseline | Store bounded clinic-scoped feedback signal and explain its contribution to future similar-card ranking. |
| Required automated tests | RBAC/scope, revision history, provenance, concurrent edits, and bonus importance test when implemented. |
| Local performance report | Record dataset size, warm-up condition, measurement method, and observed P95 Glance View result. |
| Submission materials | Update README, architecture/technical brief, `ATTRIBUTION.txt`, test instructions, and demo plan/video. |

### 5.3 Phase 3 Acceptance Gate

- [ ] Model calls receive only redacted synthetic text.
- [ ] AI summary is system-authored, distinct by type, provenance-linked, and review-required.
- [ ] Each generated highlight resolves to valid authorised Timeline evidence.
- [ ] Clinician feedback creates an audit record and modifies only bounded future ranking logic.
- [ ] `pnpm test` and type/lint checks have documented commands/results.
- [ ] Technical brief states measured/approximated latency honestly and makes no production or clinical-validation claim.
- [ ] Demo covers Scenario A, B, and C from the candidate brief.

### 5.4 Phase 3 Non-Goals

Rule/pattern redaction is a minimum practical implementation, not a claim of complete clinical de-identification. Do not falsely claim local NER, re-identification, caching, WebSocket presence, or semantic merge before they actually exist.

---

## 6. Phase 4 — Real-Time, Privacy-Preserving, Scalable Collaboration

### 6.1 Objective

Evolve a stable, tested core into a lower-friction, privacy-preserving, scalable collaboration architecture. These workstreams remain future/bonus work until earlier phase gates pass.

### 6.2 Phase 4 Workstreams

| Workstream | Problem addressed | Incremental delivery | Guardrail |
|---|---|---|---|
| **4.1 Presence awareness and soft locks** | `baseVersion` detects conflict only at save time. | WebSocket presence with section/field resource key, permitted display identity, heartbeat TTL, and advisory soft lock. | Same authorisation as HTTP; unsaved draft text is never broadcast; `baseVersion` remains final save-time check. |
| **4.2 NER placeholder mapping** | Pattern redaction may miss identifiers, over-redact, or reduce model context. | Controlled local SLM/NER detects configured sensitive entities; replace with stable placeholders; keep mapping in protected server/local store; authorised re-identification after output validation. | External LLM never receives mapping; uncertain detection takes safe fallback/human-review route; output remains AI + review-required. |
| **4.3 CQRS priority projections** | Read-time aggregation can become expensive as Timeline grows. | Command writes produce durable domain events; idempotent worker refreshes `clinic + patient + role (+ assignee)` Top Card projection; optional Redis accelerates reads after baseline works. | Source-of-truth remains MySQL; query API checks RBAC before projection/cache read; cache miss fails back safely; P95 is measured, never guaranteed by design alone. |
| **4.4 Adaptive feedback refinement** | Static rules do not learn clinic-specific usefulness. | Aggregate immutable Clinician feedback by clinic/topic/entity with bounded adjustment and score explanation. | Cannot alter sources, cross clinics, overpower configured Critical safety floor, or become opaque autonomous triage. |
| **4.5 Hot/Warm/Cold history policy** | Full long history increases cognitive and loading burden. | Maintain Hot active evidence; show Warm grouped summaries; move eligible originals to Cold historical layer while provenance remains resolvable. | Never silently delete original evidence; active risk/task/pin/conflict/provenance target cannot decay out of active path. |
| **4.6 Semantic merge proposal** | Code-style diff is difficult for clinical users to read. | For policy-approved non-clinical free-text conflict, controlled local model proposes readable merge; show Base/Current/My Draft/Proposed Merge. | Proposal has no write authority; authorised human confirms; clinical factual/confidence-uncertain conflict never enters model merge path. |

### 6.3 Phase 4 Dependency Order

```text
Phase 2 source records + RBAC + versions + audit
        ↓
Phase 3 redaction baseline + feedback events + measurements
        ↓
4.1 presence awareness ──┐
4.2 NER placeholder path ├─→ 4.3 durable events + priority projections
4.4 feedback refinement ─┘
        ↓
4.5 data-decay policy and 4.6 semantic merge proposal
```

Presence may be implemented independently after Phase 2. CQRS projections need durable source writes and audit/feedback events. Semantic merge must build on the existing deterministic conflict classification; it must never replace it.

### 6.4 Phase 4 Acceptance Gate

- [ ] Only same-clinic, authorised users can receive presence signals for an accessible section/field.
- [ ] Presence/soft locks expire after disconnect or heartbeat timeout, and final writes still use `baseVersion`.
- [ ] Model prompt contains stable placeholders instead of protected mapping values; mapping never appears in Git, logs, or unauthorised APIs.
- [ ] AI output remains source-traceable, system-labelled, and review-required after authorised re-identification.
- [ ] Domain events are durable/idempotent; projection refresh does not duplicate feedback effect.
- [ ] Query response authorises user before using a projection/cache item; safe fallback exists when cache is unavailable.
- [ ] Measured local P95 and measurement conditions are recorded rather than inferred from architecture.
- [ ] Semantic merge is available only for policy-approved non-clinical text, cannot auto-save, and retains Base/Current/My Draft/provenance/audit evidence.
- [ ] Medication, dosage, allergy, symptom, vital, diagnosis, and uncertain factual conflicts are preserved for authorised human review.

---

## 7. Brief Scenario-to-Build Mapping

The candidate brief’s Scenario A/B/C are not phases. They are the final demo stories that the implementation must prove.

| Brief scenario | Supporting phase(s) | Evidence to demonstrate |
|---|---|---|
| **Scenario A — Glance View in Action & AI Scribe Integration** | Phase 1 UI; Phase 3 governed AI. | Staff sees Top Card in under 10 seconds; selected AI-sourced card jumps to exact Timeline entry; source/system/review state is visible. |
| **Scenario B — Collaborative Audit Trail & Importance Learning** | Phase 2 collaboration; Phase 3 feedback. | Staff note and Clinician mention; Clinician highlight/edit; version diff; revert; audit event; bounded importance feedback explanation. |
| **Scenario C — Longitudinal Context** | Phase 1 Timeline; Phase 3 ranking explanation; Phase 4 architecture explanation. | Mixed entries over different dates; explain recent/unresolved/confirmed priority; demonstrate or architecturally explain data decay. |

---

## 8. Recommended Honest Commit Boundaries

| Order | Commit scope | Example commit message |
|---:|---|---|
| 1 | Reviewed documentation baseline, README outline, `.gitignore`. | `docs: define product scope and delivery roadmap` |
| 2 | React/Vite base plus English synthetic data fixtures. | `feat: initialize English patient workspace` |
| 3 | Glance View, Timeline, provenance jump, visual role states. | `feat: add explainable patient timeline experience` |
| 4 | Persistent API/schema/migrations and server RBAC. | `feat: add persistent clinic-scoped care records` |
| 5 | Comments, tasks, versions, audit, base-version conflict flow. | `feat: add auditable collaboration workflows` |
| 6 | Redaction, AI-scribed entries, provenance, human feedback. | `feat: add traceable AI assistance and importance feedback` |
| 7 | Tests, benchmark notes, README, technical brief, attribution, demo preparation. | `test: validate care-note trust and access rules` |
| 8 | Future Phase 4 work only when genuinely implemented/tested. | `feat: add role-scoped presence awareness` |

> Commit after a small, working, reviewed boundary. Do not manufacture a fake sequence of manual development commits for code generated in one batch. Never commit `.env`, API keys, database passwords, Docker volumes, `node_modules`, or any real patient information.

---

## 9. Stop Rules and Scope Protection

| If this happens | Preferred decision |
|---|---|
| Phase 1 English product flow is unclear | Improve card hierarchy, source jump, synthetic scenarios, and English copy before adding backend/AI complexity. |
| MySQL/migration work blocks progress | Isolate and fix it during Phase 2; do not compromise Phase 1 demonstration with risky manual database changes. |
| AI provider/redaction integration is incomplete | Keep synthetic prewritten AI entries explicitly labelled as demo fixtures; do not pretend a real AI path exists. |
| Required RBAC/test behaviour is failing | Fix server enforcement/tests before beginning Phase 4 optimisation. |
| Phase 4 is not implemented in time | Document it as proposed future architecture with guardrails and acceptance criteria, not as delivered functionality. |

---

## 10. Definition of a Strong Final Build

A strong Nightingale submission is not the one with the most technologies named. It is the one where a reviewer can quickly observe a clear English patient story, useful and limited Glance View cards, exact evidence links, genuine server-side role boundaries, traceable AI assistance, safe version behaviour, and honest documentation of what is implemented versus proposed.
