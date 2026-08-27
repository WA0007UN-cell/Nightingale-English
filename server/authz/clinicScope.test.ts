import { describe, expect, it } from "vitest";
import { ClinicScopeError, assertCanReadPatientWorkspace, isEntryVisibleToRole } from "./clinicScope";

const clinicMembership = { clinicId: 10, userId: 7, role: "Clinician" as const };
const linkedPatient = { id: 40, clinicId: 10, patientUserId: 12 };

describe("clinic workspace scope", () => {
  it("allows a same-clinic clinician to enter the patient workspace", () => {
    expect(assertCanReadPatientWorkspace({ actorUserId: 7, membership: clinicMembership, patient: linkedPatient }).role).toBe("Clinician");
  });
  it("denies a requested patient outside the actor clinic", () => {
    expect(() => assertCanReadPatientWorkspace({ actorUserId: 7, membership: clinicMembership, patient: { ...linkedPatient, clinicId: 99 } })).toThrow(ClinicScopeError);
  });
  it("requires a patient actor to be linked to the requested patient record", () => {
    expect(() => assertCanReadPatientWorkspace({ actorUserId: 12, membership: { clinicId: 10, userId: 12, role: "Patient" }, patient: { ...linkedPatient, patientUserId: 99 } })).toThrow("linked to their account");
  });
  it("keeps clinic-only entries out of a patient result", () => {
    expect(isEntryVisibleToRole({ visibility: "clinic" }, "Patient")).toBe(false);
    expect(isEntryVisibleToRole({ visibility: "patient" }, "Patient")).toBe(true);
  });
});
