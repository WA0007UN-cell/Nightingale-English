/**
 * Care Canvas reminder: the context rail keeps supporting work compact so it
 * cannot compete with the three-card action budget at the top of the page.
 */
import { Check, ChevronRight, Clock3, TimerReset } from "lucide-react";
import type { TaskItem } from "@/lib/demoData";

const statusIcon = {
  OVERDUE: TimerReset,
  "DUE TODAY": Clock3,
  WAITING: Clock3,
  COMPLETE: Check,
};

export function TaskList({ tasks, onOpenTask }: { tasks: TaskItem[]; onOpenTask: (task: TaskItem) => void }) {
  return (
    <div className="task-list">
      {tasks.map((task) => {
        const StatusIcon = statusIcon[task.status];
        return (
          <button className="task-row" type="button" key={task.id} onClick={() => onOpenTask(task)}>
            <span className={`task-status-icon status-${task.status.toLowerCase().replaceAll(" ", "-")}`}>
              <StatusIcon aria-hidden="true" size={14} />
            </span>
            <span className="task-row-copy">
              <span className="task-row-title">{task.title}</span>
              <span className="task-row-meta">{task.assignee} · {task.due}</span>
            </span>
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        );
      })}
    </div>
  );
}
