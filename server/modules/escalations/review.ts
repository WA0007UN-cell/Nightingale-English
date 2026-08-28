import {
  assertAllowedEscalationReviewTransition,
  assertClinicianCanReviewEscalation,
  ClinicScopeError,
} from "../../authz/clinicScope";
import type { EscalationWriter, ReviewQueueEscalation } from "./types";

export class EscalationReviewConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EscalationReviewConflictError";
  }
}

export async function readClinicianReviewQueue(writer: EscalationWriter, actorUserId: number, clinicId: number) {
  const membership = await writer.getMembership(actorUserId, clinicId);
  assertClinicianCanReviewEscalation({ membership, actorUserId, clinicId, escalation: {
    id: 0, clinicId, patientId: 0, authorRole: "Staff", reviewState: "review_required",
  } });
  return writer.listReviewQueue(clinicId);
}

export async function updateClinicianEscalationReview(
  writer: EscalationWriter,
  input: { actorUserId: number; clinicId: number; escalationId: number; nextState: "reviewed" | "resolved" },
): Promise<ReviewQueueEscalation> {
  const [membership, escalation] = await Promise.all([
    writer.getMembership(input.actorUserId, input.clinicId),
    writer.getReviewQueueEscalation(input.clinicId, input.escalationId),
  ]);
  assertClinicianCanReviewEscalation({ membership, actorUserId: input.actorUserId, clinicId: input.clinicId, escalation });
  assertAllowedEscalationReviewTransition(escalation!.reviewState, input.nextState);

  const updated = await writer.updateReviewState({
    clinicId: input.clinicId,
    escalationId: input.escalationId,
    currentState: escalation!.reviewState,
    nextState: input.nextState,
  });
  if (!updated || updated.reviewState !== input.nextState) {
    throw new EscalationReviewConflictError("The escalation was updated by another reviewer. Refresh the queue and try again.");
  }
  await writer.appendAudit({
    clinicId: input.clinicId,
    patientId: updated.patientId,
    actorUserId: input.actorUserId,
    action: `clinician_escalation_${input.nextState}`,
    targetId: updated.id,
    metadata: { source: "P2-C02", previousState: escalation!.reviewState, nextState: input.nextState },
  });
  return updated;
}

export function isEscalationReviewScopeError(error: unknown): error is ClinicScopeError {
  return error instanceof ClinicScopeError;
}
