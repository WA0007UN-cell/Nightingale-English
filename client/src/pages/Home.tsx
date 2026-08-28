/**
 * Care Canvas page reminder: use a calm, asymmetric clinical workbench.
 * Glance View holds one primary action and at most two secondary actions;
 * the Timeline remains the readable source-of-truth layer below.
 */
import { useMemo, useState } from "react";
import {
  Bell,
  BookOpenText,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FileText,
  HeartPulse,
  HelpCircle,
  History,
  Home as HomeIcon,
  LogOut,
  Menu,
  MessageSquareText,
  Search,
  Settings2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { DemoLogin } from "@/components/DemoLogin";
import { GlanceCard } from "@/components/GlanceCard";
import { PersistedFoundationStatus } from "@/components/PersistedFoundationStatus";
import { AssignedTaskList } from "@/components/staff/AssignedTaskList";
import { TaskList } from "@/components/TaskList";
import { TimelineEntry } from "@/components/TimelineEntry";
import { getRoleCards, getRoleTasks, getRoleTimeline } from "@/lib/roleAccess";
import { toast } from "sonner";
import {
  glanceCards,
  patient,
  patientContext,
  roleMeta,
  tasks,
  timelineEntries,
  type DemoRole,
} from "@/lib/demoData";

const roleNavItems: Record<DemoRole, { label: string; icon: typeof HomeIcon; active?: boolean }[]> = {
  Clinician: [
    { label: "Workspace", icon: HomeIcon, active: true },
    { label: "Patients", icon: UsersRound },
    { label: "Care notes", icon: FileText },
    { label: "Team activity", icon: MessageSquareText },
  ],
  Staff: [
    { label: "My workspace", icon: HomeIcon, active: true },
    { label: "My tasks", icon: ClipboardCheck },
    { label: "Patient updates", icon: MessageSquareText },
    { label: "Team activity", icon: UsersRound },
  ],
  Patient: [
    { label: "My care", icon: HomeIcon, active: true },
    { label: "Shared plan", icon: FileText },
    { label: "My updates", icon: MessageSquareText },
  ],
  Admin: [
    { label: "Governance", icon: HomeIcon, active: true },
    { label: "Audit", icon: History },
    { label: "Access scope", icon: ShieldCheck },
    { label: "Team activity", icon: UsersRound },
  ],
};

const roleMembers: Record<DemoRole, { name: string; initials: string; title: string }> = {
  Clinician: { name: "Dr. Ravi Patel", initials: "RP", title: "Clinician" },
  Staff: { name: "Nora Lewis", initials: "NL", title: "Staff" },
  Patient: { name: "Maya Chen", initials: "MC", title: "Patient" },
  Admin: { name: "Alex Morgan", initials: "AM", title: "Admin" },
};

export default function Home() {
  const [role, setRole] = useState<DemoRole | null>(null);
  const [focusedEntryId, setFocusedEntryId] = useState<string | null>(null);

  const roleCards = useMemo(() => role ? getRoleCards(role, glanceCards) : [], [role]);
  const primaryCard = roleCards.find((card) => card.position === "primary");
  const secondaryCards = roleCards.filter((card) => card.position === "secondary");
  const visibleEntries = useMemo(() => role ? getRoleTimeline(role, timelineEntries) : [], [role]);
  const roleTasks = role ? getRoleTasks(role, tasks) : [];
  const activeMember = role ? roleMembers[role] : roleMembers.Clinician;
  const activeSourceId = role === "Patient" ? "clinician-plan" : role === "Admin" ? "staff-escalation" : "ai-nurse-summary";

  function openSource(entryId: string) {
    if (!visibleEntries.some((entry) => entry.id === entryId)) {
      toast.warning("This source is not available for this role", {
        description: "The workspace only opens evidence within the signed-in role's access scope.",
      });
      return;
    }
    setFocusedEntryId(entryId);
    window.setTimeout(() => {
      document.getElementById(entryId)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 40);
    toast.success("Opened linked evidence", {
      description: "The highlighted Timeline entry is the traceable source for this action.",
    });
  }

  function signIn(nextRole: DemoRole) {
    setRole(nextRole);
    setFocusedEntryId(null);
    toast.message(`Signed in as ${roleMembers[nextRole].name}`, {
      description: "Role selection is a visual demo. Server-enforced workflows are introduced incrementally in Phase 2.",
    });
  }

  function signOut() {
    setRole(null);
    setFocusedEntryId(null);
  }

  function showPlannedFeature(feature: string) {
    toast.info(`${feature} is planned`, {
      description: "This visual demo keeps the product flow visible while persistent workflows are introduced incrementally in Phase 2.",
    });
  }

  if (!role) return <DemoLogin onSignIn={signIn} />;

  return (
    <div className="nightingale-shell">
      <aside className="app-rail" aria-label="Primary navigation">
        <div className="rail-brand">
          <BrandMark className="brand-mark" />
          <span className="brand-wordmark">nightingale</span>
        </div>

        <nav className="rail-navigation">
          {roleNavItems[role].map((item) => {
            const Icon = item.icon;
            return (
              <button className={`rail-nav-item ${item.active ? "is-active" : ""}`} type="button" key={item.label} onClick={() => !item.active && showPlannedFeature(item.label)}>
                <Icon aria-hidden="true" size={19} strokeWidth={2.15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

          <div className="rail-footer">
            <button className="rail-nav-item" type="button" onClick={() => showPlannedFeature("Support")}><HelpCircle aria-hidden="true" size={19} /><span>Support</span></button>
          </div>
      </aside>

      <main className="care-workbench">
        <header className="workbench-header">
          <button className="mobile-menu" type="button" aria-label="Open navigation" onClick={() => showPlannedFeature("Navigation drawer")}><Menu size={21} /></button>
          <div className="breadcrumb"><span>Patients</span><span>/</span><strong>Care workspace</strong></div>
          <div className="header-actions">
            <button className="header-icon-button" type="button" aria-label="Search" onClick={() => showPlannedFeature("Search")}><Search size={19} /></button>
            <button className="header-icon-button notification-button" type="button" aria-label="Notifications" onClick={() => showPlannedFeature("Notifications")}><Bell size={19} /><i /></button>
            <button className="header-icon-button" type="button" aria-label="Settings" onClick={() => showPlannedFeature("Settings")}><Settings2 size={19} /></button>
            <button className="header-user-menu" type="button" aria-label={`Sign out as ${activeMember.name}`} onClick={signOut}>
              <span className="header-user-avatar">{activeMember.initials}</span>
              <span className="header-user-copy"><strong>{activeMember.name}</strong><small>{roleMeta[role].shortLabel}</small></span>
              <LogOut aria-hidden="true" size={15} />
            </button>
          </div>
        </header>

        <section className="patient-banner">
          <div className="patient-identity">
            <div className="patient-avatar" aria-label="Synthetic demo patient initials">{patient.initials}</div>
            <div>
              <div className="patient-name-row"><h1 className="patient-name">{patient.name}</h1><span>SYNTHETIC DEMO DATA</span></div>
              <p>{patient.pronouns} · DOB {patient.dateOfBirth} · {patient.patientId}</p>
              <p className="patient-clinic"><ShieldCheck aria-hidden="true" size={14} /> {patient.clinic}</p>
            </div>
          </div>
          <div className="patient-banner-meta">
            <button className="date-button" type="button" onClick={() => showPlannedFeature("Date filtering")}><CalendarDays aria-hidden="true" size={16} /> 18 February 2026 <ChevronDown aria-hidden="true" size={14} /></button>
            <span className="data-disclosure">Prototype · Synthetic data only</span>
            <PersistedFoundationStatus />
          </div>
        </section>

        <section className="glance-section" aria-labelledby="glance-title">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">PRIORITISED CONTEXT</p>
              <h2 id="glance-title">Glance View</h2>
              <p className="section-helper">One action, one reason, one traceable source.</p>
            </div>
            <button type="button" className="quiet-button" onClick={() => toast.message("Priority explanation", { description: primaryCard?.scoreExplanation ?? "Patient and Admin views do not show internal risk scoring." })}><BookOpenText aria-hidden="true" size={16} /> How this is prioritised</button>
          </div>

          {primaryCard && (
            <div className="glance-layout">
              <GlanceCard card={primaryCard} primary onOpenSource={openSource} />
              <div className="secondary-card-stack">
                {secondaryCards.map((card) => <GlanceCard key={card.id} card={card} onOpenSource={openSource} />)}
              </div>
            </div>
          )}

          {primaryCard && primaryCard.overflowCount > 0 && (
            <button type="button" className="overflow-context" onClick={() => openSource("staff-escalation")}>
              <span className="overflow-plus">+</span>
              <span><strong>{primaryCard.overflowCount} additional prioritised items</strong><small>Open the Timeline to review more context</small></span>
              <ChevronDown aria-hidden="true" size={18} />
            </button>
          )}
        </section>

        <section className="context-strip" aria-label="Patient care context">
          {patientContext.map((item) => (
            <div className="context-metric" key={item.label}>
              <span className={`metric-dot tone-${item.tone}`} />
              <span className="metric-copy"><small>{item.label}</small><strong>{item.value}</strong></span>
            </div>
          ))}
          <div className="context-strip-note"><HeartPulse aria-hidden="true" size={16} /> Care context is source-linked, not diagnostic.</div>
        </section>

        <section className="lower-workspace">
          <div className="timeline-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">SOURCE OF TRUTH</p><h2>Longitudinal timeline</h2></div>
              <button type="button" className="filter-button" onClick={() => showPlannedFeature("Timeline filters")}>All entries <ChevronDown aria-hidden="true" size={15} /></button>
            </div>
            <p className="timeline-description">Every highlighted action points back to an authorised, timestamped record.</p>
            <div className="timeline-list">
              {visibleEntries.map((entry) => <TimelineEntry key={entry.id} entry={entry} isFocused={entry.id === focusedEntryId} />)}
            </div>
          </div>

          <aside className="context-rail" aria-label="Supporting care context">
            <section className="side-panel today-panel">
              <div className="panel-heading compact"><div><p className="eyebrow">{role === "Patient" ? "SHARED CARE" : role === "Admin" ? "GOVERNANCE" : role === "Staff" ? "PERSISTED TASKS" : "ACTIVE WORK"}</p><h2>{role === "Patient" ? "Your next steps" : role === "Admin" ? "Review queue" : "My tasks"}</h2></div><span className="count-badge">{role === "Staff" ? "Live" : roleTasks.length}</span></div>
              {role === "Staff" ? (
                <AssignedTaskList />
              ) : roleTasks.length > 0 ? (
                <TaskList tasks={roleTasks} onOpenTask={(task) => toast.message(task.title, { description: `${task.status} · ${task.assignee} · ${task.due}` })} />
              ) : (
                <div className="task-empty">
                  <strong>{role === "Patient" ? "No new shared steps" : "No open governance tasks"}</strong>
                  <span>{role === "Patient" ? "Your care team will post approved actions here." : "Audit and access events are available in the governance area."}</span>
                </div>
              )}
              <button className="side-panel-link" type="button" onClick={() => showPlannedFeature(role === "Patient" ? "Shared care plan" : role === "Admin" ? "Governance log" : "Task board")}>{role === "Patient" ? "Open shared plan" : role === "Admin" ? "Open governance log" : "Open task board"} <span>→</span></button>
            </section>

            <section className="side-panel evidence-panel">
              <div className="evidence-art" aria-hidden="true"><i /><b /><em /></div>
              <p className="eyebrow">TRACEABILITY</p>
              <h3>{role === "Patient" ? "Your shared plan carries its source." : "Every recommendation carries its evidence."}</h3>
              <p>Open a source link to review the authorised entry, author and time before taking action.</p>
              <button type="button" onClick={() => openSource(activeSourceId)}>View linked source <span>→</span></button>
            </section>

            <section className="side-panel phase-panel">
              <span className="phase-icon"><ShieldCheck size={17} /></span>
              <div><strong>Demo identity boundary</strong><p>Role switching is visual only. Server-enforced workflows are introduced incrementally in Phase 2.</p></div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
