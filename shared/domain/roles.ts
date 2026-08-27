/**
 * P2-F01 is a pure domain rule: it names business roles and the actions each
 * role may request. Phase 2 server procedures must enforce this rule again;
 * client-side code must never treat it as a security boundary.
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

const roleCapabilities: Record<ClinicRole, readonly CareCapability[]> = {
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
