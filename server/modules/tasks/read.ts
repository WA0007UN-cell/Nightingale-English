import { assertStaffCanReadAssignedTasks, type ClinicMembership } from "../../authz/clinicScope";
import type { TaskReader, TaskReadResult } from "./types";

export async function readAssignedStaffTasks(reader: TaskReader, actorUserId: number, clinicId: number): Promise<TaskReadResult> {
  const membership = await reader.getMembership(actorUserId, clinicId);
  assertStaffCanReadAssignedTasks(membership, actorUserId, clinicId);
  return {
    tasks: await reader.listAssignedTasks(clinicId, actorUserId),
    retrievedAt: new Date(),
  };
}

export function assertStaffMembership(membership: ClinicMembership | undefined, actorUserId: number, clinicId: number) {
  return assertStaffCanReadAssignedTasks(membership, actorUserId, clinicId);
}
