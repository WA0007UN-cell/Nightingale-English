export type DemoRole = "Clinician" | "Staff" | "Patient" | "Admin";

export type Severity = "critical" | "high" | "medium" | "routine";

export type TimelineType = "staff" | "clinician" | "patient" | "system";

export interface PatientProfile {
  name: string;
  initials: string;
  dateOfBirth: string;
  patientId: string;
  pronouns: string;
  clinic: string;
  avatarUrl: string;
}

export interface GlanceCard {
  id: string;
  role: DemoRole;
  position: "primary" | "secondary";
  label: string;
  severity: Severity;
  title: string;
  reason: string;
  action: string;
  sourceEntryId: string;
  sourceLabel: string;
  timeLabel: string;
  score: number;
  scoreExplanation: string;
  overflowCount: number;
}

export interface TimelineEntry {
  id: string;
  type: TimelineType;
  author: string;
  roleLabel: string;
  date: string;
  time: string;
  title: string;
  content: string;
  tags: string[];
  reviewStatus?: "REVIEW REQUIRED" | "CLINICIAN REVIEWED";
  sourceHint?: string;
  relatedTask?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  status: "OVERDUE" | "DUE TODAY" | "WAITING" | "COMPLETE";
  assignee: string;
  due: string;
}

export const patient: PatientProfile = {
  name: "Maya Chen",
  initials: "MC",
  dateOfBirth: "14 May 1984",
  patientId: "PT-10428",
  pronouns: "she/her",
  clinic: "Harbour Clinic · Care team B",
  avatarUrl: "/manus-storage/nightingale-maya-avatar_3cd58e18.jpg",
};

export const roleMeta: Record<DemoRole, { label: string; subtitle: string; shortLabel: string }> = {
  Clinician: {
    label: "Clinician workspace",
    shortLabel: "Clinician",
    subtitle: "Clinical decisions, review and care-plan ownership",
  },
  Staff: {
    label: "Staff workspace",
    shortLabel: "Staff",
    subtitle: "Assigned follow-up and care-team coordination",
  },
  Patient: {
    label: "Patient workspace",
    shortLabel: "Patient",
    subtitle: "Approved next steps and shared care context",
  },
  Admin: {
    label: "Admin workspace",
    shortLabel: "Admin",
    subtitle: "Operational visibility and governance context",
  },
};

export const glanceCards: GlanceCard[] = [
  {
    id: "clinician-medication-review",
    role: "Clinician",
    position: "primary",
    label: "HIGH · REVIEW REQUIRED",
    severity: "high",
    title: "Review possible medication reaction",
    reason: "New rash was reported after acetaminophen; no clinician confirmation is recorded.",
    action: "Review source and update the care plan",
    sourceEntryId: "ai-nurse-summary",
    sourceLabel: "AI–patient session summary",
    timeLabel: "2h ago",
    score: 82,
    scoreExplanation: "High candidate severity + recent update + medication entity",
    overflowCount: 4,
  },
  {
    id: "clinician-plan-conflict",
    role: "Clinician",
    position: "secondary",
    label: "PLAN CHECK",
    severity: "medium",
    title: "Confirm current dosage note",
    reason: "The staff follow-up refers to a dosage question that is not yet reflected in the active plan.",
    action: "Compare note with care plan",
    sourceEntryId: "staff-follow-up",
    sourceLabel: "Staff follow-up note",
    timeLabel: "4h ago",
    score: 58,
    scoreExplanation: "Potential plan conflict + clinician decision due today",
    overflowCount: 0,
  },
  {
    id: "clinician-open-escalation",
    role: "Clinician",
    position: "secondary",
    label: "TEAM ESCALATION",
    severity: "medium",
    title: "Reply to staff escalation",
    reason: "A follow-up question has been waiting for clinician guidance since this morning.",
    action: "Open team discussion",
    sourceEntryId: "staff-escalation",
    sourceLabel: "Staff coordination note",
    timeLabel: "6h ago",
    score: 49,
    scoreExplanation: "Staff escalation awaiting response",
    overflowCount: 0,
  },
  {
    id: "staff-call-follow-up",
    role: "Staff",
    position: "primary",
    label: "OVERDUE · ASSIGNED TO YOU",
    severity: "high",
    title: "Call Maya to clarify the rash report",
    reason: "Follow-up was due at 10:00 and the symptom details are still incomplete.",
    action: "Open call checklist",
    sourceEntryId: "staff-follow-up",
    sourceLabel: "Your assigned follow-up task",
    timeLabel: "Overdue by 1h",
    score: 91,
    scoreExplanation: "Your overdue task + recent symptom update",
    overflowCount: 3,
  },
  {
    id: "staff-symptom-capture",
    role: "Staff",
    position: "secondary",
    label: "DUE TODAY",
    severity: "medium",
    title: "Record symptom timing and severity",
    reason: "The care team needs structured details before clinician review.",
    action: "Add follow-up note",
    sourceEntryId: "patient-message",
    sourceLabel: "Patient message",
    timeLabel: "3h ago",
    score: 64,
    scoreExplanation: "Assigned same-day follow-up",
    overflowCount: 0,
  },
  {
    id: "staff-awaiting-guidance",
    role: "Staff",
    position: "secondary",
    label: "WAITING ON CLINICIAN",
    severity: "medium",
    title: "Monitor care-plan guidance",
    reason: "Your escalation is open; capture any new patient update while waiting.",
    action: "View escalation context",
    sourceEntryId: "staff-escalation",
    sourceLabel: "Your team escalation",
    timeLabel: "6h ago",
    score: 42,
    scoreExplanation: "Clinician response pending",
    overflowCount: 0,
  },
  {
    id: "patient-approved-plan",
    role: "Patient",
    position: "primary",
    label: "YOUR NEXT STEP",
    severity: "routine",
    title: "Share an update with your care team",
    reason: "Your care team would like a short update on how your symptoms are changing.",
    action: "Open check-in details",
    sourceEntryId: "patient-message",
    sourceLabel: "Shared care update",
    timeLabel: "Today",
    score: 0,
    scoreExplanation: "Patient view does not show internal clinical risk scores",
    overflowCount: 1,
  },
  {
    id: "patient-appointment",
    role: "Patient",
    position: "secondary",
    label: "UPCOMING",
    severity: "routine",
    title: "Follow-up call is scheduled tomorrow",
    reason: "A care-team follow-up is scheduled for 09:30.",
    action: "View appointment details",
    sourceEntryId: "staff-follow-up",
    sourceLabel: "Care team schedule",
    timeLabel: "Tomorrow",
    score: 0,
    scoreExplanation: "Patient view only shows approved shared instructions",
    overflowCount: 0,
  },
  {
    id: "patient-care-plan",
    role: "Patient",
    position: "secondary",
    label: "CARE PLAN",
    severity: "routine",
    title: "Read your latest approved plan",
    reason: "Your clinician has shared the current care-plan guidance with you.",
    action: "Open shared care plan",
    sourceEntryId: "clinician-plan",
    sourceLabel: "Approved clinician plan",
    timeLabel: "Yesterday",
    score: 0,
    scoreExplanation: "Patient view filters internal care-team context",
    overflowCount: 0,
  },
  {
    id: "admin-review-completeness",
    role: "Admin",
    position: "primary",
    label: "GOVERNANCE VIEW",
    severity: "medium",
    title: "One AI summary is awaiting review",
    reason: "A system-authored summary remains in review-required state for this care team.",
    action: "View governance status",
    sourceEntryId: "ai-nurse-summary",
    sourceLabel: "System review queue",
    timeLabel: "2h ago",
    score: 0,
    scoreExplanation: "Admin view is operational and does not replace clinical judgement",
    overflowCount: 2,
  },
  {
    id: "admin-audit-activity",
    role: "Admin",
    position: "secondary",
    label: "AUDIT READY",
    severity: "routine",
    title: "Three traceable updates today",
    reason: "Notes, task changes and feedback events are recorded with source links.",
    action: "View activity summary",
    sourceEntryId: "staff-escalation",
    sourceLabel: "Care-team audit activity",
    timeLabel: "Today",
    score: 0,
    scoreExplanation: "Operational visibility only",
    overflowCount: 0,
  },
  {
    id: "admin-access-review",
    role: "Admin",
    position: "secondary",
    label: "ACCESS CONTEXT",
    severity: "routine",
    title: "Care-team scope is intact",
    reason: "This demo shows clinic-scoped role states; server enforcement follows in Phase 2.",
    action: "Read access boundary",
    sourceEntryId: "clinician-plan",
    sourceLabel: "Demo access note",
    timeLabel: "Phase 1",
    score: 0,
    scoreExplanation: "Visual demo only; no server-side security claim",
    overflowCount: 0,
  },
];

export const timelineEntries: TimelineEntry[] = [
  {
    id: "ai-nurse-summary",
    type: "system",
    author: "Nightingale AI",
    roleLabel: "AI–PATIENT SUMMARY",
    date: "Today",
    time: "11:42",
    title: "Nurse–patient session summary",
    content: "Maya reported a new rash after taking acetaminophen. The session also notes two missed doses this week. This system summary is linked to the original synthetic session and awaits clinician review.",
    tags: ["MEDICATION", "SYMPTOM", "REVIEW REQUIRED"],
    reviewStatus: "REVIEW REQUIRED",
    sourceHint: "Derived from synthetic Nurse–Patient session · Source available",
    relatedTask: "Review possible medication reaction",
  },
  {
    id: "patient-message",
    type: "patient",
    author: "Maya Chen",
    roleLabel: "PATIENT UPDATE",
    date: "Today",
    time: "10:16",
    title: "Secure check-in message",
    content: "I noticed a mild rash on my arm after I took the pain medicine last night. It is still there this morning, but I do not feel unwell otherwise.",
    tags: ["PATIENT REPORTED", "SYMPTOM"],
    sourceHint: "Synthetic patient message · Shared with care team",
  },
  {
    id: "staff-follow-up",
    type: "staff",
    author: "Nora Lewis",
    roleLabel: "STAFF FOLLOW-UP",
    date: "Today",
    time: "09:08",
    title: "Follow-up call preparation",
    content: "Prepared call checklist to confirm rash timing, severity, associated symptoms and recent medication use. Task is assigned to Nora and was due at 10:00.",
    tags: ["ASSIGNED TO NORA", "DUE TODAY"],
    sourceHint: "Synthetic staff note · Internal care-team context",
    relatedTask: "Call Maya to clarify the rash report",
  },
  {
    id: "staff-escalation",
    type: "staff",
    author: "Nora Lewis",
    roleLabel: "STAFF ESCALATION",
    date: "Today",
    time: "07:21",
    title: "Question for clinician review",
    content: "@Dr. Patel — please advise whether the current plan needs an update after the reported rash. No change has been made to the active plan.",
    tags: ["MENTIONED CLINICIAN", "OPEN"],
    sourceHint: "Synthetic staff note · Internal care-team context",
  },
  {
    id: "clinician-plan",
    type: "clinician",
    author: "Dr. Ravi Patel",
    roleLabel: "CLINICIAN PLAN",
    date: "Yesterday",
    time: "16:34",
    title: "Approved follow-up plan",
    content: "Continue the existing monitoring plan and arrange a follow-up call. Update the care plan if clinically significant new symptoms are confirmed.",
    tags: ["APPROVED", "VERSION 2"],
    reviewStatus: "CLINICIAN REVIEWED",
    sourceHint: "Synthetic clinician entry · Current shared plan",
  },
];

export const tasks: TaskItem[] = [
  {
    id: "task-call-maya",
    title: "Call Maya to clarify the rash report",
    status: "OVERDUE",
    assignee: "Nora Lewis",
    due: "Today · 10:00",
  },
  {
    id: "task-review-summary",
    title: "Review AI nurse-session summary",
    status: "DUE TODAY",
    assignee: "Dr. Ravi Patel",
    due: "Today · 14:00",
  },
  {
    id: "task-awaiting-guidance",
    title: "Await clinician guidance on plan question",
    status: "WAITING",
    assignee: "Nora Lewis",
    due: "Open since 07:21",
  },
];

export const patientContext = [
  { label: "Allergies", value: "Penicillin", tone: "coral" },
  { label: "Current medication", value: "Acetaminophen", tone: "blue" },
  { label: "Open tasks", value: "2 today", tone: "violet" },
  { label: "Last update", value: "11:42", tone: "mint" },
] as const;
