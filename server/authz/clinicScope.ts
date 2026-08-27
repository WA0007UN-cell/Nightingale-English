/**
 * Phase 2 authorization helpers. Route handlers must resolve a membership
 * from the authenticated user, then use these helpers before loading a record.
 */
import type { ClinicRole } from "../../shared/domain/roles";

export type ClinicMembership = {
  clinicId: number;
  userId: number;
  role: ClinicRole;
};

export function getClinicMembership(
  memberships: ClinicMembership[],
  userId: number,
  clinicId: number,
) {
  return memberships.find(
    (membership) => membership.userId === userId && membership.clinicId === clinicId,
  );
}

export function canAccessPatientRecord(input: {
  membership: ClinicMembership | undefined;
  patientClinicId: number;
  patientUserId: number | null;
  actorUserId: number;
}) {
  const { membership, patientClinicId, patientUserId, actorUserId } = input;
  if (!membership || membership.clinicId !== patientClinicId) return false;
  if (membership.role === "Patient") return patientUserId === actorUserId;
  return membership.role === "Clinician" || membership.role === "Staff" || membership.role === "Admin";
}
