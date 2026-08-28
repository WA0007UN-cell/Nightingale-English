# Product Requirements Document — Nightingale English

**Product:** Nightingale English — AI-Assisted Clinical Collaboration and Longitudinal Care Note Prototype  
**Version:** 0.2 — Product and Glance View design review  
**Status:** Approved working baseline for architecture and Phase 1 implementation planning  
**Source:** Adapted from the supplied *Nightingale 72 Hour Build Candidate Brief*  
**Data boundary:** Synthetic data only. This prototype is not a diagnostic system and is not intended for clinical deployment.

---

## 1. Product Summary

Nightingale English is a full-English web prototype for a shared, longitudinal patient Care Note. It brings together fragmented consultation notes, patient updates, follow-up tasks, internal comments, and AI-scribed summaries into one traceable, role-aware patient narrative.

The product does not replace an Electronic Health Record. It is a collaboration and trust layer that helps authorised users answer three questions safely and quickly:

1. **What needs attention now?**
2. **What source supports that conclusion?**
3. **Who is authorised to review, act on, or edit it?**

> **Product principle:** Nightingale must be useful as a small, explainable clinical-collaboration prototype without claiming autonomous diagnosis, clinical validation, or production healthcare compliance.

---

## 2. Problem Statement

Important care context is often spread across dated free-text notes, nursing follow-ups, patient-reported updates, tasks, and AI-generated summaries. Users must reconstruct a patient story manually by scrolling across disconnected records. This increases cognitive load, makes ownership unclear, and risks overlooking an unresolved action or a fact that needs review.

Nightingale addresses this problem with a shared patient workspace. Its **Glance View** surfaces only a small number of role-relevant actions; its **Longitudinal Timeline** preserves complete, traceable evidence; and its role boundaries prevent the visual convenience layer from becoming an unauthorised data-disclosure layer.

---

## 3. Users, Roles, and Safety Boundaries

| Role | Primary objective | Permitted minimum actions | Prohibited minimum actions |
|---|---|---|---|
| **Patient** | Understand approved patient-facing instructions and submit permitted updates. | View patient-facing summaries/instructions; complete patient-owned updates. | View internal comments, clinician/staff internal notes, raw AI notes, or internal risk queues. |
| **Staff** | Record follow-up context and coordinate operational care actions. | View/add permitted staff notes; create and manage clinic-scoped follow-up tasks. | Access other clinics; write as a clinician; overwrite clinician-owned protected sections. |
| **Clinician** | Review risk context, make clinical decisions, and update the care plan. | View permitted staff/AI notes; edit clinician-owned sections; confirm, reject, or resolve clinical-risk candidates. | Access another clinic; silently overwrite protected staff content. |
| **Admin** | Provide clinic-scoped workflow and governance oversight. | View authorised clinic records, audit events, and governance exceptions. | Access data outside the clinic scope; substitute for clinical judgement. |
| **System / AI** | Create assistive, traceable, reviewable content. | Create labelled AI entries with provenance and unconfirmed status. | Present a suggestion as a human clinical conclusion; bypass human review; change source facts. |

> **Access-control rule:** The final application must filter data and enforce role/clinic scope on the server. Hiding UI buttons is never sufficient protection.

---

## 4. Product Goals and Success Criteria

| Goal | Success definition |
|---|---|
| **Glanceability** | A Clinician or Staff user can identify the highest-priority role-relevant action, its reason, and its source in less than 10 seconds. |
| **Actionability** | Every visible card provides exactly one clear next action or direct route to its source. |
| **Traceability** | Every source-derived highlight resolves to an authoritative timeline entry or span. |
| **Safe collaboration** | Notes, comments, mentions, tasks, versions, and reverts operate within role and clinic boundaries. |
| **Governed AI** | AI outputs are system-labelled, provenance-linked, redacted before model processing, and subject to human review. |
| **Demonstrability** | The repository, automated micro-tests, documentation, and demo video prove the requested core scenarios using synthetic data. |

---

## 5. Core User Flows — Not Development Phases

### Flow A — Glance View to source evidence

```text
Authorised Staff or Clinician opens a patient workspace
→ sees at most three role-relevant action cards
→ selects a card such as “Possible medication reaction requires verification”
→ opens the exact permitted Timeline entry or source span
→ sees source type, author role, time, confirmation state, and linked context
```

### Flow B — Collaborative care update and audit

```text
Staff adds a follow-up note
→ adds an internal comment and mentions a Clinician
→ creates or receives a follow-up task
→ Clinician updates a clinician-owned care-plan section
→ system creates a new version and metadata-only audit event
→ authorised user reviews the change history and reverts safely when required
```

### Flow C — Governed AI assistance

```text
Synthetic doctor–patient, nurse–patient, or AI–patient interaction is submitted
→ server redacts supported PHI patterns before any model request
→ system stores a clearly marked AI-scribed entry with provenance
→ Clinician reviews, accepts, rejects, comments on, or pins a highlight
→ auditable feedback makes a bounded adjustment to later similar suggestions
```

---

## 6. Functional Requirements

### 6.1 Shared Patient Workspace and Glance View

| ID | Requirement | Acceptance criteria | Priority |
|---|---|---|---|
| F-01 | Provide a shared patient workspace. | Workspace includes identity/care status, Glance View, care sections, Timeline, tasks, comments, and governance context. | Must |
| F-02 | Provide a rapid-consult Glance View. | Default view presents a small, role-relevant, actionable set readable within 10 seconds. | Must |
| F-03 | Surface applicable risks, pending actions, recent changes, allergies, and medications. | Every visible item has concise status, reason, and next-step meaning. | Must |
| F-04 | Explain why top items rank highly. | A card provides concise `risk_reason`; full score explanation is available on demand. | Must |
| F-05 | Support a no-action state. | When nothing meets the threshold, UI shows “No immediate actions requiring attention” and offers recent context. | Must |

### 6.2 Longitudinal Timeline and Data Model

| ID | Requirement | Acceptance criteria | Priority |
|---|---|---|---|
| F-06 | Provide a continuous, time-ordered patient Timeline. | Mixed entries display in chronological order across multiple dates. | Must |
| F-07 | Support human, patient, system, and AI-scribed entry types. | Demo includes Clinician, Staff, Patient, System event, and three AI-summary types. | Must |
| F-08 | Store minimum metadata per entry. | Entry records author role, author/system identity, timestamp, type, and provenance pointer when applicable. | Must |
| F-09 | Use a consistent care data model. | Design links clinics, users/members, patients, entries, sections, versions, comments, tasks, highlights, provenance, feedback, and audit logs. | Must |

### 6.3 Provenance, Trust, and Conflict Handling

| ID | Requirement | Acceptance criteria | Priority |
|---|---|---|---|
| F-10 | Link each highlight to its authoritative source. | Selecting a highlight navigates or scrolls to the exact allowed entry/span. | Must |
| F-11 | Distinguish human and AI entries. | AI entries show system authorship, AI type, provenance, and unconfirmed/review-required state. | Must |
| F-12 | Handle conflicting clinical context safely. | Clinician-authored judgement can become active; disagreement remains traceable and is not silently deleted. | Must |
| F-13 | Support human review of suggestions. | Clinician can accept, reject, pin, comment on, confirm, dismiss, or otherwise resolve a candidate within a small number of actions. | Must |

### 6.4 Collaboration, Revisions, and Audit

| ID | Requirement | Acceptance criteria | Priority |
|---|---|---|---|
| F-14 | Support comments with resolved/unresolved state. | Permitted users can add, view, resolve, and reopen comments. | Must |
| F-15 | Support optional mentions and assignments. | A comment can mention a valid clinic member; a task can be assigned to a valid clinic member. | Should |
| F-16 | Support protected care-note section editing. | Staff and Clinician can edit only permitted sections; server checks all writes. | Must |
| F-17 | Create revision history. | Each protected edit creates a new version and snapshot or deterministic diff. | Must |
| F-18 | Support safe revert. | Revert restores a prior state by creating a new version and preserving audit history. | Must |
| F-19 | Prevent silent concurrent overwrites. | Independent sections can update concurrently; stale same-section edits are rejected or deterministically resolved. | Must |
| F-20 | Maintain an audit log. | System records actor, action, target, timestamp, and permitted metadata. | Must |

### 6.5 Role-Based Access Control

| ID | Requirement | Acceptance criteria | Priority |
|---|---|---|---|
| F-21 | Provide Patient, Staff, Clinician, and Admin experiences. | Phase 1 may use visual role switching for demonstration; final decisions are server-enforced. | Must |
| F-22 | Enforce clinic-scoped access. | User cannot query or write a patient record outside the user’s clinic. | Must |
| F-23 | Protect internal content from Patient API/UI. | Responses omit internal comments, clinician/staff internal notes, and raw AI notes. | Must |
| F-24 | Protect role-owned content. | Staff cannot overwrite clinician sections; Clinician cannot overwrite protected staff-originated notes. | Must |

### 6.6 AI Scribe, Importance, and Feedback

| ID | Requirement | Acceptance criteria | Priority |
|---|---|---|---|
| F-25 | Support three AI-scribed summary types. | Doctor–patient, nurse–patient, and AI–patient summaries appear as separate system entries. | Must |
| F-26 | Preserve AI provenance. | Each AI summary stores a resolvable source/session identifier. | Must |
| F-27 | Implement explainable importance logic. | Ranking combines clinical attention, role-specific urgency, and bounded feedback adjustment. | Must |
| F-28 | Implement adaptive feedback ranking. | Pin/accept/reject/edit/comment creates an auditable, clinic-scoped feedback signal for similar future suggestions. | Bonus |
| F-29 | Redact supported PHI patterns before AI processing. | Names, IC/ID numbers, and phone patterns are masked on the server before a model request. | Must |
| F-30 | Require human review of AI output. | AI content stays visibly unconfirmed and cannot silently become a formal clinician conclusion. | Must |

### 6.7 Optional Bonus Capabilities

| ID | Requirement | Acceptance criteria | Priority |
|---|---|---|---|
| F-31 | Define hybrid storage/data-decay policy. | Older low-value records can be summarised or moved to history without breaking provenance. | Bonus |
| F-32 | Enable patient voice capture. | Synthetic patient audio can be captured through mobile/PWA and redacted before transcription/AI use. | Bonus |
| F-33 | Enable clinical/staff voice capture. | Recording produces speaker-labelled, timestamped transcript, summary, confidence metadata, and source segments. | Bonus |
| F-34 | Handle noisy/multilingual voice scenarios. | Design documents diarisation, overlap, terminology, code-switching, noisy environments, or multi-device handling. | Bonus |

---

## 7. Risk Candidates, Authority, and Display Priority

### 7.1 Permitted Candidate Sources

A risk or action candidate can originate from a Clinician manual entry, Staff manual entry, Patient update, AI summary, task/system event, or an entity tag such as allergy, medication, symptom, or vital sign. Candidate creation is not equivalent to clinical confirmation.

| Source | May create candidate? | May confirm/downgrade/exclude clinical risk? | Required treatment |
|---|---:|---:|---|
| Clinician entry | Yes | Yes | Human-authored clinical signal; preserve provenance. |
| Staff entry | Yes | No | Can trigger escalation or operational action. |
| Patient update | Yes | No | Patient-reported context; must not become a diagnosis automatically. |
| AI summary | Yes | No | System-labelled and human-reviewable. |
| Task/system event | Yes | No | Operational signal, not clinical judgement. |
| Entity label | Yes | No | Explainable rule signal only. |

Only an authorised **Clinician** may confirm, lower, dismiss, or formally resolve a clinical-risk classification. Every decision must retain source provenance and create an audit event.

### 7.2 Explainable Priority Model

The server must first enforce role and clinic visibility, then calculate display priority:

```text
Display Priority by actor
= Clinical Attention Score (0–70)
+ Role-Specific Action Urgency (0–30)
+ Bounded Feedback Adjustment (−10 to +10)
```

#### Clinical Attention Score (0–70)

| Component | Rule | Maximum contribution |
|---|---|---:|
| Confirmed severity | Critical / High / Medium / Low = +45 / +30 / +15 / +0. | 45 |
| Unconfirmed candidate | Suspicious but unconfirmed signal may contribute partial score only. | 20 |
| Recency | Less than 24h / 1–7d / 8–30d = +15 / +8 / +3. | 15 |
| Clinical entity | Allergy/medication +10; new symptom +8; vital +5. | 10 total |
| Conflict/review | Conflict or required review adds attention. | 5 |

#### Role-Specific Action Urgency (0–30)

| Role | Urgency rule | Points |
|---|---|---:|
| Staff | Task assigned to the current user and overdue. | 30 |
| Staff | Task assigned to the current role and due today. | 22 |
| Staff | Unassigned operational task due today. | 15 |
| Staff | Awaiting Clinician response to a Staff escalation. | 10 |
| Staff | Clinician-only item with no Staff action. | 0–3 |
| Clinician | High-risk unconfirmed candidate awaiting clinical review. | 30 |
| Clinician | Conflict involving planned medication, allergy, or symptom. | 25 |
| Clinician | Clinical decision due today. | 18 |
| Clinician | Staff escalation awaiting clinical reply. | 12 |
| Clinician | Routine Staff execution work. | 0–5 |
| Patient | Internal urgency scores are not exposed. | N/A |

#### Feedback Adjustment (−10 to +10)

| Feedback action | Adjustment | Guardrail |
|---|---:|---|
| Pin | +8 | Audited, clinic-scoped, bounded. |
| Accept | +5 | Does not change source facts. |
| Comment or edit | +2 | Weak contextual signal only. |
| Reject | −5 | Does not suppress explicit Critical evidence. |

Feedback must never lower a configured Critical item beneath its safety floor, modify source facts, cross clinic boundaries, or operate without auditability. It may influence only a bounded adaptive component of later similar suggestions.

---

## 8. Glance View Cognitive-Load and Information-Budget Specification

### 8.1 Intent

The Glance View is a **decision-entry surface**, not a compressed copy of the patient record. It must help an authorised user understand the top current action, why it matters, and where the evidence comes from. The Timeline remains the complete evidence and history layer.

> **Design principle:** Glance View answers “What should I do now?” Timeline answers “What is the full evidence and history?”

### 8.2 Default Information Budget

| Constraint | Product rule | Reason |
|---|---|---|
| Default action cards | Show no more than **three** cards in total. | More cards recreate the information overload the feature is meant to reduce. |
| Primary action | Reserve one visually dominant card for the highest role-relevant action. | User should not compare a large number of equally prominent choices. |
| Secondary actions | Show at most two smaller high-value cards. | Retains context without crowding out the primary decision. |
| Additional candidates | Show a compact `+ N additional prioritised items` route instead of expanding cards. | All context remains accessible through progressive disclosure. |
| Critical escalation | One Critical safety banner may appear above the three-card budget only for a configured synthetic Critical condition. | Critical status must not be hidden, but must not become a fourth verbose card. |
| No-action state | Show a calm no-action message plus link to recent context. | Avoids filling the page with low-value history. |

The server ranks only role-visible candidates. The UI shows the top candidates that cross a configurable display threshold, plus any hard-floor Critical item.

```text
1. Enforce role and clinic scope on the server.
2. Aggregate related signals into one traceable candidate.
3. Calculate role-aware display priority.
4. Include hard-floor Critical/high-risk review item when applicable.
5. Display one Primary Action and up to two Secondary Actions.
6. Route all remaining candidates to “View prioritised context”.
```

### 8.3 Card Content Budget

Every visible card represents **one primary decision or action**, even when several sources support it.

| Card element | Requirement | Limit |
|---|---|---|
| Title | Describe one issue/action in plain English. | Maximum two visual lines. |
| Why shown | State one concise, evidence-based reason. | Maximum two visual lines. |
| Primary action | Use one role-authorised verb: Review, Call, Confirm, Assign, or Open source. | Exactly one prominent action. |
| Ownership/due state | Show only when it changes what the user should do. | One compact metadata line. |
| Source | Show entry type and relative time; resolve to permitted exact source. | One compact metadata line. |
| Status | Compact High/Critical, AI-generated, review-required, overdue, or resolved chips. | At most three chips. |
| Score details | Show Clinical Attention, Role Urgency, and Feedback explanation only on request. | No raw dense scoring table on default card. |

**Standard card anatomy:**

```text
[Status chip] [Role / urgency chip]
Title: one actionable issue
Why shown: one concise evidence-based reason
Primary action: one action button or source route
Source: entry type · relative time · optional owner/due state
```

Default cards must not include long AI summaries, complete audit trails, long entity lists, or multiple competing action buttons.

### 8.4 Progressive Disclosure

| Layer | Default content | Route to next layer |
|---|---|---|
| **1 — Glance View** | At most three action cards plus compact additional-item count. | Select card or `View prioritised context`. |
| **2 — Card detail** | Rank explanation, confirmation state, linked task, related sources, feedback contribution. | Select source/task/details. |
| **3 — Timeline evidence** | Full permitted human/AI entry, source metadata, comments, and related context. | Open version/provenance/history. |
| **4 — History and audit** | Snapshots, diffs, reverts, and audit events. | Inspect individual change. |

### 8.5 Related-Signal Aggregation

Near-duplicate records about the same unresolved issue should become one traceable card, grouped by patient, active topic/entity, temporal window, and unresolved action state.

```text
Medication adherence concern
Two missed doses, dizziness, and a blood-pressure follow-up due today.
3 linked sources · 1 open task
```

Aggregation must preserve all provenance links. If sources disagree, the item is marked as a review/conflict candidate and routes the user to separate source records; it must not silently merge contradictory clinical facts.

---

## 9. Role-Specific Glance View Card Templates

The server creates role-permitted card data. The frontend must not receive restricted raw source content only to hide it visually.

### 9.1 Shared Card Contract

| Field | Requirement | Default visibility |
|---|---|---|
| `cardType` | Identifies a template such as `clinical_review`, `staff_task`, `patient_instruction`, or `admin_exception`. | Role-visible only. |
| `title` | One plain-English, single-issue title. | Maximum two visual lines. |
| `whyShown` | One reason explaining rank. | Maximum two visual lines. |
| `primaryAction` | One authorised action and destination. | Exactly one prominent action. |
| `statusChips` | High, Overdue, AI-generated, Review required, Resolved, etc. | At most three chips. |
| `sourceSummary` | Entry type plus relative time; excludes restricted raw text. | Required unless system-only exception. |
| `provenancePointer` | Authorised target for exact source entry/span. | Required for source-derived cards. |
| `ownerAndDue` | Owner/deadline when it changes action. | Optional compact line. |
| `scoreExplanation` | Clinical attention, role action, feedback components. | Hidden behind `Why is this shown?`. |

### 9.2 Clinician Cards

#### A. Primary Clinical Review

**Use when:** Critical/High condition, high-risk unconfirmed medication/allergy/symptom candidate, or clinical-fact conflict needs clinician judgement.

```text
[HIGH] [REVIEW REQUIRED] [AI-GENERATED]
Possible medication reaction requires verification
New rash after acetaminophen reported 2h ago; clinician confirmation is pending.
Action: Review source and update care plan
Source: AI-patient session · 2h ago
```

| Element | Template rule |
|---|---|
| Primary action | `Review source`, `Confirm / dismiss`, or `Update care plan`. |
| Required evidence | Source type/time, confirmation state, and linked open task when present. |
| Rank emphasis | Clinical Attention dominates; clinician-owned decision urgency may add up to 30 points. |
| Hard floor | Critical items and High medication/allergy review candidates with active clinician task remain in this lane. |
| Access | Full source opens only after Clinician + clinic scope validation. |

#### B. Today’s Clinical Decision

**Use when:** A clinician-owned approval, escalation, or response is due today but is not the highest-severity risk.

```text
[DUE TODAY] [CLINICIAN ACTION]
Review follow-up escalation from nursing team
Staff recorded recurrent dizziness and requested a plan decision.
Action: Open escalation
Source: Staff follow-up note · 4h ago · Awaiting clinician response
```

#### C. Team Follow-Up Awareness

**Use when:** Staff-owned task is operationally important but does not require immediate Clinician decision.

```text
[STAFF OWNED] [DUE TODAY]
Blood-pressure follow-up is scheduled today
Assigned to Jordan Lee; no clinician decision is currently required.
Action: View task context
Source: Follow-up task · due today
```

This card must not outrank a clinical-review card solely because a Staff task is overdue.

### 9.3 Staff Cards

#### A. Primary “My Action Today”

**Use when:** The current Staff user owns an overdue or same-day operational task.

```text
[OVERDUE] [ASSIGNED TO YOU]
Call patient to collect symptom details
A medication-reaction follow-up remains open; record the patient’s updated symptoms.
Action: Start follow-up
Source: Follow-up task · overdue by 1 day
```

| Element | Template rule |
|---|---|
| Primary action | `Start follow-up`, `Record measurement`, `Send patient instruction`, or `Complete task`. |
| Rank emphasis | Assignment relevance and due state dominate; an overdue task assigned to the current user receives maximum Staff urgency. |
| Clinical boundary | May say “clinician review pending”; cannot disclose clinician-only reasoning or raw AI content. |
| Completion | Completion removes it from default Glance View and creates an audit event. |

#### B. Awaiting Clinician Response

**Use when:** Staff escalation/mention requires a Clinician decision to close the loop.

```text
[AWAITING CLINICIAN] [MENTIONED]
Escalation awaiting review from Dr. Smith
Your follow-up note reported recurrent dizziness; a clinical decision is pending.
Action: View escalation thread
Source: Internal comment · 3h ago
```

This is meaningful but ranks below an overdue Staff-owned operational task.

#### C. Read-Only Clinical Awareness

**Use when:** Permitted care context helps Staff work but is not a Staff clinical decision.

```text
[CLINICAL AWARENESS]
Medication review remains pending
A clinician is reviewing a possible adverse reaction. Collect symptom details only; do not change the care plan.
Action: Open permitted context
Source: Care-plan status · updated 2h ago
```

This normally occupies a secondary slot and must not imply Staff authority to change the plan.

### 9.4 Patient Cards

#### A. Your Next Step

**Use when:** Clinician-approved, patient-visible instruction or patient-owned follow-up is due.

```text
[YOUR NEXT STEP] [DUE TODAY]
Please complete your blood-pressure check
Measure your blood pressure today and submit the reading through the clinic app.
Action: View instructions
Source: Patient-facing instruction · issued today
```

| Element | Template rule |
|---|---|
| Primary action | `View instructions`, `Complete check`, or `Send update`. |
| Allowed content | Plain language, approved instructions, due state, and patient-facing source. |
| Excluded content | Internal risk labels, internal comments, clinician-only reasoning, raw AI summary, and other users’ information. |
| Rank explanation | Internal Clinical Attention Score is not disclosed. |

#### B. Your Update Is Needed

**Use when:** Care team requests a patient-visible answer or check-in.

```text
[UPDATE REQUESTED]
Tell us whether your rash has changed
The clinic has asked for a short update before your next review.
Action: Send update
Source: Patient instruction · 1 day ago
```

Patient cards must use non-diagnostic, non-alarming language. Any synthetic urgent scenario must show only a clinician-approved patient instruction and a clear contact route.

### 9.5 Admin Cards

#### A. Clinic Workflow Exception

**Use when:** Clinic-scoped overdue/unassigned task or workflow issue needs oversight.

```text
[CLINIC OVERSIGHT] [OVERDUE]
Two high-priority follow-up tasks remain unassigned
Both tasks are within the current clinic and require ownership review.
Action: Review task queue
Source: Workflow monitor · updated 10m ago
```

#### B. Governance / Audit Exception

**Use when:** Repeated AI rejections or conflict awaiting review needs investigation.

```text
[GOVERNANCE REVIEW]
Repeated AI allergy suggestions were rejected
Three similar suggestions were rejected this week; review the topic rule and feedback signal.
Action: Open audit context
Source: Importance feedback audit · updated today
```

| Element | Template rule |
|---|---|
| Primary action | `Review task queue`, `Open audit context`, or `Inspect visibility rule`. |
| Scope | Current clinic only; no global cross-clinic data. |
| Rank emphasis | Governance exception, unresolved workflow risk, and time sensitivity. |
| Clinical boundary | Oversight never substitutes for clinical judgement. |

### 9.6 Default Slot Allocation

| Role | Primary slot | Secondary 1 | Secondary 2 | Overflow route |
|---|---|---|---|---|
| Clinician | Clinical Review. | Today’s Clinical Decision. | Team Follow-Up Awareness. | Prioritised clinical context. |
| Staff | My Action Today. | Awaiting Clinician Response. | Permitted Clinical Awareness. | My task queue/permitted context. |
| Patient | Your Next Step. | Patient-visible instruction/update. | Optional none. | Patient-facing timeline/instructions. |
| Admin | Clinic Workflow Exception. | Governance/Audit Exception. | Scoped operational exception. | Clinic oversight queue. |

A card occupies a slot only when it is role-visible, passes the display threshold, and has one clear next action. The system must not create filler cards simply to fill the layout.

### 9.7 Glance View Acceptance Criteria

- [ ] Default Glance View shows no more than three action cards, excluding one configured Critical banner.
- [ ] Every card has one primary action, concise reason, and resolvable permitted source link.
- [ ] User can identify top action, responsible role, and source in 10 seconds.
- [ ] Lower-priority candidates are reachable through prioritised context rather than expanded by default.
- [ ] Related signals are aggregated into one traceable card; disagreement is labelled for review, not silently merged.
- [ ] Long AI summaries, raw score tables, complete audit history, and unrestricted source text are excluded from default cards.
- [ ] Clinician, Staff, Patient, and Admin templates honour their distinct authority and visibility boundaries.

---

## 10. Non-Functional Requirements and Constraints

| ID | Requirement | Product decision |
|---|---|---|
| NFR-01 | Synthetic data only. | Use invented patients, identifiers, notes, and conversations; never real patient data. |
| NFR-02 | Redact before AI/model processing. | Supported PHI patterns are masked server-side before any model request. |
| NFR-03 | Server-side RBAC. | Every protected API read/write checks authenticated role, clinic scope, and ownership. |
| NFR-04 | Warm-path latency target. | Target P95 Glance View load of ≤300 ms; document local measurement/approximation and do not claim unmeasured production performance. |
| NFR-05 | Production security boundary. | Document TLS/encryption-at-rest for production; label Docker setup development-only. |
| NFR-06 | Clean logs. | Avoid raw PHI and secrets in logs. |
| NFR-07 | Explainable scope. | Clearly document what is implemented, mocked, measured, and deferred within the 72-hour build. |

---

## 11. Required Automated Validation

| Test area | Required proof |
|---|---|
| RBAC and clinic scope | Staff and Clinician cannot write as each other; Patient cannot access internal comments or raw AI notes; cross-clinic requests fail. |
| Revisions | Edit increments version; revert restores earlier state through a new version; audit metadata exists. |
| Highlight provenance | Generated highlight resolves to valid Timeline entry/span and source pointer. |
| Concurrent edits | Different sections do not overwrite each other; same-section conflict has deterministic behaviour. |
| Adaptive importance | Simulated feedback changes only bounded priority for later similar suggestion and remains clinic-scoped. |
| Glance View information budget | Default role views respect three-card limit, card contract, aggregation, and 10-second decision criteria. |

---

## 12. Four-Phase Delivery Roadmap

The following four phases are the planned build sequence. They are separate from the three user flows in Section 5. The user flows describe how the product is used; the phases describe the order in which it is built and verified.

### Phase 1 — English Product Experience and Evidence Flow

**Purpose:** Build a clear, fully English, desktop-first demonstration of the core product story before infrastructure complexity.

| Build | Explicitly defer |
|---|---|
| React + TypeScript workspace with synthetic English data. | Login and production authentication. |
| Visual role switcher for demo-only experience. | Server-side RBAC enforcement. |
| Glance View using the three-card budget/templates. | Database persistence and migrations. |
| Longitudinal Timeline with Clinician, Staff, Patient, System, and AI entries. | Real LLM calls, voice capture, and PWA. |
| Click-to-source navigation, basic visibility states, and explainable static ranking. | Persistent version/revert/concurrency and data decay. |

**Done when:** Reviewer can open the English prototype, identify the patient story/action in 10 seconds, open exact source evidence, and see clear distinction between human and unconfirmed AI content.

### Phase 2 — Trusted Collaboration and Persistent Data

**Purpose:** Convert validated front-end flow into a persistent collaboration application.

| Build | Acceptance proof |
|---|---|
| TypeScript Node.js/Express API. | Frontend reads/writes through API, not mutable local state. |
| MySQL in Docker and Drizzle schema/migrations. | Synthetic data persists after refresh. |
| Server-side RBAC and clinic scope checks. | Tests reject unauthorised role/cross-clinic behaviour. |
| Comments, mentions, tasks, assignments. | Demo shows Staff-to-Clinician coordination loop. |
| Protected sections, revision/diff/revert/audit. | Demo/tests prove version increment, audit event, and safe revert. |
| Base-version concurrency strategy. | Stale same-section write is rejected or deterministically resolved. |

**Done when:** Persistent synthetic collaboration works; authorisation is server-enforced; version/audit behaviour is visible and tested.

### Phase 3 — Governed AI, Quality, and Submission

**Purpose:** Add governed AI only after trust foundations work, then produce challenge evidence.

| Build | Acceptance proof |
|---|---|
| Server-side PHI-pattern redaction. | Tests/log inspection demonstrate name, phone, and IC/ID patterns masked before request. |
| Three AI summary workflows. | System entries retain type, provenance, and unconfirmed state. |
| Human feedback actions. | UI creates auditable pin/accept/reject/comment feedback. |
| Adaptive ranking. | Simulated feedback shifts later similar candidate within bounded limits. |
| Required tests and local latency measurement. | `pnpm test` / `pnpm check` plus documented P95 method. |
| README, technical brief, attribution, demo video. | Reviewer can reproduce/inspect design choices and trade-offs. |

**Done when:** AI assistance is demonstrably governed, never presented as autonomous clinical judgement, and required submission evidence is ready.

### Phase 4 — Intelligent Trust, Scale, and Conflict Optimisation

**Purpose:** Optimise a stable core build; do not delay Must requirements from earlier phases.

| Optimisation theme | Outcome |
|---|---|
| Adaptive feedback ranking | Immutable clinician feedback creates bounded, explainable, clinic-scoped topic/entity adjustment. |
| Hot/Warm/Cold data policy | Recent/high-risk/unresolved/pinned/conflict/provenance-targeted records stay Hot; older low-activity records may be summarised or archived while original evidence stays recoverable. |
| Deterministic conflict assistance | Separate-section edits persist independently; non-overlapping fields/spans may merge predictably; clinical factual conflicts require authorised human review. |

**Phase 4 data-decay guardrails:** Original evidence is never silently deleted; every provenance pointer keeps resolving; compression/archive/restore creates audit metadata; no active high-risk, unresolved, pinned, conflict, or active-source item can leave the active evidence path.

**Phase 4 conflict rules:** Same value is idempotent; different non-clinical text receives a three-way merge proposal; clinician vs AI/patient disagreement preserves both sources while clinician judgement becomes active plan; two clinician judgements require authorised human review.

---

## 13. Delivery Requirements

Final submission should include a working repository, test instructions, automated tests, clear commit history, updated README, 2–3 page technical brief, `ATTRIBUTION.txt`, and demo video.

The technical brief should include an architecture diagram, schema explanation, assumptions, first-principles reasoning, constraints, and scope trade-offs. The demo must prove: (1) Glance View to AI/source navigation, (2) collaborative comment/edit/version/revert, and (3) longitudinal context plus explainable ranking across dates.

---

## 14. Recommended Honest Git Commit Boundaries

These are future functional boundaries. A commit should exist only after the stated scope is implemented, reviewed, and runnable/testable. Do not fabricate a historical development sequence for generated work.

| Order | Commit scope | Example message |
|---:|---|---|
| 1 | PRD, architecture, roadmap, README outline, `.gitignore`. | `docs: define product scope and delivery roadmap` |
| 2 | React/Vite base and English synthetic patient data. | `feat: initialize English patient workspace` |
| 3 | Glance View, Timeline, source jump, role-demo visibility. | `feat: add explainable patient timeline experience` |
| 4 | API, database schema, and server RBAC. | `feat: add persistent clinic-scoped care records` |
| 5 | Comments, tasks, versions, audit, conflict handling. | `feat: add auditable collaboration workflows` |
| 6 | Governed AI summaries and feedback ranking. | `feat: add traceable AI assistance and importance feedback` |
| 7 | Tests, README, technical brief, attribution, demo preparation. | `test: validate care-note trust and access rules` |

> Never commit `.env`, `node_modules`, Docker volumes, real patient information, passwords, API keys, or unreviewed generated artefacts.

---

## 15. Scope Decision

This roadmap prioritises **clarity, trust, and evidence over feature volume**. A small English prototype that convincingly demonstrates source traceability, role-aware collaboration, safe AI assistance, and the three-card Glance View is more valuable than a broad interface containing unfinished modules.

Voice capture, adaptive ranking, hybrid storage, and advanced conflict assistance are valuable extensions only after the mandatory collaboration, provenance, security, and testing flows work with synthetic data.
