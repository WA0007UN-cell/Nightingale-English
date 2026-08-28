import { and, asc, eq } from "drizzle-orm";
import { careEntries, clinicMembers, patients, tasks } from "../../../drizzle/schema";
import type { getDb } from "../../db";
import type { WorkspaceReader } from "./types";

/** Builds the production reader used by the protected workspace procedure. */
export function createDbWorkspaceReader(database: ReturnType<typeof getDb>): WorkspaceReader {
  return {
    async getMembership(userId, clinicId) {
      const [member] = await database.select({ clinicId: clinicMembers.clinicId, userId: clinicMembers.userId, role: clinicMembers.role }).from(clinicMembers).where(and(eq(clinicMembers.userId, userId), eq(clinicMembers.clinicId, clinicId)));
      return member;
    },
    async getPatient(patientId, clinicId) {
      const [patient] = await database.select({ id: patients.id, clinicId: patients.clinicId, patientUserId: patients.patientUserId }).from(patients).where(and(eq(patients.id, patientId), eq(patients.clinicId, clinicId)));
      return patient;
    },
    async listEntries(clinicId, patientId) {
      return database.select({ id: careEntries.id, clinicId: careEntries.clinicId, patientId: careEntries.patientId, authorRole: careEntries.authorRole, entryType: careEntries.entryType, aiType: careEntries.aiType, provenancePointer: careEntries.provenancePointer, visibility: careEntries.visibility, reviewState: careEntries.reviewState, content: careEntries.content, occurredAt: careEntries.occurredAt }).from(careEntries).where(and(eq(careEntries.clinicId, clinicId), eq(careEntries.patientId, patientId))).orderBy(asc(careEntries.occurredAt));
    },
    async listTasks(clinicId, patientId) {
      return database.select({ id: tasks.id, clinicId: tasks.clinicId, patientId: tasks.patientId, title: tasks.title, status: tasks.status, dueAt: tasks.dueAt }).from(tasks).where(and(eq(tasks.clinicId, clinicId), eq(tasks.patientId, patientId))).orderBy(asc(tasks.dueAt));
    },
  };
}
