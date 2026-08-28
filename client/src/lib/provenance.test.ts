import { describe, expect, it, vi } from "vitest";
import { focusProvenanceSource, resolveProvenanceSourceId } from "./provenance";

describe("provenance source resolution", () => {
  it("resolves a deterministic source entry id", () => {
    expect(resolveProvenanceSourceId("session_id:sess-007/source_entry_id:101")).toBe("101");
    expect(resolveProvenanceSourceId(undefined)).toBeNull();
  });

  it("delegates resolved source to the Timeline focus handler", () => {
    const onOpenSource = vi.fn();
    expect(focusProvenanceSource("session_id:sess-007/source_entry_id:101", onOpenSource)).toBe("101");
    expect(onOpenSource).toHaveBeenCalledWith("101");
  });
});
