import { describe, expect, it } from "vitest";
import { redactPhi } from "./redact";
import { ingestMockAiScribe } from "./service";

describe("Phase 3 PHI redaction", () => {
  it("masks names, phone numbers, and IC/ID values before mock generation", () => {
    const result = redactPhi("Patient: Maya Chen called +60 12-345 6789. IC: 900101-14-5678. ID ABC-12345.", ["Maya Chen"]);
    expect(result.redactedText).not.toContain("Maya Chen");
    expect(result.redactedText).not.toContain("12-345 6789");
    expect(result.redactedText).not.toContain("900101-14-5678");
    expect(result.redactedText).not.toContain("ABC-12345");
    expect(result.redactedText).toContain("[REDACTED_NAME]");
    expect(result.redactedText).toContain("[REDACTED_PHONE]");
    expect(result.redactedText).toContain("[REDACTED_ID]");
  });

  it("never includes the original transcript in generated content", () => {
    const result = ingestMockAiScribe({ sessionId: "sess-001", sourceEntryId: 42, interactionType: "ai_doctor_consult_summary", transcript: "Dr. Ravi Patel called 012-3456789; ID: A1234567", knownNames: ["Ravi Patel"] });
    expect(result.authorRole).toBe("System");
    expect(result.reviewState).toBe("review_required");
    expect(result.content).not.toContain("012-3456789");
    expect(result.content).not.toContain("A1234567");
  });
});

describe("Phase 3 provenance-linked AI entries", () => {
  it.each(["ai_doctor_consult_summary", "ai_nurse_consult_summary", "ai_patient_session_summary"] as const)("creates %s with deterministic provenance", (interactionType) => {
    const result = ingestMockAiScribe({ sessionId: "sess-007", sourceEntryId: 101, interactionType, transcript: "Follow-up discussed." });
    expect(result.interactionType).toBe(interactionType);
    expect(result.provenancePointer).toBe("session_id:sess-007/source_entry_id:101");
    expect(result.sourceEntryId).toBe(101);
  });
});
