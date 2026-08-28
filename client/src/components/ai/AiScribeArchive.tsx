import { Bot, FileSearch } from "lucide-react";

type AiSummary = {
  id: string;
  label: string;
  title: string;
  summary: string;
  sourceEntryId: string;
  sourceLabel: string;
  highlights: string[];
};

const summaries: AiSummary[] = [
  {
    id: "ai-doctor-consult-summary",
    label: "AI DOCTOR CONSULT SUMMARY",
    title: "Doctor–patient consultation summary",
    summary: "Draft summary of the approved follow-up plan and the clinician review context.",
    sourceEntryId: "clinician-plan",
    sourceLabel: "Open clinician source",
    highlights: ["Approved follow-up plan remains active", "Clinician review is required before any plan change"],
  },
  {
    id: "ai-nurse-consult-summary",
    label: "AI NURSE CONSULT SUMMARY",
    title: "Nurse–patient session summary",
    summary: "Draft summary of the reported rash, recent medication context, and missed doses.",
    sourceEntryId: "patient-message",
    sourceLabel: "Open patient source",
    highlights: ["New rash reported after acetaminophen", "No systemic symptoms reported in the session"],
  },
  {
    id: "ai-patient-session-summary",
    label: "AI PATIENT SESSION SUMMARY",
    title: "Patient session summary",
    summary: "Draft summary of the patient-reported update prepared for authorised review.",
    sourceEntryId: "patient-message",
    sourceLabel: "Open patient source",
    highlights: ["Two missed doses noted this week", "Follow-up details remain incomplete"],
  },
];

export function AiScribeArchive({ onOpenSource }: { onOpenSource: (entryId: string) => void }) {
  return (
    <section className="ai-scribe-archive" aria-labelledby="ai-scribe-archive-title">
      <div className="ai-scribe-heading">
        <div><p className="eyebrow">PHASE 3 · SYNTHETIC MOCK</p><h3 id="ai-scribe-archive-title">AI extracted highlights</h3></div>
        <span className="ai-scribe-count">{summaries.length} DRAFTS</span>
      </div>
      <p className="ai-scribe-disclosure"><Bot aria-hidden="true" size={14} /> System-authored summaries are unreviewed drafts. Original source records remain the source of truth.</p>
      <div className="ai-scribe-list">
        {summaries.map((summary) => <article className="ai-scribe-item" key={summary.id}>
          <div className="ai-scribe-item-top"><span>{summary.label}</span><em>DRAFT · REVIEW REQUIRED</em></div>
          <h4>{summary.title}</h4>
          <p>{summary.summary}</p>
          <ul className="ai-scribe-highlights" aria-label="AI extracted highlights">{summary.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
          <button type="button" onClick={() => onOpenSource(summary.sourceEntryId)}><FileSearch aria-hidden="true" size={13} /> {summary.sourceLabel}</button>
        </article>)}
      </div>
    </section>
  );
}
