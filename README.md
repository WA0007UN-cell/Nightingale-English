# Nightingale English

> A traceable care-collaboration workspace prototype that turns synthetic care context into one clear, role-specific next action.

Nightingale is a TypeScript full-stack prototype using **synthetic data only**. It demonstrates role-based workspaces, source traceability, AI-scribed mock summaries, PHI redaction, care-plan versioning, and clinic-scoped governance. It is **not** a production medical system and does not provide clinical advice.

## Stack

- Node.js 18 or 20+ (Node.js 20 LTS is recommended)
- pnpm
- React + TypeScript + Vite
- Node.js + Express + tRPC
- Drizzle ORM with local SQLite via `@libsql/client`
- Vitest

No Docker, MySQL server, cloud database, paid LLM API, or external account is required for local evaluation.

## Run locally

From a fresh clone, run:

```bash
pnpm install
pnpm db:seed
pnpm dev
```

Then open the local URL shown in the terminal, normally `http://localhost:3000`.

`pnpm db:seed` automatically creates `data/nightingale.sqlite`, applies the checked-in SQLite migration, and inserts the deterministic synthetic Foundation dataset. To use another local database path, set `SQLITE_DB_PATH`.

## Validate

Run the complete test suite directly:

```bash
pnpm test
```

Additional checks:

```bash
pnpm check
pnpm build
```

The Vitest suite covers clinic-scoped RBAC and 403 boundaries, PHI redaction, deterministic AI Scribe provenance, care-plan version updates and reverts, source navigation, role-owned cards and task lists, and idempotent SQLite seed execution. All tests use local fixtures or temporary SQLite files; no external LLM or cloud database is contacted.

## Database commands

```bash
pnpm db:migrate   # Create/apply local SQLite migrations
pnpm db:seed      # Migrate and insert deterministic synthetic data
pnpm db:generate  # Generate a new Drizzle SQLite migration after schema changes
```

The default database file is `./data/nightingale.sqlite`. It is local runtime state and must not be committed.

## Implemented slices

| Area | Status |
|---|---|
| Role-specific Glance View and Timeline provenance focus | Implemented |
| Server-enforced clinic scope and Phase 2 RBAC | Implemented |
| Admin governance audit metadata drawer | Implemented; raw clinical body/PHI is omitted from the audit view |
| Deterministic AI Scribe ingestion for doctor, nurse, and patient summaries | Implemented |
| Rule-based PHI redaction before mock generation | Implemented |
| Care-plan optimistic versioning and append-only revert history | Implemented |
| External paid LLM calls | Not used |
| Real-time presence and semantic merge proposals | Deferred |

## Safety and data boundary

All patient names, events, notes, tasks, and AI-like summaries in this repository are synthetic. PHI redaction is a deterministic demonstration safeguard, not a substitute for a production privacy program, clinical review, or legal compliance assessment. AI Scribe entries begin as drafts requiring review and retain a deterministic pointer to their source entry.

## Documentation

- [Product Requirements Document](docs/PRD.md)
- [Technical Architecture](docs/Technical%20Architecture%20%E2%80%94%20Nightingale%20English%20%20V2.md)
- [Delivery Roadmap](docs/Delivery%20Roadmap%20%E2%80%94%20Nightingale%20English.md)
- [Design Log](docs/DESIGN_LOG.md)
