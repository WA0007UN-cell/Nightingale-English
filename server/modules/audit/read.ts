import { ClinicScopeError } from "../../authz/clinicScope";
import type { AuditReader, AuditEventMetadata, AuditScope } from "./types";

export async function readAuthorizedAuditEvents(reader: AuditReader, actorUserId: number, scope: AuditScope): Promise<AuditEventMetadata[]> {
  const membership = await reader.getMembership(actorUserId, scope.clinicId);
  if (!membership || membership.userId !== actorUserId || membership.clinicId !== scope.clinicId || membership.role !== "Admin") {
    throw new ClinicScopeError("Only an Admin member of this clinic may read audit events.");
  }
  return reader.listEvents(scope.clinicId, Math.min(scope.limit ?? 50, 100));
}
