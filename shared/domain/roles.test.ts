import { describe, expect, it } from "vitest";
import { roleHasCapability } from "./roles";

describe("clinic role capability lookup", () => {
  it("allows Staff to update an assigned task but not to edit a care plan", () => {
    expect(roleHasCapability("Staff", "update_assigned_task")).toBe(true);
    expect(roleHasCapability("Staff", "edit_care_plan")).toBe(false);
  });

  it("allows only a Clinician to review an escalation", () => {
    expect(roleHasCapability("Clinician", "review_escalation")).toBe(true);
    expect(roleHasCapability("Staff", "review_escalation")).toBe(false);
    expect(roleHasCapability("Patient", "review_escalation")).toBe(false);
    expect(roleHasCapability("Admin", "review_escalation")).toBe(false);
  });

  it("limits a Patient to patient-visible context", () => {
    expect(roleHasCapability("Patient", "read_patient_visible_context")).toBe(true);
    expect(roleHasCapability("Patient", "read_clinic_timeline")).toBe(false);
    expect(roleHasCapability("Patient", "read_audit")).toBe(false);
  });

  it("gives Admin audit visibility without clinical write capabilities", () => {
    expect(roleHasCapability("Admin", "read_audit")).toBe(true);
    expect(roleHasCapability("Admin", "edit_care_plan")).toBe(false);
    expect(roleHasCapability("Admin", "update_assigned_task")).toBe(false);
  });
});
