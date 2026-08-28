import { Bot, FileSearch } from "lucide-react";

type AiSummary = {
  id: string;
  label: string;
  title: string;
  summary: string;
  sourceEntryId: string;
  sourceLabel: string;
};

const summaries: AiSummary[] = [
  {
    id: "ai-doctor-consult-summary",
    label: "AI DOCTOR CONSULT SUMMARY",
    title: "Doctor–patient consultation summary",
    summary: "Draft summary of the approved follow-up plan and the clinician review context.",
    sourceEntryId: "clinician-plan",
    sourceLabel: "Open clinician source",
  },
  {
    id: "ai-nurse-consult-summary",
    label: "AI NURSE CONSULT SUMMARY",
    title: "Nurse–patient session summary",
    summary: "Draft summary of the reported rash, recent medication context, and missed doses.",
    sourceEntryId: "patient-message",
    sourceLabel: "Open patient source",
  },
  {
    id: "ai-patient-session-summary",
    label: "AI PATIENT SESSION SUMMARY",
    title: "Patient session summary",
    summary: "Draft summary of the patient-reported update prepared for authorised review.",
    sourceEntryId: "patient-message",
    sourceLabel: "Open patient source",
  },
];

export function AiScribeArchive({ onOpenSource }: { onOpenSource: (entryId: string) => void }) {
  return (
    <section className="ai-scribe-archive" aria-labelledby="ai-scribe-archive-title">
      <div className="ai-scribe-heading">
        <div><p className="eyebrow">PHASE 3 · SYNTHETIC MOCK</p><h3 id="ai-scribe-archive-title">AI Scribe archive</h3></div>
        <span className="ai-scribe-count">{summaries.length} DRAFTS</span>
      </div>
      <p className="ai-scribe-disclosure"><Bot aria-hidden="true" size={14} /> System-authored summaries are unreviewed drafts. Original source records remain the source of truth.</p>
      <div className="ai-scribe-list">
        {summaries.map((summary) => <article className="ai-scribe-item" key={summary.id}>
          <div className="ai-scribe-item-top"><span>{summary.label}</span><em>DRAFT · REVIEW REQUIRED</em></div>
          <h4>{summary.title}</h4>
          <p>{summary.summary}</p>
          <button type="button" onClick={() => onOpenSource(summary.sourceEntryId)}><FileSearch aria-hidden="true" size={13} /> {summary.sourceLabel}</button>
        </article>)}
      </div>
    </section>
  );
}
