import { describe, expect, it } from "vitest";
import { canAccessPatientRecord, getClinicMembership } from "./clinicScope";

const memberships = [
  { clinicId: 10, userId: 1, role: "Clinician" as const },
  { clinicId: 10, userId: 2, role: "Patient" as const },
  { clinicId: 11, userId: 3, role: "Staff" as const },
];

describe("clinic scope", () => {
  it("accepts a clinic member only in the clinic that contains the record", () => {
    const membership = getClinicMembership(memberships, 1, 10);
    expect(canAccessPatientRecord({ membership, patientClinicId: 10, patientUserId: 2, actorUserId: 1 })).toBe(true);
    expect(canAccessPatientRecord({ membership, patientClinicId: 11, patientUserId: 2, actorUserId: 1 })).toBe(false);
  });

  it("limits a patient member to their own linked patient record", () => {
    const membership = getClinicMembership(memberships, 2, 10);
    expect(canAccessPatientRecord({ membership, patientClinicId: 10, patientUserId: 2, actorUserId: 2 })).toBe(true);
    expect(canAccessPatientRecord({ membership, patientClinicId: 10, patientUserId: 99, actorUserId: 2 })).toBe(false);
  });
});

