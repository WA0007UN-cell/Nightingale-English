import { describe, expect, it } from "vitest";
import { ClinicScopeError } from "../../authz/clinicScope";
import { readAuthorizedAuditEvents } from "./read";
import type { AuditReader } from "./types";

function createReader(role: "Patient" | "Staff" | "Clinician" | "Admin", clinicId = 10): AuditReader {
  return {
    async getMembership(userId, requestedClinicId) {
      return requestedClinicId === clinicId ? { userId, clinicId, role } : undefined;
    },
    async listEvents(requestedClinicId) {
      return [{ id: 1, actor: "Alex Morgan", role: "Admin", action: "care_plan_section_edited", targetEntity: "care_plan_section:9", timestamp: new Date("2026-02-18T10:00:00Z"), clinicScope: requestedClinicId }];
    },
  };
}

describe("Admin audit event scope", () => {
  it("returns metadata-only events for a same-clinic Admin", async () => {
    const events = await readAuthorizedAuditEvents(createReader("Admin"), 7, { clinicId: 10 });
    expect(events[0]).toMatchObject({ actor: "Alex Morgan", role: "Admin", action: "care_plan_section_edited", targetEntity: "care_plan_section:9", clinicScope: 10 });
    expect(events[0]).not.toHaveProperty("metadata");
    expect(events[0]).not.toHaveProperty("content");
  });

  it.each(["Patient", "Staff", "Clinician"] as const)("denies %s from audit events", async (role) => {
    await expect(readAuthorizedAuditEvents(createReader(role), 7, { clinicId: 10 })).rejects.toBeInstanceOf(ClinicScopeError);
  });

  it("denies an Admin requesting another clinic", async () => {
    await expect(readAuthorizedAuditEvents(createReader("Admin"), 7, { clinicId: 99 })).rejects.toBeInstanceOf(ClinicScopeError);
  });
});
