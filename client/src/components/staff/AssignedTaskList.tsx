import { Clock3, LoaderCircle, ShieldAlert } from "lucide-react";
import type { TaskItem } from "@/lib/demoData";
import { TaskList } from "@/components/TaskList";
import { trpc } from "@/lib/trpc";
import { TaskStatusButton } from "./TaskStatusButton";

function formatDueAt(value: Date | null) {
  return value ? new Date(value).toLocaleString() : "No due date";
}

export function AssignedTaskList({
  clinicId,
  fallbackTasks,
  onFallbackOpen,
}: {
  clinicId: number;
  fallbackTasks: TaskItem[];
  onFallbackOpen: (task: TaskItem) => void;
}) {
  const result = trpc.tasks.assigned.useQuery({ clinicId }, { retry: false, refetchOnWindowFocus: false });

  if (result.isLoading) {
    return <div className="task-empty"><LoaderCircle aria-hidden="true" className="staff-task-spinner" size={16} /><span>Loading assigned tasks…</span></div>;
  }

  if (result.isError) {
    return (
      <>
        <div className="staff-task-notice"><ShieldAlert aria-hidden="true" size={14} /><span>Server session required for persisted Staff tasks. Showing the Phase 1 demo list.</span></div>
        <TaskList tasks={fallbackTasks} onOpenTask={onFallbackOpen} />
      </>
    );
  }

  const assignedTasks = result.data?.tasks ?? [];
  if (assignedTasks.length === 0) {
    return <div className="task-empty"><strong>No open assigned tasks</strong><span>New tasks assigned to you will appear here.</span></div>;
  }

  return (
    <div className="staff-assigned-task-list" aria-label="Persisted assigned tasks">
      {assignedTasks.map((task) => (
        <div className="staff-task-row" key={task.id}>
          <span className={`task-status-icon status-${task.status.replace("_", "-")}`}><Clock3 aria-hidden="true" size={14} /></span>
          <span className="task-row-copy"><strong className="task-row-title">{task.title}</strong><span className="task-row-meta">Patient #{task.patientId} · {formatDueAt(task.dueAt)}</span></span>
          <TaskStatusButton clinicId={clinicId} task={task} />
        </div>
      ))}
    </div>
  );
}
