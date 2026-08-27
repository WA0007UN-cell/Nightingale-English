import { assertCanReadPatientWorkspace, isEntryVisibleToRole } from "../../authz/clinicScope";
import type { WorkspaceReadResult, WorkspaceReader } from "./types";

/** The central server-side read decision; no browser input determines role or entry visibility. */
export async function readAuthorizedWorkspace(reader: WorkspaceReader, actorUserId: number, scope: { clinicId: number; patientId: number }): Promise<WorkspaceReadResult> {
  const [membership, patient] = await Promise.all([
    reader.getMembership(actorUserId, scope.clinicId),
    reader.getPatient(scope.patientId, scope.clinicId),
  ]);
  const validatedMembership = assertCanReadPatientWorkspace({ actorUserId, membership, patient });
  const entries = (await reader.listEntries(scope.clinicId, scope.patientId)).filter((entry) => isEntryVisibleToRole(entry, validatedMembership.role));
  const tasks = validatedMembership.role === "Patient" ? [] : await reader.listTasks(scope.clinicId, scope.patientId);
  return { patient: patient!, role: validatedMembership.role, entries, tasks, retrievedAt: new Date() };
}
