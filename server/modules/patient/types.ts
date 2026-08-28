export type PatientEntryCandidate = {
  id: number;
  entryType: "clinician" | "staff" | "escalation" | "patient" | "system" | "ai";
  visibility: "clinic" | "patient";
  reviewState: "not_required" | "review_required" | "reviewed" | "resolved" | "approved" | "rejected";
  content: string;
  occurredAt: Date;
};

export type PatientNextStep = {
  id: number;
  content: string;
  occurredAt: Date;
};

export type PatientReader = {
  getPatientScope(actorUserId: number, patientId: number): Promise<{ clinicId: number; patientId: number } | undefined>;
  listPatientEntries(clinicId: number, patientId: number): Promise<PatientEntryCandidate[]>;
};

export type PatientNextStepsResult = {
  steps: PatientNextStep[];
  retrievedAt: Date;
};
