import { describe, expect, it } from "vitest";
import { ClinicScopeError } from "../../authz/clinicScope";
import { createStaffEscalation, EscalationValidationError } from "./create";
import type { EscalationWriter, StaffEscalation } from "./types";

function createWriter(role: "Staff" | "Patient" = "Staff", sourceClinicId = 1): { writer: EscalationWriter; created: StaffEscalation[]; audits: Array<Record<string, unknown>> } {
  const created: StaffEscalation[] = [];
  const audits: Array<Record<string, unknown>> = [];
  const source = { id: 101, clinicId: sourceClinicId, patientId: 11, entryType: "staff" as const, authorRole: "Staff" as const, content: "Synthetic source note", occurredAt: new Date("2026-02-18T08:45:00.000Z") };
  return {
    created,
    audits,
    writer: {
      async getMembership(userId, clinicId) { return { userId, clinicId, role }; },
      async getPatient(patientId, clinicId) { return patientId === 11 ? { id: 11, clinicId, patientUserId: null } : undefined; },
      async getSourceEntry() { return source; },
      async listEscalations() { return created; },
      async listSourceEntries() { return [source]; },
      async createEscalation(input) {
        const escalation = { id: 202, clinicId: input.clinicId, patientId: input.patientId, sourceEntryId: input.sourceEntryId, authorRole: "Staff" as const, content: input.content, occurredAt: input.occurredAt };
        created.push(escalation);
        return escalation;
      },
      async appendAudit(input) { audits.push(input); },
    },
  };
}

describe("Staff escalation creation", () => {
  it("creates a trimmed clinic-only Staff escalation with an audit event", async () => {
    const { writer, created, audits } = createWriter();
    const escalation = await createStaffEscalation(writer, { actorUserId: 7, clinicId: 1, patientId: 11, sourceEntryId: 101, content: "  Synthetic escalation for clinician review.  " });
    expect(escalation.content).toBe("Synthetic escalation for clinician review.");
    expect(created).toHaveLength(1);
    expect(audits).toEqual([expect.objectContaining({ action: "staff_escalation_created", targetId: 202, metadata: expect.objectContaining({ sourceEntryId: 101, synthetic: true }) })]);
  });

  it("rejects empty escalation text before writing", async () => {
    const { writer, created, audits } = createWriter();
    await expect(createStaffEscalation(writer, { actorUserId: 7, clinicId: 1, patientId: 11, sourceEntryId: 101, content: "   " })).rejects.toBeInstanceOf(EscalationValidationError);
    expect(created).toEqual([]);
    expect(audits).toEqual([]);
  });

  it("rejects a Patient actor even when a matching source exists", async () => {
    const { writer, created } = createWriter("Patient");
    await expect(createStaffEscalation(writer, { actorUserId: 8, clinicId: 1, patientId: 11, sourceEntryId: 101, content: "Synthetic escalation" })).rejects.toBeInstanceOf(ClinicScopeError);
    expect(created).toEqual([]);
  });

  it("rejects a source entry from another clinic", async () => {
    const { writer, created } = createWriter("Staff", 2);
    await expect(createStaffEscalation(writer, { actorUserId: 7, clinicId: 1, patientId: 11, sourceEntryId: 101, content: "Synthetic escalation" })).rejects.toBeInstanceOf(ClinicScopeError);
    expect(created).toEqual([]);
  });
});
