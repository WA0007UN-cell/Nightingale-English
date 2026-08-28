import { useEffect, useMemo, useState } from "react";
import { CircleAlert, History, LoaderCircle, Save, ShieldAlert, Undo2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const PATIENT_SCOPE = { patientId: 90001 };

export function CarePlanEditor() {
  const scope = useMemo(() => PATIENT_SCOPE, []);
  const utils = trpc.useUtils();
  const plan = trpc.carePlan.current.useQuery(scope, { retry: false, refetchOnWindowFocus: false });
  const section = plan.data?.sections[0];
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { if (section) setDraft(section.content); }, [section?.id, section?.currentVersion]);
  useEffect(() => {
    const reloadProtectedPlan = () => { void plan.refetch(); };
    window.addEventListener("nightingale:preview-token-ready", reloadProtectedPlan);
    return () => window.removeEventListener("nightingale:preview-token-ready", reloadProtectedPlan);
  }, [plan.refetch]);
  const history = trpc.carePlan.history.useQuery(section ? { ...scope, sectionId: section.id } : { ...scope, sectionId: 0 }, { enabled: Boolean(section), retry: false });
  const edit = trpc.carePlan.edit.useMutation({
    onSuccess: async () => { setMessage("Saved as a new immutable version."); await Promise.all([utils.carePlan.current.invalidate(scope), utils.carePlan.history.invalidate()]); },
    onError: (error) => setMessage(error.message),
  });
  const revert = trpc.carePlan.revert.useMutation({
    onSuccess: async () => { setMessage("Revert created a new version; history was preserved."); await Promise.all([utils.carePlan.current.invalidate(scope), utils.carePlan.history.invalidate()]); },
    onError: (error) => setMessage(error.message),
  });

  if (plan.isLoading) return <div className="clinician-empty"><LoaderCircle aria-hidden="true" size={15} /> Loading protected Care Plan…</div>;
  if (plan.isError) return <div className="clinician-session-state"><ShieldAlert aria-hidden="true" size={14} /> Server Clinician session required to access this protected Care Plan.</div>;
  if (!section) return <div className="clinician-empty">No Care Plan section is available for this patient.</div>;

  const isSaving = edit.isPending || revert.isPending;
  return <div className="care-plan-editor">
    <div className="care-plan-heading"><span><strong>Follow-up plan</strong><small>Version {section.currentVersion} · Clinician only</small></span><History aria-hidden="true" size={16} /></div>
    <textarea value={draft} onChange={(event) => { setDraft(event.target.value); setMessage(null); }} aria-label="Follow-up Care Plan content" />
    <div className="care-plan-actions"><button type="button" disabled={isSaving || draft.trim() === section.content} onClick={() => edit.mutate({ ...scope, sectionId: section.id, baseVersion: section.currentVersion, content: draft })}><Save aria-hidden="true" size={14} /> {isSaving ? "Saving…" : "Save new version"}</button></div>
    {message ? <div className={edit.isError || revert.isError ? "clinician-mutation-error" : "care-plan-message"} role="status"><CircleAlert aria-hidden="true" size={13} /> {message}</div> : null}
    <div className="care-plan-history"><p>Version history</p>{history.isLoading ? <small>Loading history…</small> : history.data?.map((version) => <div key={version.id}><span>v{version.versionNumber} · {version.changeType}{version.revertedFromVersion ? ` from v${version.revertedFromVersion}` : ""}</span>{version.versionNumber !== section.currentVersion ? <button type="button" disabled={isSaving} onClick={() => revert.mutate({ ...scope, sectionId: section.id, baseVersion: section.currentVersion, targetVersion: version.versionNumber })}><Undo2 aria-hidden="true" size={12} /> Revert</button> : <em>Current</em>}</div>)}</div>
  </div>;
}
