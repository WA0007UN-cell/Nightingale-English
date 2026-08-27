import { describe, expect, it } from "vitest";
import { syntheticFoundation } from "./seedDemo";

describe("synthetic Foundation seed definition", () => {
  it("uses fixed .example.test actors and one explicitly synthetic patient", () => {
    const actors = Object.values(syntheticFoundation.actors);
    expect(actors).toHaveLength(4);
    expect(actors.every((actor) => actor.email.endsWith(".example.test"))).toBe(true);
    expect(syntheticFoundation.clinicName).toContain("Synthetic");
    expect(syntheticFoundation.patient.displayName).toBe("Maya Chen");
  });
  it("keeps deterministic timestamps so repeated runs resolve the same source records", () => {
    expect(syntheticFoundation.timestamps.staffEntry.toISOString()).toBe("2026-02-18T08:45:00.000Z");
    expect(syntheticFoundation.timestamps.clinicianEntry.toISOString()).toBe("2026-02-18T09:30:00.000Z");
  });
});
