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
  Menu,
  MessageSquareText,
  Search,
  Settings2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { GlanceCard } from "@/components/GlanceCard";
import { TaskList } from "@/components/TaskList";
import { TimelineEntry } from "@/components/TimelineEntry";
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

const roles: DemoRole[] = ["Clinician", "Staff", "Patient", "Admin"];

const navItems = [
  { label: "Workspace", icon: HomeIcon, active: true },
  { label: "Patients", icon: UsersRound, active: false },
  { label: "My tasks", icon: ClipboardCheck, active: false },
  { label: "Care notes", icon: FileText, active: false },
  { label: "Team activity", icon: MessageSquareText, active: false },
  { label: "Audit", icon: History, active: false },
];

export default function Home() {
  const [role, setRole] = useState<DemoRole>("Clinician");
  const [focusedEntryId, setFocusedEntryId] = useState<string | null>(null);

  const roleCards = useMemo(() => glanceCards.filter((card) => card.role === role), [role]);
  const primaryCard = roleCards.find((card) => card.position === "primary");
  const secondaryCards = roleCards.filter((card) => card.position === "secondary");
  const roleTasks = role === "Patient" ? tasks.filter((task) => task.status !== "WAITING") : tasks;

  function openSource(entryId: string) {
    setFocusedEntryId(entryId);
    window.setTimeout(() => {
      document.getElementById(entryId)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 40);
    toast.success("Opened linked evidence", {
      description: "The highlighted Timeline entry is the traceable source for this action.",
    });
  }

  function changeRole(nextRole: DemoRole) {
    setRole(nextRole);
    setFocusedEntryId(null);
    toast.message(`Demo role: ${nextRole}`, {
      description: "This visual role state changes content only. Server-enforced access is Phase 2 work.",
    });
  }

  function showPlannedFeature(feature: string) {
    toast.info(`${feature} is planned`, {
      description: "This Phase 1 demo keeps the product flow visible; persistent workflows follow in Phase 2.",
    });
  }

  return (
    <div className="nightingale-shell">
      <aside className="app-rail" aria-label="Primary navigation">
        <div className="rail-brand">
          <BrandMark className="brand-mark" />
          <span className="brand-wordmark">nightingale</span>
        </div>

        <nav className="rail-navigation">
          {navItems.map((item) => {
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
          <div className="rail-divider" />
          <button className="rail-user" type="button" aria-label="Open current user menu" onClick={() => showPlannedFeature("Account settings")}>
            <span className="rail-user-avatar">RP</span>
            <span><strong>Dr. Patel</strong><small>Clinician</small></span>
            <ChevronDown aria-hidden="true" size={15} />
          </button>
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
          </div>
        </header>

        <section className="patient-banner">
          <div className="patient-identity">
            <div className="patient-avatar" aria-label="Synthetic demo patient initials">{patient.initials}</div>
            <div>
              <div className="patient-name-row"><h1>{patient.name}</h1><span>SYNTHETIC DEMO DATA</span></div>
              <p>{patient.pronouns} · DOB {patient.dateOfBirth} · {patient.patientId}</p>
              <p className="patient-clinic"><ShieldCheck aria-hidden="true" size={14} /> {patient.clinic}</p>
            </div>
          </div>
          <div className="patient-banner-meta">
            <button className="date-button" type="button" onClick={() => showPlannedFeature("Date filtering")}><CalendarDays aria-hidden="true" size={16} /> 18 February 2026 <ChevronDown aria-hidden="true" size={14} /></button>
            <span className="data-disclosure">Prototype · Synthetic data only</span>
          </div>
        </section>

        <section className="role-switcher" aria-label="Role demonstration switcher">
          <div className="role-switcher-intro">
            <span>DEMO ROLE</span>
            <strong>{roleMeta[role].label}</strong>
            <p>{roleMeta[role].subtitle}</p>
          </div>
          <div className="role-options">
            {roles.map((option) => (
              <button
                type="button"
                key={option}
                className={role === option ? "is-selected" : ""}
                onClick={() => changeRole(option)}
                aria-pressed={role === option}
              >
                {roleMeta[option].shortLabel}
              </button>
            ))}
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
              {timelineEntries.map((entry) => <TimelineEntry key={entry.id} entry={entry} isFocused={entry.id === focusedEntryId} />)}
            </div>
          </div>

          <aside className="context-rail" aria-label="Supporting care context">
            <section className="side-panel today-panel">
              <div className="panel-heading compact"><div><p className="eyebrow">ACTIVE WORK</p><h2>Today&apos;s tasks</h2></div><span className="count-badge">{roleTasks.length}</span></div>
              <TaskList tasks={roleTasks} onOpenTask={(task) => toast.message(task.title, { description: `${task.status} · ${task.assignee} · ${task.due}` })} />
              <button className="side-panel-link" type="button" onClick={() => showPlannedFeature("Task board")}>Open task board <span>→</span></button>
            </section>

            <section className="side-panel evidence-panel">
              <div className="evidence-art" aria-hidden="true"><i /><b /><em /></div>
              <p className="eyebrow">TRACEABILITY</p>
              <h3>Every recommendation carries its evidence.</h3>
              <p>Open a source link to review the original entry, author and time before taking action.</p>
              <button type="button" onClick={() => openSource("ai-nurse-summary")}>View linked source <span>→</span></button>
            </section>

            <section className="side-panel phase-panel">
              <span className="phase-icon"><ShieldCheck size={17} /></span>
              <div><strong>Phase 1 demo boundary</strong><p>Role switching is visual only. Server-enforced access follows in Phase 2.</p></div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
