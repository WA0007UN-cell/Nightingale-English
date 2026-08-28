import { and, asc, eq } from "drizzle-orm";
import { auditLogs, carePlanSections, carePlanSectionVersions, clinicMembers, patients } from "../../../drizzle/schema";
import type { getDb } from "../../db";
import type { CarePlanReader, CarePlanWriter } from "./types";

function sectionSelection() {
  return {
    id: carePlanSections.id,
    clinicId: carePlanSections.clinicId,
    patientId: carePlanSections.patientId,
    sectionKey: carePlanSections.sectionKey,
    content: carePlanSections.content,
    currentVersion: carePlanSections.currentVersion,
    updatedByUserId: carePlanSections.updatedByUserId,
    updatedAt: carePlanSections.updatedAt,
  };
}

export function createDbCarePlanWriter(database: ReturnType<typeof getDb>): CarePlanWriter {
  const reader: CarePlanReader = {
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
    async getSection(clinicId, patientId, sectionId) {
      const [section] = await database
        .select(sectionSelection())
        .from(carePlanSections)
        .where(and(eq(carePlanSections.id, sectionId), eq(carePlanSections.clinicId, clinicId), eq(carePlanSections.patientId, patientId)));
      return section;
    },
    async listSections(clinicId, patientId) {
      return database.select(sectionSelection()).from(carePlanSections)
        .where(and(eq(carePlanSections.clinicId, clinicId), eq(carePlanSections.patientId, patientId)))
        .orderBy(asc(carePlanSections.id));
    },
    async listVersions(clinicId, patientId, sectionId) {
      return database
        .select({
          id: carePlanSectionVersions.id, clinicId: carePlanSectionVersions.clinicId, patientId: carePlanSectionVersions.patientId,
          sectionId: carePlanSectionVersions.sectionId, versionNumber: carePlanSectionVersions.versionNumber, content: carePlanSectionVersions.content,
          changeType: carePlanSectionVersions.changeType, revertedFromVersion: carePlanSectionVersions.revertedFromVersion,
          changedByUserId: carePlanSectionVersions.changedByUserId, createdAt: carePlanSectionVersions.createdAt,
        })
        .from(carePlanSectionVersions)
        .where(and(eq(carePlanSectionVersions.clinicId, clinicId), eq(carePlanSectionVersions.patientId, patientId), eq(carePlanSectionVersions.sectionId, sectionId)))
        .orderBy(asc(carePlanSectionVersions.versionNumber));
    },
    async getVersion(clinicId, patientId, sectionId, versionNumber) {
      const [version] = await database
        .select({
          id: carePlanSectionVersions.id, clinicId: carePlanSectionVersions.clinicId, patientId: carePlanSectionVersions.patientId,
          sectionId: carePlanSectionVersions.sectionId, versionNumber: carePlanSectionVersions.versionNumber, content: carePlanSectionVersions.content,
          changeType: carePlanSectionVersions.changeType, revertedFromVersion: carePlanSectionVersions.revertedFromVersion,
          changedByUserId: carePlanSectionVersions.changedByUserId, createdAt: carePlanSectionVersions.createdAt,
        })
        .from(carePlanSectionVersions)
        .where(and(
          eq(carePlanSectionVersions.clinicId, clinicId), eq(carePlanSectionVersions.patientId, patientId),
          eq(carePlanSectionVersions.sectionId, sectionId), eq(carePlanSectionVersions.versionNumber, versionNumber),
        ));
      return version;
    },
  };

  return {
    ...reader,
    async applyVersionedUpdate(input) {
      return database.transaction(async (tx) => {
        const nextVersion = input.baseVersion + 1;
        const result = await tx.update(carePlanSections)
          .set({ content: input.content, currentVersion: nextVersion, updatedByUserId: input.actorUserId })
          .where(and(
            eq(carePlanSections.id, input.sectionId), eq(carePlanSections.clinicId, input.clinicId),
            eq(carePlanSections.patientId, input.patientId), eq(carePlanSections.currentVersion, input.baseVersion),
          ));
        if (result.rowsAffected !== 1) return undefined;

        await tx.insert(carePlanSectionVersions).values({
          clinicId: input.clinicId, patientId: input.patientId, sectionId: input.sectionId, versionNumber: nextVersion,
          content: input.content, changeType: input.changeType, revertedFromVersion: input.revertedFromVersion ?? null,
          changedByUserId: input.actorUserId,
        });
        await tx.insert(auditLogs).values({
          clinicId: input.clinicId, patientId: input.patientId, actorUserId: input.actorUserId,
          action: input.auditAction, targetType: "care_plan_section", targetId: String(input.sectionId),
          metadata: {
            source: input.changeType === "edit" ? "P2-C04" : "P2-C06",
            baseVersion: input.baseVersion, nextVersion, revertedFromVersion: input.revertedFromVersion ?? null,
          },
        });
        const [updated] = await tx.select(sectionSelection()).from(carePlanSections)
          .where(and(eq(carePlanSections.id, input.sectionId), eq(carePlanSections.clinicId, input.clinicId)));
        return updated;
      });
    },
  };
}
