import { describe, expect, it } from "vitest";
import { ClinicScopeError } from "../../authz/clinicScope";
import { readAssignedStaffTasks } from "./read";
import type { AssignedTask, TaskReader } from "./types";

const openTask: AssignedTask = {
  id: 1,
  clinicId: 10,
  patientId: 20,
  sourceEntryId: 30,
  title: "Confirm check-in",
  status: "open",
  dueAt: new Date("2026-02-18T16:00:00.000Z"),
};

function readerFor(role: "Staff" | "Clinician", clinicId = 10): TaskReader {
  return {
    async getMembership(userId, requestedClinicId) {
      return requestedClinicId === clinicId ? { clinicId, userId, role } : undefined;
    },
    async listAssignedTasks(requestedClinicId, assigneeUserId) {
      return requestedClinicId === clinicId && assigneeUserId === 7 ? [openTask] : [];
    },
    async getTask() {
      return undefined;
    },
  };
}

describe("P2-S01 assigned Staff task read", () => {
  it("returns only the current Staff member's open task list", async () => {
    const result = await readAssignedStaffTasks(readerFor("Staff"), 7, 10);
    expect(result.tasks).toEqual([openTask]);
    expect(result.tasks.every((task) => task.status === "open" || task.status === "in_progress")).toBe(true);
  });

  it("rejects a Clinician using the Staff assigned-task procedure", async () => {
    await expect(readAssignedStaffTasks(readerFor("Clinician"), 7, 10)).rejects.toBeInstanceOf(ClinicScopeError);
  });

  it("rejects a clinic outside the membership scope", async () => {
    await expect(readAssignedStaffTasks(readerFor("Staff", 10), 7, 99)).rejects.toBeInstanceOf(ClinicScopeError);
  });
});
