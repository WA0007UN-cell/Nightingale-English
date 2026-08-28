/**
 * Care Canvas entry reminder: Phase 1 uses an explicit demo identity choice
 * instead of exposing a role switcher inside the patient workspace. This is a
 * visual demo boundary; server-enforced workflows are introduced incrementally in Phase 2.
 */
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { roleMeta, type DemoRole } from "@/lib/demoData";
import { getTimeAwareGreeting } from "@/lib/greeting";

const demoRoles: DemoRole[] = ["Clinician", "Staff", "Patient", "Admin"];

const roleInitials: Record<DemoRole, string> = {
  Clinician: "RP",
  Staff: "NL",
  Patient: "MC",
  Admin: "AM",
};

export function DemoLogin({ onSignIn }: { onSignIn: (role: DemoRole) => void }) {
  const [selectedRole, setSelectedRole] = useState<DemoRole>("Clinician");
  const greeting = getTimeAwareGreeting(new Date().getHours());

  return (
    <main className="demo-login-shell">
      <section className="demo-login-card" aria-labelledby="demo-login-title">
        <div className="demo-login-brand">
          <BrandMark />
          <span>nightingale</span>
        </div>
        <p className="eyebrow">CARE CANVAS · SYNTHETIC DEMO</p>
        <h1 id="demo-login-title">Choose your workspace</h1>
        <p className="demo-login-intro">
          Sign in as one care-team role to see only the actions and context intended for that role.
        </p>

        <div className="demo-role-grid" role="radiogroup" aria-label="Choose a demo role">
          {demoRoles.map((role) => {
            const isSelected = selectedRole === role;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`demo-role-option ${isSelected ? "is-selected" : ""}`}
                key={role}
                onClick={() => setSelectedRole(role)}
              >
                <span className="demo-role-avatar">{roleInitials[role]}</span>
                <span className="demo-role-copy">
                  <strong>{roleMeta[role].shortLabel}</strong>
                </span>
                <span className="demo-role-check" aria-hidden="true">{isSelected ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>

        <button className="demo-login-submit" type="button" onClick={() => onSignIn(selectedRole)}>
          Enter {roleMeta[selectedRole].shortLabel} workspace <ArrowRight aria-hidden="true" size={17} />
        </button>
      </section>
      <aside className="demo-login-aside" aria-label="Welcome to Nightingale">
        <span className="aside-index">01</span>
        <p className="eyebrow">{greeting} · NIGHTINGALE</p>
        <h2>Your care workspace is ready.</h2>
        <p>Choose the role you are signing in with to open a focused view of your next actions and authorised care context.</p>
        <div className="aside-line" />
        <div className="welcome-preview"><small>YOU ARE ENTERING</small><strong>{roleMeta[selectedRole].shortLabel} workspace</strong><span>Focused context. A clear next step.</span></div>
      </aside>
    </main>
  );
}
