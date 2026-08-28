import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const demoLoginSource = readFileSync(new URL("./DemoLogin.tsx", import.meta.url), "utf8");

describe("DemoLogin copy", () => {
  it("keeps role options focused on the role name", () => {
    expect(demoLoginSource).not.toContain("roleDescriptions");
    expect(demoLoginSource).not.toContain("Review clinical signals");
    expect(demoLoginSource).not.toContain("Work through assigned follow-up");
    expect(demoLoginSource).not.toContain("See approved next steps");
    expect(demoLoginSource).not.toContain("Review governance signals");
  });

  it("does not show the visual-demo boundary notice", () => {
    expect(demoLoginSource).not.toContain("Role selection is a visual demo");
    expect(demoLoginSource).not.toContain("Server-enforced workflows are introduced incrementally in Phase 2");
  });
});
