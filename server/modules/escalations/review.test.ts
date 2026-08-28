import { describe, expect, it } from "vitest";
import { ClinicScopeError } from "../../authz/clinicScope";
import { EscalationReviewConflictError, readClinicianReviewQueue, updateClinicianEscalationReview } from "./review";
import type { EscalationWriter, ReviewQueueEscalation } from "./types";

function createWriter(role: "Clinician" | "Staff" | "Patient" | "Admin" = "Clinician") {
  let escalation: ReviewQueueEscalation = {
    id: 81, clinicId: 1, patientId: 11, sourceEntryId: 31, authorRole: "Staff",
    reviewState: "review_required", content: "Synthetic pending escalation.", occurredAt: new Date("2026-02-18T10:15:00.000Z"),
  };
  const audits: Array<{ action: string; metadata: Record<string, unknown> }> = [];
  const writer: EscalationWriter = {
    async getMembership(userId, clinicId) { return { userId, clinicId, role }; },
    async getPatient() { return { id: 11, clinicId: 1, patientUserId: 3 }; },
    async getSourceEntry() { return { id: 31, clinicId: 1, patientId: 11, entryType: "staff", authorRole: "Staff", content: "source", occurredAt: new Date() }; },
    async listEscalations() { return []; }, async listSourceEntries() { return []; },
    async createEscalation() { throw new Error("not used"); },
    async appendAudit(input) { audits.push({ action: input.action, metadata: input.metadata }); },
    async listReviewQueue() { return escalation.reviewState === "resolved" ? [] : [escalation]; },
    async getReviewQueueEscalation(_clinicId, id) { return id === escalation.id ? escalation : undefined; },
    async updateReviewState(input) {
      if (input.currentState !== escalation.reviewState) return escalation;
      escalation = { ...escalation, reviewState: input.nextState };
      return escalation;
    },
  };
  return { writer, audits, getEscalation: () => escalation };
}

describe("Clinician escalation review", () => {
  it("returns only unresolved Staff escalation records to a Clinician", async () => {
    const { writer } = createWriter();
    await expect(readClinicianReviewQueue(writer, 7, 1)).resolves.toHaveLength(1);
  });

  it("allows the reviewed then resolved sequence and appends immutable audit events", async () => {
    const { writer, audits, getEscalation } = createWriter();
    await updateClinicianEscalationReview(writer, { actorUserId: 7, clinicId: 1, escalationId: 81, nextState: "reviewed" });
    await updateClinicianEscalationReview(writer, { actorUserId: 7, clinicId: 1, escalationId: 81, nextState: "resolved" });
    expect(getEscalation().reviewState).toBe("resolved");
    expect(audits.map((audit) => audit.action)).toEqual(["clinician_escalation_reviewed", "clinician_escalation_resolved"]);
  });

  it("rejects invalid review transitions and non-Clinician actors", async () => {
    const clinician = createWriter();
    await expect(updateClinicianEscalationReview(clinician.writer, { actorUserId: 7, clinicId: 1, escalationId: 81, nextState: "resolved" })).rejects.toBeInstanceOf(ClinicScopeError);
    const staff = createWriter("Staff");
    await expect(readClinicianReviewQueue(staff.writer, 8, 1)).rejects.toBeInstanceOf(ClinicScopeError);
  });

  it("reports a conflict when a concurrent reviewer changes the state first", async () => {
    const { writer } = createWriter();
    writer.updateReviewState = async () => undefined;
    await expect(updateClinicianEscalationReview(writer, { actorUserId: 7, clinicId: 1, escalationId: 81, nextState: "reviewed" })).rejects.toBeInstanceOf(EscalationReviewConflictError);
  });
});
