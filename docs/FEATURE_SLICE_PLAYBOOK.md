# Nightingale — Minimal Component & Feature Slice Playbook

## Purpose

This is the implementation checklist for Nightingale English. It deliberately avoids a one-shot "build the whole system" prompt. Each numbered item is a **smallest demonstrable slice**: one role, one user outcome, one input, one processing rule, one visible output, and a small test boundary.

> A slice is not finished because code exists. It is finished only when its stated browser result works, its focused tests pass, its changed files are reviewed, and the user confirms that it can receive one truthful Git commit.

## How to request a slice

Use this exact request pattern when asking the development assistant to continue:

```text
Implement P2-S03 only.
Role: Staff.
Outcome: The signed-in Staff user completes one assigned task.
Do not build: comments, mentions, clinician review, care-plan editing, AI, or other role flows.
Before changing code: list the files you expect to change.
After changing code: show the browser check, the terminal test, and the proposed commit message.
```

The user should then test the listed behaviour in the browser and terminal. Only after confirming the result should the change be committed and pushed.

## Rules for every slice

| Rule | Required behaviour |
|---|---|
| Scope limit | Change only the files needed for one named outcome. Do not reorganise unrelated folders or add speculative features. |
| Security boundary | Browser filtering is never treated as authorization. Any permission claim in Phase 2+ must be repeated on the server. |
| Synthetic data | Use only the committed synthetic fixtures. Never insert or request real patient information. |
| Tests | Add or update focused Vitest tests for the new rule. Browser clicking complements but does not replace a test. |
| Verification | State exactly what the user should type, click, enter, and observe. |
| Commit integrity | One verified slice receives one meaningful commit. Never create artificial intermediate history. |
| Public GitHub | Before any push, confirm the exact files and remember that the repository is public. Do not include `.env`, keys, logs, build output, or private data. |

## Status legend

| Mark | Meaning |
|---|---|
| `DONE` | Built, verified, and already available in the Phase 1 prototype. |
| `PARTIAL` | A data/model foundation exists in the development workspace, but no complete user-visible loop has been accepted yet. |
| `NEXT` | The recommended next smallest slice. |
| `LATER` | Intentionally deferred until the prerequisite phases are complete. |

---

# Phase 1 — English role-scoped demonstration

These slices are already present in the Phase 1 workspace. They remain **presentation/demo features** until Phase 2 repeats access checks on the server.

| ID | Role | Component / feature slice | Input → processing → output | Browser verification | Status |
|---|---|---|---|---|---|
| P1-S01 | All | `BrandMark` | No user input → render the Nightingale signal with CSS fallback → consistent app identity. | Open the login page; the mark and wordmark are visible. | DONE |
| P1-S02 | All | `DemoLogin` role choice | Click one role → hold one active demo role in browser state → one role-specific workspace becomes available. | Select Clinician/Staff/Patient/Admin, then click `Enter … workspace`. | DONE |
| P1-S03 | All | Time-aware welcome copy | Browser local hour → `Good morning` / `Good afternoon` / `Good evening` → greeting appears in welcome panel. | Open the login page; observe the greeting for the device-local time. | DONE |
| P1-S04 | Clinician / Staff / Patient / Admin | `GlanceCard` information budget | Role filter → at most one primary and two secondary cards → concise reason, action, severity label, source cue. | Enter any role and count cards in Glance View; inspect label and action. | DONE |
| P1-S05 | Clinician / Staff | Source jump | Click a Glance card → find its permitted Timeline source → focus/highlight the matching entry. | Enter Clinician or Staff, click a Glance card, and confirm Timeline focus changes. | DONE |
| P1-S06 | All | Role presentation selector | Active demo role → filter navigation, cards, Timeline, and tasks → other-role work is not rendered. | Sign out; enter each role separately; compare visible navigation and content. | DONE |
| P1-S07 | All | Header identity and demo sign-out | Click top-right current identity → clear demo role state → return to login. | Enter a workspace; use the top-right sign-out control. | DONE |

---

# Phase 2 — Persistent, clinic-scoped collaboration

## Foundation before role actions

Phase 2 starts with data that every role needs. The Foundation is deliberately divided into small pieces so no one needs to understand the whole schema at once.

| ID | Role | Component / feature slice | Input → processing → output | Smallest expected file set | Terminal / browser verification | Suggested commit | Status |
|---|---|---|---|---|---|---|---|
| P2-F01 | All | Clinic role vocabulary | A role name → pure capability lookup → allow/deny result, without UI. | `shared/domain/roles.ts`, `roles.test.ts` | Run `pnpm test`; Staff can update a task but cannot edit a care plan. | `feat(domain): define clinic role capabilities` | PARTIAL |
| P2-F02 | All | Database connection module | Runtime `DATABASE_URL` → server-only Drizzle connection → reusable `getDb()` and clean close. | `server/db.ts`, focused test or seed command | Run `pnpm db:seed`; it prints success and returns to the prompt. | `feat(data): add server database connection` | PARTIAL |
| P2-F03 | All | Clinic-scoped schema migration | Schema definition → reviewed migration → MySQL tables/foreign keys/indexes. | `drizzle/schema.ts`, `drizzle.config.ts`, migration file | Generate migration; inspect it for only `CREATE`/indexes/FKs; apply; query expected table names. | `feat(data): add clinic-scoped foundation schema` | PARTIAL |
| P2-F04 | All | Deterministic synthetic seed | Fixed synthetic actors + one clinic + one patient + entries/task/audit → idempotent seeded records. | `server/seedDemo.ts` | Run `pnpm db:seed` twice; second run must not create duplicates or hang. | `feat(data): seed synthetic clinic foundation` | PARTIAL |
| P2-F05 | All | Server workspace read path | Session-derived actor + clinic membership → query only allowed clinic/patient record → minimal JSON/tRPC response. | `server/routers/workspace.ts`, `server/db.ts`, `server/authz/*`, test | Call the endpoint as a fixture actor; expected allowed data arrives; wrong-clinic query returns `FORBIDDEN`. | `feat(api): add clinic-scoped workspace read` | NEXT |
| P2-F06 | All | Frontend persisted-workspace status | Successful server read → show `Connected to synthetic workspace` and one persisted record → no replacement of the whole UI yet. | `client/src/features/workspace/*`, one page import | Open the workspace; show a persisted timestamp/content; disconnect/error state is legible. | `feat(workspace): show persisted foundation record` | NEXT |

## Staff role slices

| ID | Role | Component / feature slice | Input → processing → output | Browser verification | Focused automated test | Suggested commit |
|---|---|---|---|---|---|---|
| P2-S01 | Staff | `AssignedTaskList` | Signed-in Staff → fetch own open tasks in own clinic → task list. | Enter Staff; see only Noor’s assigned synthetic task. | A different Staff user and a cross-clinic user receive no task. | `feat(staff): read assigned tasks` |
| P2-S02 | Staff | `TaskStatusButton` | Click `Start` / `Complete` → server validates assignee and role → status changes; audit row is written. | Click `Complete`; status becomes `Complete` without page confusion. | Wrong role / wrong assignee cannot update; one audit event is created. | `feat(staff): update assigned task status` |
| P2-S03 | Staff | `EscalationComposer` | Enter short synthetic escalation → server verifies Staff and clinic → create escalation/comment + audit. | Type a short escalation and submit; confirmation and pending state appear. | Empty text rejected; Staff outside clinic denied; audit target is correct. | `feat(staff): create clinician escalation` |
| P2-S04 | Staff | `EscalationSourceLink` | Click escalation source → query allowed Timeline record → focused source view. | From Staff escalation, open the linked source entry. | Patient receives no internal escalation source. | `feat(staff): link escalation to source entry` |

## Clinician role slices

| ID | Role | Component / feature slice | Input → processing → output | Browser verification | Focused automated test | Suggested commit |
|---|---|---|---|---|---|---|
| P2-C01 | Clinician | `ReviewQueue` | Clinician signs in → fetch clinic-scoped pending Staff escalations → review queue. | Enter Clinician; see pending escalation created in P2-S03. | Staff/Patient cannot call clinician queue. | `feat(clinician): read escalation review queue` |
| P2-C02 | Clinician | `ReviewEscalationAction` | Click `Review` → server validates Clinician → escalation marked reviewed + audit. | Click `Review`; state changes to reviewed with actor/time. | Staff cannot review; repeated review has deterministic result. | `feat(clinician): review staff escalation` |
| P2-C03 | Clinician | `CarePlanSection` read | Select one clinician-owned section → server returns current text and version number. | See one protected `Follow-up plan` section and its `Version 1`. | Patient/Staff cannot read clinician-only section. | `feat(care-plan): read clinician-owned section` |
| P2-C04 | Clinician | `CarePlanEditor` | Type changed text + submit `baseVersion` → server compares version → create Version 2 or conflict response. | Change one sentence; see saved Version 2. Use stale tab/fixture to see clear conflict state. | Valid edit creates version/audit; stale `baseVersion` returns conflict; Staff denied. | `feat(care-plan): add versioned clinician edit` |
| P2-C05 | Clinician | `VersionHistory` | Select a version → load prior snapshot → read-only historical view. | Click Version 1 and Version 2; content/time/actor change visibly. | Versions remain ordered and clinic-scoped. | `feat(care-plan): show section version history` |
| P2-C06 | Clinician | `RevertPlanVersion` | Confirm version to restore → server creates a new version using old content, not a destructive overwrite → audit. | Click `Restore Version 1`; see a new Version 3. | Audit identifies actor/source version; no old row is altered. | `feat(care-plan): restore prior section version` |

## Patient and Admin slices

| ID | Role | Component / feature slice | Input → processing → output | Browser verification | Focused automated test | Suggested commit |
|---|---|---|---|---|---|---|
| P2-P01 | Patient | `PatientNextStep` | Patient identity → server filters to own `visibility = patient` entries → approved next step only. | Enter Patient; view the approved synthetic next step. | Patient cannot request other patient ID or `clinic` visibility entries. | `feat(patient): show approved next steps` |
| P2-P02 | Patient | `PatientContextEmptyState` | No allowed internal content → server returns empty allowed result → calm explanatory UI. | Patient cannot see AI review, internal Staff escalation, or admin audit. | Response contains no internal entry type/content. | `feat(patient): protect internal care context` |
| P2-A01 | Admin | `GovernanceSummary` | Admin identity → clinic-scoped audit query → count/recent nonclinical governance items. | Enter Admin; see synthetic audit activity. | Admin in another clinic sees nothing; Admin has no care-plan write procedure. | `feat(admin): read clinic audit summary` |
| P2-A02 | Admin | `AuditEventDrawer` | Click audit row → load actor, action, target, timestamp, safe metadata → read-only detail. | Open one event; read its traceability context. | Audit query denies non-admin request and hides sensitive text. | `feat(admin): inspect audit event detail` |

---

# Phase 3 — Reviewable AI assistance

Do not start any external model slice until Phase 2 permission tests pass. Model input and all mappings stay server-side. An API key is required only when an actual external model call is added; it belongs in the runtime secret store or local `.env`, never in Git.

| ID | Role | Component / feature slice | Input → processing → output | Browser / terminal verification | Suggested commit | Status |
|---|---|---|---|---|---|---|
| P3-A01 | System | `RedactionService` | Synthetic source text → detect configured PHI-like patterns → redacted copy + redaction report. | Unit test known placeholder/redaction cases; original input remains unchanged. | `feat(ai): add server-side redaction service` | LATER |
| P3-A02 | System | `SummaryRequestBuilder` | Authorized, redacted synthetic entries → structured model prompt → request payload without identifier mapping. | Test payload contains allowed fields and no original identifier. | `feat(ai): prepare redacted summary request` | LATER |
| P3-A03 | System | `CreateAiSummary` | Approved request + server-side model call → system-authored `CareEntry` with `review_required` + provenance. | Trigger summary; view `AI summary — review required` and source link. | `feat(ai): store reviewable synthetic summary` | LATER |
| P3-C01 | Clinician | `AiReviewAction` | Accept / reject / edit a summary → update review state and audit → original AI source remains unchanged. | Clinician accepts or rejects one AI entry; UI changes state. | `feat(ai): add clinician summary review` | LATER |
| P3-C02 | Clinician | `HighlightFeedback` | Pin / accept / reject one AI highlight → bounded feedback record → explain score adjustment. | Click one feedback control and inspect explanation. | `feat(ai): record bounded highlight feedback` | LATER |
| P3-Q01 | System | `AiSafetyAndPerformanceChecks` | Fixtures and API response times → test suite + measured P95 statement → honest technical-brief evidence. | Run documented test/measurement script. | `test(ai): cover review and provenance boundaries` | LATER |

---

# Phase 4 — Controlled evolution after the core workflow is stable

Phase 4 is not required to make the Phase 1–3 demo credible. Each enhancement remains separately testable and must preserve the original source, RBAC, audit trail, and human authority.

| ID | Role | Component / feature slice | Input → processing → output | Essential guardrail | Suggested commit | Status |
|---|---|---|---|---|---|---|
| P4-R01 | Clinician / Staff | `FeedbackProjection` | Feedback event → bounded clinic-scoped adjustment → explainable card score. | Pin/accept/reject can never hide a Critical hard-floor item. | `feat(priority): project bounded feedback adjustment` | LATER |
| P4-D01 | System | `HistoryTierMarker` | Age/risk/resolution state → Hot/Warm/Cold classification → timeline filter marker. | Never delete or rewrite original provenance. | `feat(history): classify care history tiers` | LATER |
| P4-D02 | System | `ArchiveSummaryLink` | Cold record selection → summary pointer → timeline access to original source. | Original raw source stays retrievable under authorization. | `feat(history): link cold records to source-preserving summary` | LATER |
| P4-C01 | Clinician / Staff | `PresenceIndicator` | Open editor → non-sensitive presence event → “Noor is editing” indicator. | Presence is advisory only; it cannot replace version validation. | `feat(collab): show editor presence` | LATER |
| P4-C02 | Clinician / Staff | `ExpiringSoftLock` | Edit focus + heartbeat → expiring section lock → contextual warning. | Lock expires on disconnect; `baseVersion` remains the final conflict guard. | `feat(collab): add expiring section soft lock` | LATER |
| P4-P01 | System | `PlaceholderMapping` | Local NER/SLM identifies sensitive entities → `[PATIENT_NAME_1]` mapping → model-safe text. | The mapping never leaves protected server-side storage. | `feat(privacy): add protected placeholder mapping` | LATER |
| P4-Q01 | System | `PriorityProjection` | Entry/task/feedback event → idempotent recomputation → role-specific read projection. | Projection may be stale briefly but never becomes the source of truth. | `feat(priority): add role-scoped projection` | LATER |
| P4-Q02 | System | `ProjectionCache` | Valid projection → cache read → fast Glance response + fallback. | Add Redis only after a real measurement shows it is needed. | `feat(priority): cache glance projection` | LATER |
| P4-M01 | Clinician | `SemanticMergeProposal` | Allowed nonclinical text conflict → Base/Current/Proposed suggestion → clinician explicitly accepts a new version. | Never auto-save; never propose an automatic merge for medication, allergy, symptom, dose, diagnosis, or uncertain clinical facts. | `feat(care-plan): suggest nonclinical semantic merge` | LATER |

---

# Exact verification loop

For each requested slice, use the following loop. The command names are examples; the assistant must give the exact relevant command after the slice is built.

| Step | What the user does | What counts as success |
|---|---|---|
| 1. Read scope | Read the one-sentence user outcome and the file list before code changes. | The slice is small enough to explain in your own words. |
| 2. Start locally | In VS Code terminal: `pnpm dev`. | A `localhost` URL opens and the relevant page loads. |
| 3. Browser check | Perform exactly one named action: click, type, submit, or change a status. | The listed visible output appears. |
| 4. Test check | In another terminal: `pnpm test`. | The relevant focused test and existing tests pass. |
| 5. Type/build check | Run `pnpm check` and, before a larger checkpoint, `pnpm build`. | No TypeScript error; build completes. |
| 6. Review | Inspect `git status` and the changed file list. | Only files related to this slice changed; no `.env`, `node_modules`, `dist`, screenshots, or private data are staged. |
| 7. Commit and push | After user confirmation, use the stated commit message, then `git push`. | GitHub shows the commit, and a new machine can obtain it with `git pull`. |

## Default Git commands after a confirmed slice

Run these from the project root only after reviewing the file list. Replace the file names with the exact files from the slice; do not use a blind `git add .`.

```powershell
git status
git add path/to/file-one path/to/file-two
git status
git commit -m "feat(scope): describe the verified user outcome"
git push origin main
```

## Current recommended next request

The first true Phase 2 user-visible slice should be **P2-F05 — Server workspace read path**. It proves that clinic scope is checked before data is returned. It must remain small: one protected server read procedure, one fixture-backed authorized request, one denied cross-clinic request, one test file, and a small “connected/persisted record” status in the existing workspace. It must not add Staff mutations, comments, versions, AI, or Phase 4 work.
