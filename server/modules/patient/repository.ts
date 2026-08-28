import { and, asc, eq } from "drizzle-orm";
import { careEntries, clinicMembers, patients } from "../../../drizzle/schema";
import type { getDb } from "../../db";
import type { PatientReader } from "./types";

export function createDbPatientReader(database: ReturnType<typeof getDb>): PatientReader {
  return {
    async getPatientScope(actorUserId, patientId) {
      const [scope] = await database
        .select({ clinicId: patients.clinicId, patientId: patients.id })
        .from(patients)
        .innerJoin(clinicMembers, and(
          eq(clinicMembers.clinicId, patients.clinicId),
          eq(clinicMembers.userId, actorUserId),
          eq(clinicMembers.role, "Patient"),
        ))
        .where(and(eq(patients.id, patientId), eq(patients.patientUserId, actorUserId)));
      return scope;
    },

    async listPatientEntries(clinicId, patientId) {
      return database
        .select({
          id: careEntries.id,
          entryType: careEntries.entryType,
          visibility: careEntries.visibility,
          reviewState: careEntries.reviewState,
          content: careEntries.content,
          occurredAt: careEntries.occurredAt,
        })
        .from(careEntries)
        .where(and(eq(careEntries.clinicId, clinicId), eq(careEntries.patientId, patientId)))
        .orderBy(asc(careEntries.occurredAt));
    },
  };
}
