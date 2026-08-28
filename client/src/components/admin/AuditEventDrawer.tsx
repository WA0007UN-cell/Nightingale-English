import { useState } from "react";
import { History, LoaderCircle, ShieldCheck, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Props = { clinicId: number };

export function AuditEventDrawer({ clinicId }: Props) {
  const [open, setOpen] = useState(false);
  const events = trpc.audit.list.useQuery({ clinicId, limit: 50 }, { enabled: open, retry: 1, refetchOnWindowFocus: false });

  return (
    <>
      <button className="side-panel-link" type="button" onClick={() => setOpen(true)}>
        <span><History aria-hidden="true" size={14} /> Open audit events</span><span>→</span>
      </button>
      {open ? (
        <div className="audit-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <aside className="audit-drawer" role="dialog" aria-modal="true" aria-labelledby="audit-drawer-title">
            <div className="audit-drawer-header">
              <div><p className="eyebrow">ADMIN GOVERNANCE</p><h2 id="audit-drawer-title">Audit events</h2><p>Clinic-scoped metadata only. Clinical note bodies and PHI are never shown here.</p></div>
              <button className="header-icon-button" type="button" aria-label="Close audit events" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            <div className="audit-scope-note"><ShieldCheck size={15} /> Clinic scope {clinicId} · Admin access verified server-side</div>
            {events.isLoading ? <div className="audit-empty"><LoaderCircle className="spin" size={18} /> Loading audit events…</div> : events.isError ? <div className="audit-empty">Unable to load audit events within this clinic scope.</div> : events.data?.length ? (
              <div className="audit-event-list">
                {events.data.map((event) => <article className="audit-event" key={event.id}>
                  <div className="audit-event-top"><strong>{event.action}</strong><time dateTime={new Date(event.timestamp).toISOString()}>{new Date(event.timestamp).toLocaleString()}</time></div>
                  <dl><div><dt>Actor</dt><dd>{event.actor}</dd></div><div><dt>Role</dt><dd>{event.role}</dd></div><div><dt>Target</dt><dd>{event.targetEntity}</dd></div><div><dt>Clinic scope</dt><dd>{event.clinicScope}</dd></div></dl>
                </article>)}
              </div>
            ) : <div className="audit-empty">No audit events recorded for this clinic.</div>}
          </aside>
        </div>
      ) : null}
    </>
  );
}
