import { useState } from "react";
import { Clock3, LoaderCircle, ShieldAlert } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { TaskStatusButton } from "./TaskStatusButton";

const STAFF_PREVIEW_TOKEN_KEY = "nightingale_staff_preview_token";

type PreviewSessionResponse = { ok: boolean; previewToken?: string };

function formatDueAt(value: Date | null) {
  return value ? new Date(value).toLocaleString() : "No due date";
}

export function AssignedTaskList() {
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const utils = trpc.useUtils();
  const result = trpc.tasks.assigned.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });

  async function enterSyntheticStaffSession() {
    setIsSigningIn(true);
    setPreviewError(null);
    try {
      const response = await fetch("/api/dev/staff-session", { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error("The synthetic Staff session could not be created.");
      const body = (await response.json()) as PreviewSessionResponse;
      if (!body.ok || !body.previewToken) throw new Error("The synthetic Staff preview token could not be created.");
      window.sessionStorage.setItem(STAFF_PREVIEW_TOKEN_KEY, body.previewToken);
      await utils.tasks.assigned.invalidate();
      setIsSigningIn(false);
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "The synthetic Staff session could not be created.");
      setIsSigningIn(false);
    }
  }

  if (result.isLoading) return <div className="task-empty"><LoaderCircle aria-hidden="true" className="staff-task-spinner" size={16} /><span>Loading assigned tasks…</span></div>;

  if (result.isError) {
    return (
      <>
        <div className="staff-task-notice"><ShieldAlert aria-hidden="true" size={14} /><span>Server Staff session required to load assigned database tasks.</span></div>
        {previewError ? <div className="staff-task-error" role="alert">{previewError}</div> : null}
        {import.meta.env.DEV ? <button className="staff-preview-session-button" type="button" onClick={enterSyntheticStaffSession} disabled={isSigningIn}>{isSigningIn ? "Loading database tasks…" : "Use synthetic Staff preview to load database tasks"}</button> : null}
      </>
    );
  }

  const assignedTasks = result.data?.tasks ?? [];
  if (assignedTasks.length === 0) return <div className="task-empty"><strong>No open assigned tasks</strong><span>New tasks assigned to you will appear here.</span></div>;

  return (
    <div className="staff-assigned-task-list" aria-label="Persisted assigned tasks">
      {assignedTasks.map((task) => (
        <div className="staff-task-row" key={task.id}>
          <span className={`task-status-icon status-${task.status.replace("_", "-")}`}><Clock3 aria-hidden="true" size={14} /></span>
          <span className="task-row-copy"><strong className="task-row-title">{task.title}</strong><span className="task-row-meta">Patient #{task.patientId} · {formatDueAt(task.dueAt)}</span></span>
          <TaskStatusButton task={task} />
        </div>
      ))}
    </div>
  );
}
