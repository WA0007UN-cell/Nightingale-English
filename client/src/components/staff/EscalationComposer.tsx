import { type FormEvent, useState } from "react";
import { AlertTriangle, LoaderCircle, Send, ShieldAlert } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { EscalationSourceLink } from "./EscalationSourceLink";

type EscalationSource = { id: number; authorRole: string; entryType: string; content: string; occurredAt: Date };
type StaffEscalation = { id: number; sourceEntryId: number; content: string; occurredAt: Date };
type EscalationComposerProps = {
  patientId: number;
  context?: { escalations: StaffEscalation[]; sourceEntries: EscalationSource[] };
  isLoading: boolean;
  errorMessage?: string;
  onOpenSource: (sourceEntryId: number) => void;
};

function formatTimestamp(value: Date) {
  return new Date(value).toLocaleString();
}

/**
 * Staff-only internal workflow. Source candidates and escalations are returned
 * by a protected procedure; this component never invents a clinic or actor ID.
 */
export function EscalationComposer({ patientId, context, isLoading, errorMessage, onOpenSource }: EscalationComposerProps) {
  const utils = trpc.useUtils();
  const create = trpc.escalations.create.useMutation({
    onSuccess: async () => {
      setContent("");
      await utils.escalations.context.invalidate({ patientId });
    },
  });
  const [sourceEntryId, setSourceEntryId] = useState<number | null>(null);
  const [content, setContent] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sourceEntryId) return;
    create.mutate({ patientId, sourceEntryId, content });
  }

  if (isLoading) {
    return <div className="escalation-loading"><LoaderCircle aria-hidden="true" size={15} /> Loading authorised escalation context…</div>;
  }

  if (!context) {
    return <div className="staff-task-notice"><ShieldAlert aria-hidden="true" size={14} /><span>{errorMessage ?? "Staff session required to load internal escalation workflow."}</span></div>;
  }

  const { escalations, sourceEntries } = context;
  const canSubmit = Boolean(sourceEntryId && content.trim()) && !create.isPending;

  return (
    <section className="staff-escalation-workflow" aria-labelledby="staff-escalation-title">
      <div className="staff-escalation-heading">
        <div><p className="eyebrow">PERSISTED STAFF ESCALATIONS</p><h3 id="staff-escalation-title">Escalate to care team</h3></div>
        <span className="staff-escalation-badge"><AlertTriangle aria-hidden="true" size={12} /> Internal</span>
      </div>
      <p className="staff-escalation-helper">Choose an authorised source entry, then send a synthetic internal note for clinician review.</p>

      <form className="staff-escalation-form" onSubmit={submit}>
        <label>
          <span>Authorised Timeline source</span>
          <select value={sourceEntryId ?? ""} onChange={(event) => setSourceEntryId(Number(event.target.value) || null)} required>
            <option value="">Choose a source entry</option>
            {sourceEntries.map((entry) => <option key={entry.id} value={entry.id}>{entry.authorRole} · {entry.content.slice(0, 62)}</option>)}
          </select>
        </label>
        <label>
          <span>Internal escalation</span>
          <textarea value={content} maxLength={1200} onChange={(event) => setContent(event.target.value)} placeholder="Write a synthetic escalation for clinician review…" required />
        </label>
        {create.isError ? <p className="staff-task-error" role="alert">{create.error.message}</p> : null}
        <button className="staff-escalation-submit" type="submit" disabled={!canSubmit}>
          {create.isPending ? <LoaderCircle aria-hidden="true" size={14} className="staff-task-spinner" /> : <Send aria-hidden="true" size={14} />}
          Submit escalation
        </button>
      </form>

      <div className="staff-escalation-activity">
        <h4>Internal escalation activity</h4>
        {escalations.length === 0 ? <p className="task-empty"><strong>No persisted escalations</strong><span>Your submitted synthetic escalation will appear here.</span></p> : escalations.map((escalation) => (
          <article className="staff-escalation-item" key={escalation.id}>
            <div><span className="entry-role-pill">STAFF ESCALATION</span><time>{formatTimestamp(escalation.occurredAt)}</time></div>
            <p>{escalation.content}</p>
            <EscalationSourceLink sourceEntryId={escalation.sourceEntryId} onOpen={onOpenSource} />
          </article>
        ))}
      </div>
    </section>
  );
}
