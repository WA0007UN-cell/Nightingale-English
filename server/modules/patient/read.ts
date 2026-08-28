import { ClinicScopeError } from "../../authz/clinicScope";
import type { PatientNextStepsResult, PatientReader } from "./types";

const internalEntryTypes = new Set(["staff", "escalation", "ai"]);

export async function readPatientNextSteps(reader: PatientReader, actorUserId: number, patientId: number): Promise<PatientNextStepsResult> {
  const scope = await reader.getPatientScope(actorUserId, patientId);
  if (!scope) throw new ClinicScopeError("Only the linked Patient account may read these next steps.");

  const steps = (await reader.listPatientEntries(scope.clinicId, scope.patientId))
    .filter((entry) => entry.visibility === "patient" && entry.reviewState === "approved" && !internalEntryTypes.has(entry.entryType))
    .map(({ id, content, occurredAt }) => ({ id, content, occurredAt }));
  return { steps, retrievedAt: new Date() };
}
