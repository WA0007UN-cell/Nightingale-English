import type { ClinicMembership, ScopedPatient } from "../../authz/clinicScope";

export type WorkspaceEntry = {
  id: number; clinicId: number; patientId: number; authorRole: "Clinician" | "Staff" | "Patient" | "System";
  entryType: "clinician" | "staff" | "patient" | "system" | "ai"; visibility: "clinic" | "patient";
  reviewState: "not_required" | "review_required" | "approved" | "rejected"; content: string; occurredAt: Date;
};
export type WorkspaceTask = {
  id: number; clinicId: number; patientId: number; title: string;
  status: "open" | "in_progress" | "complete" | "cancelled"; dueAt: Date | null;
};
export type WorkspaceReader = {
  getMembership(userId: number, clinicId: number): Promise<ClinicMembership | undefined>;
  getPatient(patientId: number, clinicId: number): Promise<ScopedPatient | undefined>;
  listEntries(clinicId: number, patientId: number): Promise<WorkspaceEntry[]>;
  listTasks(clinicId: number, patientId: number): Promise<WorkspaceTask[]>;
};
export type WorkspaceReadResult = {
  patient: ScopedPatient; role: ClinicMembership["role"]; entries: WorkspaceEntry[]; tasks: WorkspaceTask[]; retrievedAt: Date;
};
