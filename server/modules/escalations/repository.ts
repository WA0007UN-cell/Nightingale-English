import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { auditLogs, careEntries, clinicMembers, patients } from "../../../drizzle/schema";
import type { getDb } from "../../db";
import type { EscalationWriter } from "./types";

export function createDbEscalationWriter(database: ReturnType<typeof getDb>): EscalationWriter {
  return {
    async getMembership(userId, clinicId) {
      const [member] = await database
        .select({ clinicId: clinicMembers.clinicId, userId: clinicMembers.userId, role: clinicMembers.role })
        .from(clinicMembers)
        .where(and(eq(clinicMembers.userId, userId), eq(clinicMembers.clinicId, clinicId)));
      return member;
    },
    async getPatient(patientId, clinicId) {
      const [patient] = await database
        .select({ id: patients.id, clinicId: patients.clinicId, patientUserId: patients.patientUserId })
        .from(patients)
        .where(and(eq(patients.id, patientId), eq(patients.clinicId, clinicId)));
      return patient;
    },
    async getSourceEntry(clinicId, patientId, sourceEntryId) {
      const [entry] = await database
        .select({
          id: careEntries.id,
          clinicId: careEntries.clinicId,
          patientId: careEntries.patientId,
          entryType: careEntries.entryType,
          authorRole: careEntries.authorRole,
          content: careEntries.content,
          occurredAt: careEntries.occurredAt,
        })
        .from(careEntries)
        .where(and(eq(careEntries.id, sourceEntryId), eq(careEntries.clinicId, clinicId), eq(careEntries.patientId, patientId)));
      return entry;
    },
    async listEscalations(clinicId, patientId) {
      const rows = await database
        .select({
          id: careEntries.id,
          clinicId: careEntries.clinicId,
          patientId: careEntries.patientId,
          sourceEntryId: careEntries.sourceEntryId,
          authorRole: careEntries.authorRole,
          content: careEntries.content,
          occurredAt: careEntries.occurredAt,
        })
        .from(careEntries)
        .where(and(eq(careEntries.clinicId, clinicId), eq(careEntries.patientId, patientId), eq(careEntries.entryType, "escalation")))
        .orderBy(desc(careEntries.occurredAt));
      return rows
        .filter((row) => row.sourceEntryId !== null && row.authorRole === "Staff")
        .map((row) => ({ ...row, sourceEntryId: row.sourceEntryId!, authorRole: "Staff" as const }));
    },
    async listSourceEntries(clinicId, patientId) {
      return database
        .select({
          id: careEntries.id,
          clinicId: careEntries.clinicId,
          patientId: careEntries.patientId,
          entryType: careEntries.entryType,
          authorRole: careEntries.authorRole,
          content: careEntries.content,
          occurredAt: careEntries.occurredAt,
        })
        .from(careEntries)
        .where(and(eq(careEntries.clinicId, clinicId), eq(careEntries.patientId, patientId), ne(careEntries.entryType, "escalation")))
        .orderBy(desc(careEntries.occurredAt));
    },
    async createEscalation(input) {
      const [result] = await database.insert(careEntries).values({
        clinicId: input.clinicId,
        patientId: input.patientId,
        sourceEntryId: input.sourceEntryId,
        authorUserId: input.authorUserId,
        authorRole: "Staff",
        entryType: "escalation",
        visibility: "clinic",
        reviewState: "review_required",
        content: input.content,
        occurredAt: input.occurredAt,
      }).returning({ id: careEntries.id });
      const createdId = result?.id;
      const [created] = await database
        .select({
          id: careEntries.id,
          clinicId: careEntries.clinicId,
          patientId: careEntries.patientId,
          sourceEntryId: careEntries.sourceEntryId,
          authorRole: careEntries.authorRole,
          content: careEntries.content,
          occurredAt: careEntries.occurredAt,
        })
        .from(careEntries)
        .where(and(eq(careEntries.id, createdId), eq(careEntries.clinicId, input.clinicId)));
      if (!created || created.sourceEntryId === null || created.authorRole !== "Staff") throw new Error("The escalation could not be created.");
      return { ...created, sourceEntryId: created.sourceEntryId, authorRole: "Staff" as const };
    },
    async appendAudit(input) {
      await database.insert(auditLogs).values({
        clinicId: input.clinicId,
        patientId: input.patientId,
        actorUserId: input.actorUserId,
        action: input.action,
        targetType: "care_entry",
        targetId: String(input.targetId),
        metadata: input.metadata,
      });
    },
    async listReviewQueue(clinicId) {
      const rows = await database
        .select({
          id: careEntries.id,
          clinicId: careEntries.clinicId,
          patientId: careEntries.patientId,
          sourceEntryId: careEntries.sourceEntryId,
          authorRole: careEntries.authorRole,
          reviewState: careEntries.reviewState,
          content: careEntries.content,
          occurredAt: careEntries.occurredAt,
        })
        .from(careEntries)
        .where(and(
          eq(careEntries.clinicId, clinicId),
          eq(careEntries.entryType, "escalation"),
          eq(careEntries.authorRole, "Staff"),
          inArray(careEntries.reviewState, ["review_required", "reviewed"]),
        ))
        .orderBy(desc(careEntries.occurredAt));
      return rows
        .filter((row) => row.sourceEntryId !== null && (row.reviewState === "review_required" || row.reviewState === "reviewed"))
        .map((row) => ({
          ...row,
          sourceEntryId: row.sourceEntryId!,
          authorRole: "Staff" as const,
          reviewState: row.reviewState as "review_required" | "reviewed",
        }));
    },
    async getReviewQueueEscalation(clinicId, escalationId) {
      const [row] = await database
        .select({
          id: careEntries.id,
          clinicId: careEntries.clinicId,
          patientId: careEntries.patientId,
          sourceEntryId: careEntries.sourceEntryId,
          authorRole: careEntries.authorRole,
          reviewState: careEntries.reviewState,
          content: careEntries.content,
          occurredAt: careEntries.occurredAt,
        })
        .from(careEntries)
        .where(and(eq(careEntries.id, escalationId), eq(careEntries.clinicId, clinicId), eq(careEntries.entryType, "escalation"), eq(careEntries.authorRole, "Staff")));
      if (!row || row.sourceEntryId === null || (row.reviewState !== "review_required" && row.reviewState !== "reviewed" && row.reviewState !== "resolved")) return undefined;
      return { ...row, sourceEntryId: row.sourceEntryId, authorRole: "Staff" as const, reviewState: row.reviewState };
    },
    async updateReviewState(input) {
      await database
        .update(careEntries)
        .set({ reviewState: input.nextState })
        .where(and(
          eq(careEntries.id, input.escalationId),
          eq(careEntries.clinicId, input.clinicId),
          eq(careEntries.entryType, "escalation"),
          eq(careEntries.reviewState, input.currentState),
        ));
      return this.getReviewQueueEscalation(input.clinicId, input.escalationId);
    },
  };
}
