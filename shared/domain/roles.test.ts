import { describe, expect, it } from "vitest";
import { roleHasCapability } from "./roles";

describe("role capabilities", () => {
  it("allows a Staff member to update an assigned task but not edit a care plan", () => {
    expect(roleHasCapability("Staff", "update_assigned_task")).toBe(true);
    expect(roleHasCapability("Staff", "edit_care_plan")).toBe(false);
  });

  it("limits a Patient to patient-visible context", () => {
    expect(roleHasCapability("Patient", "read_patient_visible_context")).toBe(true);
    expect(roleHasCapability("Patient", "read_clinic_timeline")).toBe(false);
  });
});
