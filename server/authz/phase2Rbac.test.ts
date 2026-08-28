import { describe, expect, it } from "vitest";
import {
  ClinicScopeError,
  assertCanReadPatientWorkspace,
  assertClinicianCanManageCarePlan,
  assertClinicianCanReviewEscalation,
  assertStaffCanCreateEscalation,
  assertStaffCanReadAssignedTasks,
  assertStaffCanUpdateTask,
} from "./clinicScope";

const patient = { id: 40, clinicId: 10, patientUserId: 12 };
const task = { clinicId: 10, assigneeUserId: 7, status: "open" as const };
const escalation = { id: 3, clinicId: 10, patientId: 40, authorRole: "Staff" as const, reviewState: "review_required" as const };
const source = { id: 5, clinicId: 10, patientId: 40, entryType: "staff" as const };

const membership = (role: "Patient" | "Staff" | "Clinician" | "Admin", clinicId = 10, userId = 7) => ({ role, clinicId, userId });

describe("Phase 2 RBAC verification", () => {
  it("returns a forbidden scope error for every cross-clinic request", () => {
    expect(() => assertCanReadPatientWorkspace({ actorUserId: 7, membership: membership("Admin"), patient: { ...patient, clinicId: 99 } })).toThrow(ClinicScopeError);
    expect(() => assertStaffCanReadAssignedTasks(membership("Staff"), 7, 99)).toThrow(ClinicScopeError);
    expect(() => assertClinicianCanManageCarePlan({ membership: membership("Clinician"), actorUserId: 7, clinicId: 10, patient: { ...patient, clinicId: 99 } })).toThrow(ClinicScopeError);
  });

  it("keeps Patient limited to linked, patient-visible workspace access", () => {
    expect(assertCanReadPatientWorkspace({ actorUserId: 12, membership: membership("Patient", 10, 12), patient }).role).toBe("Patient");
    expect(() => assertCanReadPatientWorkspace({ actorUserId: 12, membership: membership("Patient", 10, 12), patient: { ...patient, patientUserId: 99 } })).toThrow(ClinicScopeError);
  });

  it("keeps Staff limited to assigned task mutations and authored escalations", () => {
    expect(assertStaffCanReadAssignedTasks(membership("Staff"), 7, 10).role).toBe("Staff");
    expect(assertStaffCanUpdateTask({ membership: membership("Staff"), actorUserId: 7, task, clinicId: 10, assigneeUserId: 7 }).role).toBe("Staff");
    expect(assertStaffCanCreateEscalation({ membership: membership("Staff"), actorUserId: 7, clinicId: 10, patient, sourceEntry: source }).role).toBe("Staff");
    expect(() => assertStaffCanUpdateTask({ membership: membership("Staff"), actorUserId: 7, task, clinicId: 10, assigneeUserId: 8 })).toThrow(ClinicScopeError);
  });

  it("keeps Clinician limited to escalation review and Care Plan ownership", () => {
    expect(assertClinicianCanReviewEscalation({ membership: membership("Clinician"), actorUserId: 7, clinicId: 10, escalation }).role).toBe("Clinician");
    expect(assertClinicianCanManageCarePlan({ membership: membership("Clinician"), actorUserId: 7, clinicId: 10, patient }).role).toBe("Clinician");
    expect(() => assertClinicianCanReviewEscalation({ membership: membership("Staff"), actorUserId: 7, clinicId: 10, escalation })).toThrow(ClinicScopeError);
  });

  it("keeps Admin governance-only and rejects clinical write boundaries", () => {
    expect(() => assertStaffCanReadAssignedTasks(membership("Admin"), 7, 10)).toThrow(ClinicScopeError);
    expect(() => assertClinicianCanManageCarePlan({ membership: membership("Admin"), actorUserId: 7, clinicId: 10, patient })).toThrow(ClinicScopeError);
    expect(() => assertClinicianCanReviewEscalation({ membership: membership("Admin"), actorUserId: 7, clinicId: 10, escalation })).toThrow(ClinicScopeError);
  });
});
