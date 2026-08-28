import { describe, expect, it } from "vitest";
import { updateAssignedTaskStatus } from "./mutations";
import type { StoredTask, TaskWriter } from "./types";

function createWriter(input: { role?: "Staff" | "Clinician"; clinicId?: number; assigneeUserId?: number; status?: StoredTask["status"] } = {}) {
  let task: StoredTask = {
    id: 1,
    clinicId: input.clinicId ?? 10,
    patientId: 20,
    sourceEntryId: 30,
    assigneeUserId: input.assigneeUserId ?? 7,
    title: "Confirm check-in",
    status: input.status ?? "open",
    dueAt: new Date("2026-02-18T16:00:00.000Z"),
  };
  const audits: Array<Record<string, unknown>> = [];
  const writer: TaskWriter = {
    async getMembership(userId, clinicId) {
      return clinicId === (input.clinicId ?? 10) ? { clinicId, userId, role: input.role ?? "Staff" } : undefined;
    },
    async listAssignedTasks() {
      return [];
    },
    async getTask(clinicId, taskId) {
      return clinicId === task.clinicId && taskId === task.id ? task : undefined;
    },
    async updateTaskStatus(clinicId, taskId, currentStatus, nextStatus) {
      if (clinicId !== task.clinicId || taskId !== task.id || currentStatus !== task.status) return undefined;
      task = { ...task, status: nextStatus };
      return task;
    },
    async appendAudit(audit) {
      audits.push(audit);
    },
  };
  return { writer, getTask: () => task, audits };
}

describe("P2-S02 Staff task status mutation", () => {
  it("allows open → in_progress → complete and writes both audit events", async () => {
    const fixture = createWriter();
    const started = await updateAssignedTaskStatus(fixture.writer, { actorUserId: 7, clinicId: 10, taskId: 1, action: "start" });
    const completed = await updateAssignedTaskStatus(fixture.writer, { actorUserId: 7, clinicId: 10, taskId: 1, action: "complete" });
    expect(started.task.status).toBe("in_progress");
    expect(completed.task.status).toBe("complete");
    expect(fixture.audits.map((audit) => audit.action)).toEqual(["task_start", "task_complete"]);
  });

  it("rejects an incorrect assignee and leaves the task unchanged", async () => {
    const fixture = createWriter({ assigneeUserId: 99 });
    await expect(updateAssignedTaskStatus(fixture.writer, { actorUserId: 7, clinicId: 10, taskId: 1, action: "start" })).rejects.toThrow("own clinic-scoped task");
    expect(fixture.getTask().status).toBe("open");
  });

  it("rejects non-Staff and cross-clinic mutations", async () => {
    await expect(updateAssignedTaskStatus(createWriter({ role: "Clinician" }).writer, { actorUserId: 7, clinicId: 10, taskId: 1, action: "start" })).rejects.toThrow("Only a Staff");
    await expect(updateAssignedTaskStatus(createWriter({ clinicId: 10 }).writer, { actorUserId: 7, clinicId: 99, taskId: 1, action: "start" })).rejects.toThrow("Only a Staff");
  });

  it("rejects completing an open task without first starting it", async () => {
    await expect(updateAssignedTaskStatus(createWriter().writer, { actorUserId: 7, clinicId: 10, taskId: 1, action: "complete" })).rejects.toThrow("not allowed");
  });
});
