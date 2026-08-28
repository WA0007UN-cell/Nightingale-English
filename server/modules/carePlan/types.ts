import type { ClinicMembership, ScopedPatient } from "../../authz/clinicScope";

export type CarePlanSection = {
  id: number;
  clinicId: number;
  patientId: number;
  sectionKey: "follow_up_plan";
  content: string;
  currentVersion: number;
  updatedByUserId: number;
  updatedAt: Date;
};

export type CarePlanVersion = {
  id: number;
  clinicId: number;
  patientId: number;
  sectionId: number;
  versionNumber: number;
  content: string;
  changeType: "seed" | "edit" | "revert";
  revertedFromVersion: number | null;
  changedByUserId: number;
  createdAt: Date;
};

export type CarePlanReader = {
  getMembership(userId: number, clinicId: number): Promise<ClinicMembership | undefined>;
  getPatient(patientId: number, clinicId: number): Promise<ScopedPatient | undefined>;
  getSection(clinicId: number, patientId: number, sectionId: number): Promise<CarePlanSection | undefined>;
  listSections(clinicId: number, patientId: number): Promise<CarePlanSection[]>;
  listVersions(clinicId: number, patientId: number, sectionId: number): Promise<CarePlanVersion[]>;
  getVersion(clinicId: number, patientId: number, sectionId: number, versionNumber: number): Promise<CarePlanVersion | undefined>;
};

export type CarePlanWriter = CarePlanReader & {
  applyVersionedUpdate(input: {
    clinicId: number;
    patientId: number;
    sectionId: number;
    baseVersion: number;
    content: string;
    actorUserId: number;
    changeType: "edit" | "revert";
    revertedFromVersion?: number;
    auditAction: "care_plan_section_edited" | "care_plan_version_reverted";
  }): Promise<CarePlanSection | undefined>;
};

export type CarePlanSnapshot = { sections: CarePlanSection[]; retrievedAt: Date };
