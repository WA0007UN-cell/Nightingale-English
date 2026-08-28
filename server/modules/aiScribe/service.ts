import { redactPhi } from "./redact";

export type AiScribeInteraction = "ai_doctor_consult_summary" | "ai_nurse_consult_summary" | "ai_patient_session_summary";
export type AiScribeEntry = {
  interactionType: AiScribeInteraction;
  authorRole: "System";
  visibility: "clinic" | "patient";
  reviewState: "review_required";
  content: string;
  provenancePointer: string;
  sourceEntryId: number;
  redactedSource: string;
};

export type AiScribeInput = {
  sessionId: string;
  sourceEntryId: number;
  interactionType: AiScribeInteraction;
  transcript: string;
  knownNames?: string[];
};

/** Deterministic mock generation. No external provider is called in this Phase 3 slice. */
export function ingestMockAiScribe(input: AiScribeInput): AiScribeEntry {
  const { redactedText } = redactPhi(input.transcript, input.knownNames);
  const visibility = input.interactionType === "ai_patient_session_summary" ? "patient" : "clinic";
  const label = input.interactionType.replaceAll("_", " ");
  return {
    interactionType: input.interactionType,
    authorRole: "System",
    visibility,
    reviewState: "review_required",
    content: `Draft ${label}: ${redactedText}`,
    provenancePointer: `session_id:${input.sessionId}/source_entry_id:${input.sourceEntryId}`,
    sourceEntryId: input.sourceEntryId,
    redactedSource: redactedText,
  };
}
