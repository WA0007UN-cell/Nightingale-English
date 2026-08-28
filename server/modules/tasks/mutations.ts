import { assertAllowedTaskTransition, assertStaffCanUpdateTask } from "../../authz/clinicScope";
import type { StaffTaskAction } from "./types";
import type { TaskWriter, TaskMutationResult } from "./types";

const nextStatusByAction: Record<StaffTaskAction, "in_progress" | "complete"> = {
  start: "in_progress",
  complete: "complete",
};

export async function updateAssignedTaskStatus(
  writer: TaskWriter,
  input: { actorUserId: number; clinicId: number; taskId: number; action: StaffTaskAction },
): Promise<TaskMutationResult> {
  const membership = await writer.getMembership(input.actorUserId, input.clinicId);
  const task = await writer.getTask(input.clinicId, input.taskId);
  assertStaffCanUpdateTask({
    membership,
    actorUserId: input.actorUserId,
    task,
    clinicId: input.clinicId,
    assigneeUserId: input.actorUserId,
  });

  const nextStatus = nextStatusByAction[input.action];
  assertAllowedTaskTransition(task!.status, nextStatus);
  const updatedTask = await writer.updateTaskStatus(input.clinicId, input.taskId, task!.status, nextStatus);
  if (!updatedTask || updatedTask.status !== nextStatus) {
    throw new Error("The task changed before this update completed. Please refresh and try again.");
  }

  const auditAction = `task_${input.action}`;
  await writer.appendAudit({
    clinicId: input.clinicId,
    patientId: updatedTask.patientId,
    actorUserId: input.actorUserId,
    action: auditAction,
    targetId: updatedTask.id,
    metadata: { previousStatus: task!.status, nextStatus, source: "P2-S02" },
  });

  const { assigneeUserId: _assigneeUserId, ...safeTask } = updatedTask;
  return { task: safeTask, auditAction };
}
