import { and, eq, inArray } from "drizzle-orm";
import { auditLogs, tasks, clinicMembers } from "../../../drizzle/schema";
import type { getDb } from "../../db";
import type { TaskWriter } from "./types";

export function createDbTaskWriter(database: ReturnType<typeof getDb>): TaskWriter {
  return {
    async getMembership(userId, clinicId) {
      const [member] = await database
        .select({ clinicId: clinicMembers.clinicId, userId: clinicMembers.userId, role: clinicMembers.role })
        .from(clinicMembers)
        .where(and(eq(clinicMembers.userId, userId), eq(clinicMembers.clinicId, clinicId)));
      return member;
    },
    async listAssignedTasks(clinicId, assigneeUserId) {
      const rows = await database
        .select({
          id: tasks.id,
          clinicId: tasks.clinicId,
          patientId: tasks.patientId,
          sourceEntryId: tasks.sourceEntryId,
          assigneeUserId: tasks.assigneeUserId,
          title: tasks.title,
          status: tasks.status,
          dueAt: tasks.dueAt,
        })
        .from(tasks)
        .where(and(eq(tasks.clinicId, clinicId), eq(tasks.assigneeUserId, assigneeUserId), inArray(tasks.status, ["open", "in_progress"])))
        .orderBy(tasks.dueAt);
      return rows.map(({ assigneeUserId: _assigneeUserId, ...task }) => task);
    },
    async getTask(clinicId, taskId) {
      const [task] = await database
        .select({
          id: tasks.id,
          clinicId: tasks.clinicId,
          patientId: tasks.patientId,
          sourceEntryId: tasks.sourceEntryId,
          title: tasks.title,
          status: tasks.status,
          dueAt: tasks.dueAt,
          assigneeUserId: tasks.assigneeUserId,
        })
        .from(tasks)
        .where(and(eq(tasks.clinicId, clinicId), eq(tasks.id, taskId)));
      return task;
    },
    async updateTaskStatus(clinicId, taskId, currentStatus, nextStatus) {
      await database
        .update(tasks)
        .set({ status: nextStatus })
        .where(and(eq(tasks.clinicId, clinicId), eq(tasks.id, taskId), eq(tasks.status, currentStatus)));
      return this.getTask(clinicId, taskId);
    },
    async appendAudit(input) {
      await database.insert(auditLogs).values({
        clinicId: input.clinicId,
        patientId: input.patientId,
        actorUserId: input.actorUserId,
        action: input.action,
        targetType: "task",
        targetId: String(input.targetId),
        metadata: input.metadata,
      });
    },
  };
}
