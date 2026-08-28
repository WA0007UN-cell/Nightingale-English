import React, { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { AssignedTask } from "../../../../server/modules/tasks/types";

export function StaffTaskErrorNotice({ message }: { message: string }) {
  return <span className="staff-task-error" role="alert">{message}</span>;
}

export function TaskStatusButton({ task }: { task: AssignedTask }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const mutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: async () => {
      setErrorMessage(null);
      await utils.tasks.assigned.invalidate();
    },
    onError: (error) => {
      setErrorMessage(error.message || "The task update was not accepted. Refresh and try again.");
    },
  });

  if (task.status === "complete") return <span className="staff-task-state is-complete">Complete</span>;

  const action = task.status === "open" ? "start" : "complete";
  const label = action === "start" ? "Start" : "Complete";

  return (
    <span className="staff-task-action-wrap">
      <button
        className="staff-task-action"
        type="button"
        disabled={mutation.isPending}
        onClick={() => {
          setErrorMessage(null);
          mutation.mutate({ taskId: task.id, action });
        }}
        aria-label={`${label} task: ${task.title}`}
      >
        {mutation.isPending ? <LoaderCircle aria-hidden="true" size={13} className="staff-task-spinner" /> : label}
      </button>
      {errorMessage ? <StaffTaskErrorNotice message={errorMessage} /> : null}
    </span>
  );
}
