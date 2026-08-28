import type { ClinicMembership, ScopedPatient, StaffEscalationSourceScope } from "../../authz/clinicScope";

export type EscalationSourceEntry = StaffEscalationSourceScope & {
  authorRole: "Clinician" | "Staff" | "Patient" | "System";
  content: string;
  occurredAt: Date;
};

export type StaffEscalation = {
  id: number;
  clinicId: number;
  patientId: number;
  sourceEntryId: number;
  authorRole: "Staff";
  content: string;
  occurredAt: Date;
};

export type EscalationReader = {
  getMembership(userId: number, clinicId: number): Promise<ClinicMembership | undefined>;
  getPatient(patientId: number, clinicId: number): Promise<ScopedPatient | undefined>;
  getSourceEntry(clinicId: number, patientId: number, sourceEntryId: number): Promise<EscalationSourceEntry | undefined>;
  listEscalations(clinicId: number, patientId: number): Promise<StaffEscalation[]>;
  listSourceEntries(clinicId: number, patientId: number): Promise<EscalationSourceEntry[]>;
};

export type EscalationWriter = EscalationReader & {
  createEscalation(input: {
    clinicId: number;
    patientId: number;
    sourceEntryId: number;
    authorUserId: number;
    content: string;
    occurredAt: Date;
  }): Promise<StaffEscalation>;
  appendAudit(input: {
    clinicId: number;
    patientId: number;
    actorUserId: number;
    action: string;
    targetId: number;
    metadata: Record<string, unknown>;
  }): Promise<void>;
};

export type StaffEscalationContext = { escalations: StaffEscalation[]; sourceEntries: EscalationSourceEntry[]; retrievedAt: Date };
