import { useState } from "react";
import { CheckCircle2, LoaderCircle, ShieldAlert } from "lucide-react";
import { trpc } from "@/lib/trpc";

const PATIENT_SCOPE = { patientId: 90001 };
const PREVIEW_TOKEN_KEY = "nightingale_preview_token";
type PreviewSessionResponse = { ok: boolean; previewToken?: string };

export function PatientNextSteps() {
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isEnteringPreview, setIsEnteringPreview] = useState(false);
  const nextSteps = trpc.patient.nextSteps.useQuery(PATIENT_SCOPE, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  async function enterSyntheticPatientSession() {
    setIsEnteringPreview(true);
    setPreviewError(null);
    try {
      const response = await fetch("/api/dev/patient-session", { method: "POST", credentials: "same-origin" });
      const body = (await response.json()) as PreviewSessionResponse;
      if (!response.ok || !body.ok || !body.previewToken) throw new Error("The synthetic Patient preview could not be created.");
      window.sessionStorage.setItem(PREVIEW_TOKEN_KEY, body.previewToken);
      window.dispatchEvent(new Event("nightingale:preview-token-ready"));
      await nextSteps.refetch();
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "The synthetic Patient preview could not be created.");
    } finally {
      setIsEnteringPreview(false);
    }
  }

  if (nextSteps.isLoading) return <div className="patient-next-steps-state"><LoaderCircle aria-hidden="true" size={15} /> Loading approved next steps…</div>;
  if (nextSteps.isError) return <div className="patient-next-steps-state"><ShieldAlert aria-hidden="true" size={14} /><span>Server Patient session required to load approved next steps.</span>{previewError ? <small role="alert">{previewError}</small> : null}{import.meta.env.DEV ? <button type="button" onClick={enterSyntheticPatientSession} disabled={isEnteringPreview}>{isEnteringPreview ? "Loading next steps…" : "Use synthetic Patient preview"}</button> : null}</div>;
  if (!nextSteps.data?.steps.length) return <div className="patient-next-steps-state"><CheckCircle2 aria-hidden="true" size={15} /> No approved next steps have been posted.</div>;

  return <div className="patient-next-steps-list" aria-label="Approved patient next steps">
    {nextSteps.data.steps.map((step) => <article className="patient-next-step" key={step.id}>
      <CheckCircle2 aria-hidden="true" size={16} />
      <div><strong>Next step</strong><p>{step.content}</p><time dateTime={step.occurredAt.toISOString()}>{new Date(step.occurredAt).toLocaleDateString()}</time></div>
    </article>)}
    {nextSteps.isFetching ? <small className="patient-next-steps-refresh">Refreshing approved instructions…</small> : null}
  </div>;
}
