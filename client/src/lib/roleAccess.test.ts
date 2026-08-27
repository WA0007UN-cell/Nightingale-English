import { describe, expect, it } from "vitest";
import { glanceCards, tasks, timelineEntries } from "@/lib/demoData";
import { getRoleCards, getRoleTasks, getRoleTimeline } from "@/lib/roleAccess";

describe("demo role access selectors", () => {
  it("returns only cards owned by the signed-in role", () => {
    for (const role of ["Clinician", "Staff", "Patient", "Admin"] as const) {
      const cards = getRoleCards(role, glanceCards);
      expect(cards.length).toBeGreaterThan(0);
      expect(cards.every((card) => card.role === role)).toBe(true);
    }
  });

  it("keeps internal staff and system entries out of the patient timeline", () => {
    const patientEntries = getRoleTimeline("Patient", timelineEntries);
    expect(patientEntries.every((entry) => entry.type === "patient" || entry.type === "clinician")).toBe(true);
    expect(patientEntries.some((entry) => entry.type === "staff" || entry.type === "system")).toBe(false);
  });

  it("shows only role-owned operational tasks", () => {
    expect(getRoleTasks("Clinician", tasks).map((task) => task.id)).toEqual([
      "task-review-summary",
      "task-awaiting-guidance",
    ]);
    expect(getRoleTasks("Staff", tasks).map((task) => task.id)).toEqual([
      "task-call-maya",
      "task-awaiting-guidance",
    ]);
    expect(getRoleTasks("Patient", tasks)).toEqual([]);
    expect(getRoleTasks("Admin", tasks)).toEqual([]);
  });
});
