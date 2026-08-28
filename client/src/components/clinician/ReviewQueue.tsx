import { useState } from "react";
import { CheckCircle2, CircleAlert, ClipboardCheck, LoaderCircle, ShieldAlert } from "lucide-react";
import { trpc } from "@/lib/trpc";

const PREVIEW_TOKEN_KEY = "nightingale_preview_token";
type PreviewSessionResponse = { ok: boolean; previewToken?: string };

export function ReviewQueue() {
  const utils = trpc.useUtils();
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isEnteringPreview, setIsEnteringPreview] = useState(false);
  const queue = trpc.escalations.reviewQueue.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const review = trpc.escalations.updateReview.useMutation({
    onSuccess: () => { void utils.escalations.reviewQueue.invalidate(); },
  });

  async function enterSyntheticClinicianSession() {
    setIsEnteringPreview(true); setPreviewError(null);
    try {
      const response = await fetch("/api/dev/clinician-session", { method: "POST", credentials: "same-origin" });
      const body = (await response.json()) as PreviewSessionResponse;
      if (!response.ok || !body.ok || !body.previewToken) throw new Error("The synthetic Clinician preview could not be created.");
      window.sessionStorage.setItem(PREVIEW_TOKEN_KEY, body.previewToken);
      window.dispatchEvent(new Event("nightingale:preview-token-ready"));
      await Promise.all([queue.refetch(), utils.carePlan.current.invalidate({ patientId: 90001 })]);
    } catch (error) { setPreviewError(error instanceof Error ? error.message : "The synthetic Clinician preview could not be created."); }
    finally { setIsEnteringPreview(false); }
  }

  if (queue.isLoading) return <div className="clinician-empty"><LoaderCircle aria-hidden="true" size={15} /> Loading review queue…</div>;
  if (queue.isError) return <div className="clinician-session-state"><ShieldAlert aria-hidden="true" size={14} /><span>Server Clinician session required to load the review queue.</span>{previewError ? <small role="alert">{previewError}</small> : null}{import.meta.env.DEV ? <button type="button" onClick={enterSyntheticClinicianSession} disabled={isEnteringPreview}>{isEnteringPreview ? "Loading review queue…" : "Use synthetic Clinician preview"}</button> : null}</div>;
  if (!queue.data?.length) return <div className="clinician-empty"><CheckCircle2 aria-hidden="true" size={15} /> No pending Staff escalations.</div>;

  return <div className="clinician-review-queue" aria-label="Pending Staff escalation review queue">
    {queue.data.map((escalation) => {
      const next = escalation.reviewState === "review_required" ? "reviewed" : "resolved";
      return <div className="clinician-review-row" key={escalation.id}>
        <ClipboardCheck aria-hidden="true" size={16} /><span><strong>Staff escalation</strong><small>{escalation.content}</small><em>Patient #{escalation.patientId} · {escalation.reviewState.replace("_", " ")}</em></span>
        <button type="button" disabled={review.isPending} onClick={() => review.mutate({ escalationId: escalation.id, nextState: next })}>{review.isPending ? "Saving…" : next === "reviewed" ? "Mark reviewed" : "Resolve"}</button>
      </div>;
    })}
    {review.isError ? <div className="clinician-mutation-error" role="alert"><CircleAlert aria-hidden="true" size={13} /> {review.error.message}</div> : null}
  </div>;
}
