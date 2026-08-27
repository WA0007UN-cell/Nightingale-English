import { roleHasCapability, type ClinicRole } from "@shared/domain/roles";

export type ClinicMembership = { clinicId: number; userId: number; role: ClinicRole };
export type ScopedPatient = { id: number; clinicId: number; patientUserId: number | null };
export type ScopedEntry = { visibility: "clinic" | "patient" };

export class ClinicScopeError extends Error {
  readonly code = "FORBIDDEN";

  constructor(message: string) {
    super(message);
    this.name = "ClinicScopeError";
  }
}

/** Validates membership, tenant boundary and the patient-to-user link before any workspace data is returned. */
export function assertCanReadPatientWorkspace(input: { actorUserId: number; membership: ClinicMembership | undefined; patient: ScopedPatient | undefined }) {
  const { actorUserId, membership, patient } = input;
  if (!membership || membership.userId !== actorUserId || !patient || patient.clinicId !== membership.clinicId) {
    throw new ClinicScopeError("The requested patient is outside the actor's clinic scope.");
  }

  const capability = membership.role === "Patient" ? "read_patient_visible_context" : "read_clinic_timeline";
  if (!roleHasCapability(membership.role, capability)) {
    throw new ClinicScopeError("The actor role cannot read this workspace.");
  }
  if (membership.role === "Patient" && patient.patientUserId !== actorUserId) {
    throw new ClinicScopeError("A patient actor may read only the patient record linked to their account.");
  }
  return membership;
}

/** Patient actors receive only entries deliberately marked patient-visible. */
export function isEntryVisibleToRole(entry: ScopedEntry, role: ClinicRole) {
  return role !== "Patient" || entry.visibility === "patient";
}
