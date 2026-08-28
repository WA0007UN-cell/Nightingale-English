import { assertStaffCanReadAssignedTasks, ClinicScopeError } from "../../authz/clinicScope";
import type { EscalationReader, StaffEscalationContext } from "./types";

/** Returns clinic-internal escalation records and linkable Timeline sources only for the signed-in Staff member. */
export async function readStaffEscalationContext(
  reader: EscalationReader,
  actorUserId: number,
  clinicId: number,
  patientId: number,
): Promise<StaffEscalationContext> {
  const [membership, patient] = await Promise.all([
    reader.getMembership(actorUserId, clinicId),
    reader.getPatient(patientId, clinicId),
  ]);
  assertStaffCanReadAssignedTasks(membership, actorUserId, clinicId);
  if (!patient || patient.clinicId !== clinicId) {
    throw new ClinicScopeError("The requested patient is outside the Staff member's clinic scope.");
  }

  const [escalations, sourceEntries] = await Promise.all([
    reader.listEscalations(clinicId, patientId),
    reader.listSourceEntries(clinicId, patientId),
  ]);
  return { escalations, sourceEntries, retrievedAt: new Date() };
}
