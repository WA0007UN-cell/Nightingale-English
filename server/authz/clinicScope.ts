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

export type StaffTaskScope = {
  clinicId: number;
  assigneeUserId: number | null;
  status: "open" | "in_progress" | "complete" | "cancelled";
};

export function assertStaffCanReadAssignedTasks(membership: ClinicMembership | undefined, actorUserId: number, clinicId: number) {
  if (!membership || membership.userId !== actorUserId || membership.clinicId !== clinicId || membership.role !== "Staff") {
    throw new ClinicScopeError("Only a Staff member of this clinic may read assigned tasks.");
  }
  return membership;
}

export function assertStaffCanUpdateTask(input: {
  membership: ClinicMembership | undefined;
  actorUserId: number;
  task: StaffTaskScope | undefined;
  clinicId: number;
  assigneeUserId: number;
}) {
  const { membership, actorUserId, task, clinicId, assigneeUserId } = input;
  if (!membership || membership.userId !== actorUserId || membership.clinicId !== clinicId || membership.role !== "Staff") {
    throw new ClinicScopeError("Only a Staff member of this clinic may update tasks.");
  }
  if (!task || task.clinicId !== clinicId || task.assigneeUserId !== assigneeUserId) {
    throw new ClinicScopeError("A Staff member may update only their own clinic-scoped task.");
  }
  return membership;
}

export function assertAllowedTaskTransition(current: StaffTaskScope["status"], next: "in_progress" | "complete") {
  if ((current === "open" && next === "in_progress") || (current === "in_progress" && next === "complete")) return;
  throw new ClinicScopeError(`Task transition ${current} → ${next} is not allowed.`);
}

export type StaffEscalationSourceScope = {
  id: number;
  clinicId: number;
  patientId: number;
  entryType: "clinician" | "staff" | "escalation" | "patient" | "system" | "ai";
};

/** Ensures an escalation is authored by Staff against a patient and Timeline entry in the same clinic. */
export function assertStaffCanCreateEscalation(input: {
  membership: ClinicMembership | undefined;
  actorUserId: number;
  clinicId: number;
  patient: ScopedPatient | undefined;
  sourceEntry: StaffEscalationSourceScope | undefined;
}) {
  const { membership, actorUserId, clinicId, patient, sourceEntry } = input;
  if (!membership || membership.userId !== actorUserId || membership.clinicId !== clinicId || membership.role !== "Staff") {
    throw new ClinicScopeError("Only a Staff member of this clinic may create an escalation.");
  }
  if (!patient || patient.clinicId !== clinicId || !sourceEntry || sourceEntry.clinicId !== clinicId || sourceEntry.patientId !== patient.id) {
    throw new ClinicScopeError("The escalation patient or source entry is outside the Staff member's clinic scope.");
  }
  if (sourceEntry.entryType === "escalation") {
    throw new ClinicScopeError("An escalation must link to an authorised Timeline source entry, not another escalation.");
  }
  return membership;
}
