# Nightingale English

> A traceable care-collaboration workspace prototype that turns synthetic care context into one clear, role-specific next action.

Nightingale is a TypeScript full-stack prototype using **synthetic data only**. It demonstrates role-based workspaces, source traceability, deterministic AI-scribed mock summaries, PHI redaction, care-plan versioning, and clinic-scoped governance. It is **not** a production medical system and does not provide clinical advice.

## Stack and local boundary

The project uses Node.js 18 or 20+, pnpm, React/TypeScript/Vite, Node.js/Express/tRPC, Drizzle ORM, local SQLite through `@libsql/client`, and Vitest. Local evaluation does not require Docker, MySQL, a cloud database, a paid LLM API, an API key, or an external account. The default database is the ignored local file `./data/nightingale.sqlite`.

## One-command evaluator setup

After cloning the repository, the evaluator only needs to run this one command from the repository root:

```bash
pnpm start:local
```

This script performs `pnpm install`, creates/applies the local SQLite migration, inserts the deterministic synthetic Foundation dataset, and starts the development server. The evaluator can then open the local URL printed by the server, normally `http://localhost:3000`.

To run the complete automated validation in a second terminal:

```bash
pnpm test
```

The equivalent explicit setup sequence is:

```bash
pnpm install
pnpm db:seed
pnpm dev
```

No `.env` file is required. An optional `.env` can set `SQLITE_DB_PATH=./data/nightingale.sqlite`; see `.env.example`.

## Database and seed

`pnpm db:seed` runs the checked-in SQLite migration through `server/migrate.ts`, automatically creates the `data` directory and database file, and inserts the synthetic Foundation records. It is idempotent and safe to run again. `pnpm db:migrate` applies any pending SQLite migrations, while `pnpm db:generate` generates a Drizzle SQLite migration after a schema change.

The repository does not use MySQL or `DATABASE_URL`. Existing data in a previous MySQL Docker container is not automatically imported; the evaluator environment is intentionally recreated from the deterministic synthetic seed.

## Where PHI redaction happens

PHI redaction is implemented in `server/modules/aiScribe/redact.ts` as a strict, deterministic, server-side rule pipeline. The AI Scribe ingestion flow in `server/modules/aiScribe/service.ts` calls this redaction utility **before** the deterministic mock/fixture summary is generated or persisted. The rules mask supported names, phone numbers, and IC/ID numbers. No external LLM is called, and the raw input is not sent to any paid or cloud AI service.

The redaction utility is covered by focused Vitest tests. Because it is intentionally regex/rule-based, it is a demonstration safeguard and not a substitute for a production privacy program, clinical review, or legal compliance assessment.

## How RBAC is enforced

RBAC is enforced on the server rather than trusted from frontend role selectors. `server/trpc.ts` provides `protectedProcedure`, which requires an authenticated session actor before protected procedures run. The server resolves the actor's clinic membership and role from the persisted SQLite records.

The authorization functions in `server/authz/clinicScope.ts` then enforce the resource boundary for each operation. Every protected read or mutation verifies the actor user ID, clinic ID, membership role, target patient/entry/task ownership, and any source-entry relationship required by the operation. A resource from another clinic or an invalid role/transition is rejected with a `403 Forbidden` error. Frontend visibility only controls presentation; it is not treated as authorization.

The integration and unit tests cover cross-clinic 403 isolation and the permission boundaries for Patient, Staff, Clinician, and Admin. Admin audit reads are clinic-scoped and return governance metadata only; raw clinical body text and PHI are omitted from the audit view.

## AI Scribe and provenance

AI Scribe supports three deterministic interaction types: `ai_doctor_consult_summary`, `ai_nurse_consult_summary`, and `ai_patient_session_summary`. Each entry is authored by `System`, starts as a draft requiring review, and receives a deterministic provenance pointer to its source session/entry. The frontend resolves that pointer without changing the server authorization boundary and can navigate to and highlight the corresponding Timeline source.

## Test and build commands

```bash
pnpm test
pnpm check
pnpm build
```

The Vitest suite covers clinic-scoped RBAC and 403 boundaries, PHI redaction, deterministic AI Scribe provenance, care-plan version updates and reverts, source navigation, role-owned cards and task lists, and idempotent SQLite seed execution. All tests use local fixtures or temporary SQLite files.

## Implemented slices

| Area | Status |
|---|---|
| Role-specific Glance View and Timeline provenance focus | Implemented |
| Server-enforced clinic scope and Phase 2 RBAC | Implemented |
| Admin governance audit metadata drawer | Implemented; raw clinical body/PHI is omitted |
| Deterministic AI Scribe ingestion for doctor, nurse, and patient summaries | Implemented |
| Rule-based PHI redaction before mock generation | Implemented |
| Care-plan optimistic versioning and append-only revert history | Implemented |
| External paid LLM calls | Not used |
| Real-time presence and semantic merge proposals | Deferred |

## Safety and data boundary

All patient names, events, notes, tasks, and AI-like summaries in this repository are synthetic. AI Scribe entries begin as drafts requiring review. The product is a prototype for evaluation and must not be used as a clinical system.

## Documentation

- [Product Requirements Document](docs/PRD.md)
- [Technical Architecture](docs/Technical%20Architecture%20%E2%80%94%20Nightingale%20English%20%20V2.md)
- [Delivery Roadmap](docs/Delivery%20Roadmap%20%E2%80%94%20Nightingale%20English.md)
- [Design Log](docs/DESIGN_LOG.md)
