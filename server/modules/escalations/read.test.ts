import { describe, expect, it } from "vitest";
import { ClinicScopeError } from "../../authz/clinicScope";
import { readStaffEscalationContext } from "./read";
import type { EscalationReader } from "./types";

function createReader(role: "Staff" | "Patient", patientClinicId = 1): EscalationReader {
  const source = { id: 101, clinicId: 1, patientId: 11, entryType: "staff" as const, authorRole: "Staff" as const, content: "Synthetic source note", occurredAt: new Date("2026-02-18T08:45:00.000Z") };
  return {
    async getMembership(userId, clinicId) { return { userId, clinicId, role }; },
    async getPatient(patientId) { return patientId === 11 ? { id: 11, clinicId: patientClinicId, patientUserId: null } : undefined; },
    async getSourceEntry() { return source; },
    async listEscalations() { return [{ id: 202, clinicId: 1, patientId: 11, sourceEntryId: 101, authorRole: "Staff" as const, content: "Synthetic escalation", occurredAt: new Date("2026-02-18T09:00:00.000Z") }]; },
    async listSourceEntries() { return [source]; },
  };
}

describe("Staff escalation context", () => {
  it("returns clinic-internal escalations with authorised source entries to Staff", async () => {
    const result = await readStaffEscalationContext(createReader("Staff"), 7, 1, 11);
    expect(result.escalations[0]).toMatchObject({ sourceEntryId: 101, authorRole: "Staff" });
    expect(result.sourceEntries[0]).toMatchObject({ id: 101, clinicId: 1 });
  });

  it("denies a Patient actor from internal escalation context", async () => {
    await expect(readStaffEscalationContext(createReader("Patient"), 8, 1, 11)).rejects.toBeInstanceOf(ClinicScopeError);
  });

  it("denies a cross-clinic patient scope", async () => {
    await expect(readStaffEscalationContext(createReader("Staff", 2), 7, 1, 11)).rejects.toBeInstanceOf(ClinicScopeError);
  });
});
