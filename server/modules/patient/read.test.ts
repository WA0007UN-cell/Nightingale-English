import { describe, expect, it } from "vitest";
import { ClinicScopeError } from "../../authz/clinicScope";
import { readPatientNextSteps } from "./read";
import type { PatientReader } from "./types";

const occurredAt = new Date("2026-02-18T09:30:00.000Z");

function createReader(): PatientReader {
  return {
    async getPatientScope(actorUserId, patientId) {
      return actorUserId === 3 && patientId === 11 ? { clinicId: 1, patientId: 11 } : undefined;
    },
    async listPatientEntries() {
      return [
        { id: 101, entryType: "staff", visibility: "clinic", reviewState: "not_required", content: "Internal Staff note", occurredAt },
        { id: 102, entryType: "escalation", visibility: "clinic", reviewState: "review_required", content: "Raw Staff escalation", occurredAt },
        { id: 103, entryType: "ai", visibility: "patient", reviewState: "rejected", content: "Unapproved AI draft", occurredAt },
        { id: 104, entryType: "clinician", visibility: "patient", reviewState: "approved", content: "Approved next step", occurredAt },
      ];
    },
  };
}

describe("Patient Privacy Shield", () => {
  it("returns only approved patient-visible instructions and strips internal fields", async () => {
    const result = await readPatientNextSteps(createReader(), 3, 11);

    expect(result.steps).toEqual([{ id: 104, content: "Approved next step", occurredAt }]);
    expect(result.steps[0]).not.toHaveProperty("entryType");
    expect(result.steps[0]).not.toHaveProperty("visibility");
    expect(result.steps[0]).not.toHaveProperty("reviewState");
    expect(JSON.stringify(result)).not.toContain("Internal Staff note");
    expect(JSON.stringify(result)).not.toContain("Raw Staff escalation");
    expect(JSON.stringify(result)).not.toContain("Unapproved AI draft");
  });

  it("denies a non-linked actor even when the patient id is valid", async () => {
    await expect(readPatientNextSteps(createReader(), 99, 11)).rejects.toBeInstanceOf(ClinicScopeError);
  });
});
