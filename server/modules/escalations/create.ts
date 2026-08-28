import { assertStaffCanCreateEscalation, ClinicScopeError } from "../../authz/clinicScope";
import type { EscalationWriter, StaffEscalation } from "./types";

export class EscalationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EscalationValidationError";
  }
}

export async function createStaffEscalation(
  writer: EscalationWriter,
  input: { actorUserId: number; clinicId: number; patientId: number; sourceEntryId: number; content: string },
): Promise<StaffEscalation> {
  const content = input.content.trim();
  if (!content) throw new EscalationValidationError("Escalation text is required.");
  if (content.length > 1200) throw new EscalationValidationError("Escalation text must be 1,200 characters or fewer.");

  const [membership, patient, sourceEntry] = await Promise.all([
    writer.getMembership(input.actorUserId, input.clinicId),
    writer.getPatient(input.patientId, input.clinicId),
    writer.getSourceEntry(input.clinicId, input.patientId, input.sourceEntryId),
  ]);
  assertStaffCanCreateEscalation({ membership, actorUserId: input.actorUserId, clinicId: input.clinicId, patient, sourceEntry });

  const escalation = await writer.createEscalation({
    clinicId: input.clinicId,
    patientId: input.patientId,
    sourceEntryId: input.sourceEntryId,
    authorUserId: input.actorUserId,
    content,
    occurredAt: new Date(),
  });
  await writer.appendAudit({
    clinicId: input.clinicId,
    patientId: input.patientId,
    actorUserId: input.actorUserId,
    action: "staff_escalation_created",
    targetId: escalation.id,
    metadata: { sourceEntryId: input.sourceEntryId, source: "P2-S03", synthetic: true },
  });
  return escalation;
}

export function isEscalationScopeError(error: unknown): error is ClinicScopeError {
  return error instanceof ClinicScopeError;
}
