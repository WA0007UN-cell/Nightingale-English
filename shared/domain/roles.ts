/**
 * Business-role vocabulary and capabilities shared by Phase 2 policy checks.
 * The server, not the browser, is the final authority for these capabilities.
 */
export const clinicRoles = ["Clinician", "Staff", "Patient", "Admin"] as const;

export type ClinicRole = (typeof clinicRoles)[number];

export type CareCapability =
  | "read_clinic_timeline"
  | "read_patient_visible_context"
  | "update_assigned_task"
  | "create_escalation"
  | "review_escalation"
  | "edit_care_plan"
  | "read_audit";

export const roleCapabilities: Record<ClinicRole, readonly CareCapability[]> = {
  Clinician: [
    "read_clinic_timeline",
    "read_patient_visible_context",
    "review_escalation",
    "edit_care_plan",
  ],
  Staff: [
    "read_clinic_timeline",
    "read_patient_visible_context",
    "update_assigned_task",
    "create_escalation",
  ],
  Patient: ["read_patient_visible_context"],
  Admin: ["read_audit"],
};

export function roleHasCapability(role: ClinicRole, capability: CareCapability) {
  return roleCapabilities[role].includes(capability);
}
