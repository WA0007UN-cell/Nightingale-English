import { assertClinicianCanManageCarePlan, ClinicScopeError } from "../../authz/clinicScope";
import type { CarePlanReader, CarePlanSection, CarePlanSnapshot, CarePlanVersion, CarePlanWriter } from "./types";

export class CarePlanValidationError extends Error {
  constructor(message: string) { super(message); this.name = "CarePlanValidationError"; }
}

export class CarePlanVersionConflictError extends Error {
  constructor(message: string) { super(message); this.name = "CarePlanVersionConflictError"; }
}

async function assertClinicianScope(
  reader: CarePlanReader,
  input: { actorUserId: number; clinicId: number; patientId: number },
) {
  const [membership, patient] = await Promise.all([
    reader.getMembership(input.actorUserId, input.clinicId),
    reader.getPatient(input.patientId, input.clinicId),
  ]);
  assertClinicianCanManageCarePlan({ membership, actorUserId: input.actorUserId, clinicId: input.clinicId, patient });
}

export async function readClinicianCarePlan(
  reader: CarePlanReader,
  input: { actorUserId: number; clinicId: number; patientId: number },
): Promise<CarePlanSnapshot> {
  await assertClinicianScope(reader, input);
  return { sections: await reader.listSections(input.clinicId, input.patientId), retrievedAt: new Date() };
}

export async function readCarePlanVersionHistory(
  reader: CarePlanReader,
  input: { actorUserId: number; clinicId: number; patientId: number; sectionId: number },
): Promise<CarePlanVersion[]> {
  await assertClinicianScope(reader, input);
  const section = await reader.getSection(input.clinicId, input.patientId, input.sectionId);
  if (!section) throw new ClinicScopeError("The Care Plan section is outside the Clinician's clinic scope.");
  return reader.listVersions(input.clinicId, input.patientId, input.sectionId);
}

export async function editCarePlanSection(
  writer: CarePlanWriter,
  input: { actorUserId: number; clinicId: number; patientId: number; sectionId: number; baseVersion: number; content: string },
): Promise<CarePlanSection> {
  const content = input.content.trim();
  if (!content) throw new CarePlanValidationError("Care Plan content is required.");
  if (content.length > 4000) throw new CarePlanValidationError("Care Plan content must be 4,000 characters or fewer.");
  await assertClinicianScope(writer, input);
  const updated = await writer.applyVersionedUpdate({ ...input, content, changeType: "edit", auditAction: "care_plan_section_edited" });
  if (!updated) throw new CarePlanVersionConflictError("This Care Plan changed after you opened it. Refresh before saving your edit.");
  return updated;
}

export async function revertCarePlanVersion(
  writer: CarePlanWriter,
  input: { actorUserId: number; clinicId: number; patientId: number; sectionId: number; baseVersion: number; targetVersion: number },
): Promise<CarePlanSection> {
  await assertClinicianScope(writer, input);
  const target = await writer.getVersion(input.clinicId, input.patientId, input.sectionId, input.targetVersion);
  if (!target) throw new ClinicScopeError("The requested Care Plan version is outside the Clinician's clinic scope.");
  const updated = await writer.applyVersionedUpdate({
    ...input, content: target.content, changeType: "revert", revertedFromVersion: target.versionNumber,
    auditAction: "care_plan_version_reverted",
  });
  if (!updated) throw new CarePlanVersionConflictError("This Care Plan changed after you opened it. Refresh before reverting.");
  return updated;
}
