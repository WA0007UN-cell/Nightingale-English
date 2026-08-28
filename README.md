# Nightingale English

> A traceable care-collaboration workspace prototype that turns scattered synthetic care context into one clear, role-specific next action.

Nightingale is a 72-hour build project using **synthetic data only**. It is a prototype for demonstrating information hierarchy, source traceability, and care-team collaboration; it is **not** a production medical system and does not provide clinical advice.

## Phase 1 status

The current implementation is a fully English, client-side demonstration of the patient workspace. It includes a role-entry screen, a three-card Glance View, role-specific actions and navigation, source-linked longitudinal Timeline entries, and a design log for tested bad cases.

| Included now | Explicitly deferred |
|---|---|
| Synthetic care context and English UI | Database persistence and server-enforced RBAC (Phase 2) |
| One selected demo role per workspace | External LLM calls and PHI redaction pipeline (Phase 3) |
| Card-to-source Timeline focus | Real-time presence, CQRS, and semantic merge proposals (Phase 4) |

## Run locally

```bash
pnpm install
pnpm dev
```

Then open the local address shown in the terminal.

## Validate

```bash
pnpm test
pnpm check
pnpm build
```

The current Vitest suite verifies role-owned cards, patient timeline exclusions, and role-owned task lists.

## Documentation

- [Product Requirements Document](docs/PRD.md)
- [Technical Architecture](docs/Technical%20Architecture%20%E2%80%94%20Nightingale%20English%20%20V2.md)
- [Delivery Roadmap](docs/Delivery%20Roadmap%20%E2%80%94%20Nightingale%20English.md)
- [Phase 1 Design Log](docs/DESIGN_LOG.md)

## Safety and data boundary

All patient names, events, notes, tasks, and AI-like summaries in this repository are synthetic. The Phase 1 role selector is a visual demonstration state only; it must not be treated as authorization. Phase 2 will enforce access on the server using authenticated users, clinic membership, and resource-level scope checks.
