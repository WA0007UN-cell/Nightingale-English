import type { StaffTaskScope } from "../../authz/clinicScope";

export type StaffTaskStatus = StaffTaskScope["status"];
export type StaffTaskAction = "start" | "complete";

export type StoredTask = {
  id: number;
  clinicId: number;
  patientId: number;
  sourceEntryId: number | null;
  assigneeUserId: number | null;
  title: string;
  status: StaffTaskStatus;
  dueAt: Date | null;
};

export type AssignedTask = Omit<StoredTask, "assigneeUserId">;

export type TaskReader = {
  getMembership(userId: number, clinicId: number): Promise<{ clinicId: number; userId: number; role: "Clinician" | "Staff" | "Patient" | "Admin" } | undefined>;
  listAssignedTasks(clinicId: number, assigneeUserId: number): Promise<AssignedTask[]>;
  getTask(clinicId: number, taskId: number): Promise<StoredTask | undefined>;
};

export type TaskWriter = TaskReader & {
  updateTaskStatus(clinicId: number, taskId: number, currentStatus: StaffTaskStatus, nextStatus: "in_progress" | "complete"): Promise<StoredTask | undefined>;
  appendAudit(input: { clinicId: number; patientId: number; actorUserId: number; action: string; targetId: number; metadata: Record<string, unknown> }): Promise<void>;
};

export type TaskReadResult = {
  tasks: AssignedTask[];
  retrievedAt: Date;
};

export type TaskMutationResult = {
  task: AssignedTask;
  auditAction: string;
};
