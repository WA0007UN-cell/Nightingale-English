import { describe, expect, it } from "vitest";
import { ClinicScopeError } from "../../authz/clinicScope";
import { CarePlanVersionConflictError, editCarePlanSection, readCarePlanVersionHistory, revertCarePlanVersion } from "./service";
import type { CarePlanSection, CarePlanVersion, CarePlanWriter } from "./types";

function createWriter(role: "Clinician" | "Staff" | "Patient" | "Admin" = "Clinician") {
  let section: CarePlanSection = { id: 41, clinicId: 1, patientId: 11, sectionKey: "follow_up_plan", content: "Version one", currentVersion: 1, updatedByUserId: 7, updatedAt: new Date() };
  const versions: CarePlanVersion[] = [{ id: 1, clinicId: 1, patientId: 11, sectionId: 41, versionNumber: 1, content: "Version one", changeType: "seed", revertedFromVersion: null, changedByUserId: 7, createdAt: new Date() }];
  const audits: string[] = [];
  const writer: CarePlanWriter = {
    async getMembership(userId, clinicId) { return { userId, clinicId, role }; },
    async getPatient() { return { id: 11, clinicId: 1, patientUserId: 3 }; },
    async getSection(_clinicId, _patientId, sectionId) { return sectionId === section.id ? section : undefined; },
    async listSections() { return [section]; },
    async listVersions() { return [...versions]; },
    async getVersion(_clinicId, _patientId, sectionId, versionNumber) { return versions.find((version) => version.sectionId === sectionId && version.versionNumber === versionNumber); },
    async applyVersionedUpdate(input) {
      if (input.sectionId !== section.id || input.baseVersion !== section.currentVersion) return undefined;
      const nextVersion = input.baseVersion + 1;
      section = { ...section, content: input.content, currentVersion: nextVersion, updatedByUserId: input.actorUserId, updatedAt: new Date() };
      versions.push({ id: versions.length + 1, clinicId: input.clinicId, patientId: input.patientId, sectionId: section.id, versionNumber: nextVersion, content: input.content, changeType: input.changeType, revertedFromVersion: input.revertedFromVersion ?? null, changedByUserId: input.actorUserId, createdAt: new Date() });
      audits.push(input.auditAction);
      return section;
    },
  };
  return { writer, getSection: () => section, versions, audits };
}

const editInput = { actorUserId: 7, clinicId: 1, patientId: 11, sectionId: 41, baseVersion: 1, content: "Version two" };

describe("Clinician versioned Care Plan", () => {
  it("increments a version for a current baseVersion and rejects a stale concurrent edit", async () => {
    const { writer, getSection, versions, audits } = createWriter();
    await expect(editCarePlanSection(writer, editInput)).resolves.toMatchObject({ currentVersion: 2, content: "Version two" });
    await expect(editCarePlanSection(writer, editInput)).rejects.toBeInstanceOf(CarePlanVersionConflictError);
    expect(getSection().currentVersion).toBe(2);
    expect(versions.map((version) => version.versionNumber)).toEqual([1, 2]);
    expect(audits).toEqual(["care_plan_section_edited"]);
  });

  it("reverts by creating a new version without deleting historical snapshots", async () => {
    const { writer, versions, audits } = createWriter();
    await editCarePlanSection(writer, editInput);
    await expect(revertCarePlanVersion(writer, { actorUserId: 7, clinicId: 1, patientId: 11, sectionId: 41, baseVersion: 2, targetVersion: 1 })).resolves.toMatchObject({ currentVersion: 3, content: "Version one" });
    expect(versions.map((version) => [version.versionNumber, version.changeType, version.revertedFromVersion])).toEqual([[1, "seed", null], [2, "edit", null], [3, "revert", 1]]);
    expect(audits).toEqual(["care_plan_section_edited", "care_plan_version_reverted"]);
  });

  it.each(["Staff", "Patient", "Admin"] as const)("blocks %s from Care Plan changes", async (role) => {
    const { writer } = createWriter(role);
    await expect(editCarePlanSection(writer, editInput)).rejects.toBeInstanceOf(ClinicScopeError);
  });

  it("limits version history to the current Clinician clinic and section", async () => {
    const { writer } = createWriter();
    await expect(readCarePlanVersionHistory(writer, { actorUserId: 7, clinicId: 1, patientId: 11, sectionId: 41 })).resolves.toHaveLength(1);
  });
});
