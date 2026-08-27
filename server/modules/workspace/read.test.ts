import { describe, expect, it } from "vitest";
import { ClinicScopeError } from "../../authz/clinicScope";
import { readAuthorizedWorkspace } from "./read";
import type { WorkspaceReader } from "./types";

const at = new Date("2026-02-18T09:30:00.000Z");
function createReader(membershipRole: "Clinician" | "Staff" | "Patient" | "Admin", patientUserId = 3): WorkspaceReader {
  return {
    async getMembership(userId, clinicId) { return clinicId === 1 ? { clinicId, userId, role: membershipRole } : undefined; },
    async getPatient(patientId, clinicId) { return patientId === 11 && clinicId === 1 ? { id: 11, clinicId: 1, patientUserId } : undefined; },
    async listEntries(clinicId, patientId) { return [
      { id: 101, clinicId, patientId, authorRole: "Staff", entryType: "staff", visibility: "clinic", reviewState: "not_required", content: "Internal staff handover.", occurredAt: at },
      { id: 102, clinicId, patientId, authorRole: "Clinician", entryType: "clinician", visibility: "patient", reviewState: "approved", content: "Shared next step.", occurredAt: at },
    ]; },
    async listTasks(clinicId, patientId) { return [{ id: 201, clinicId, patientId, title: "Call patient", status: "open", dueAt: at }]; },
  };
}
describe("authorised workspace read", () => {
  it.each(["Clinician", "Staff"] as const)("returns same-clinic workspace records to %s", async (role) => {
    const result = await readAuthorizedWorkspace(createReader(role), 2, { clinicId: 1, patientId: 11 });
    expect(result.entries).toHaveLength(2); expect(result.tasks).toHaveLength(1);
  });
  it("denies a requested patient outside the actor clinic", async () => {
    await expect(readAuthorizedWorkspace(createReader("Clinician"), 2, { clinicId: 2, patientId: 11 })).rejects.toBeInstanceOf(ClinicScopeError);
  });
  it("returns only patient-visible entries and no internal tasks to a linked patient", async () => {
    const result = await readAuthorizedWorkspace(createReader("Patient"), 3, { clinicId: 1, patientId: 11 });
    expect(result.entries.map((entry) => entry.id)).toEqual([102]); expect(result.tasks).toEqual([]);
  });
  it("denies a patient actor trying to read a different patient record", async () => {
    await expect(readAuthorizedWorkspace(createReader("Patient", 99), 3, { clinicId: 1, patientId: 11 })).rejects.toThrow("linked to their account");
  });
});
