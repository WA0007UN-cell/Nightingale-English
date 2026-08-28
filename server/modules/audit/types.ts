export type AuditRole = "Patient" | "Staff" | "Clinician" | "Admin" | "System";

export type AuditEventMetadata = {
  id: number;
  actor: string;
  role: AuditRole | "Unknown";
  action: string;
  targetEntity: string;
  timestamp: Date;
  clinicScope: number;
};

export type AuditReader = {
  getMembership(userId: number, clinicId: number): Promise<{ userId: number; clinicId: number; role: AuditRole } | undefined>;
  listEvents(clinicId: number, limit: number): Promise<AuditEventMetadata[]>;
};
export type AuditScope = { clinicId: number; limit?: number };
