/**
 * Phase 1 role-scope reminder: these pure selectors keep the visual demo
 * honest. They shape one signed-in role's view only; Phase 2 must repeat the
 * same checks on the server because client filtering is not a security boundary.
 */
import type { DemoRole, GlanceCard, TaskItem, TimelineEntry, TimelineType } from "./demoData";

const visibleTimelineTypes: Record<DemoRole, TimelineType[]> = {
  Clinician: ["system", "patient", "staff", "clinician"],
  Staff: ["system", "patient", "staff", "clinician"],
  Patient: ["patient", "clinician"],
  Admin: ["system", "staff", "clinician"],
};

const roleTaskIds: Record<DemoRole, string[]> = {
  Clinician: ["task-review-summary", "task-awaiting-guidance"],
  Staff: ["task-call-maya", "task-awaiting-guidance"],
  Patient: [],
  Admin: [],
};

const glanceCategoryById: Record<string, "content" | "actions" | "risk"> = {
  "clinician-medication-review": "risk",
  "clinician-plan-conflict": "content",
  "clinician-open-escalation": "actions",
  "staff-call-follow-up": "actions",
  "staff-symptom-capture": "content",
  "staff-awaiting-guidance": "actions",
  "patient-approved-plan": "content",
  "patient-appointment": "actions",
  "patient-care-plan": "content",
  "admin-review-completeness": "content",
  "admin-audit-activity": "content",
  "admin-access-review": "content",
};
export type GlanceCategory = "content" | "actions" | "risk";
export function getGlanceCategory(card: GlanceCard): GlanceCategory {
  return glanceCategoryById[card.id] ?? (card.severity === "critical" || card.severity === "high" ? "risk" : "actions");
}

export function getRoleCards(role: DemoRole, cards: GlanceCard[]) {
  return cards.filter((card) => card.role === role);
}

export function getRoleTimeline(role: DemoRole, entries: TimelineEntry[]) {
  return entries.filter((entry) => visibleTimelineTypes[role].includes(entry.type));
}

export function getRoleTasks(role: DemoRole, taskItems: TaskItem[]) {
  return taskItems.filter((task) => roleTaskIds[role].includes(task.id));
}
