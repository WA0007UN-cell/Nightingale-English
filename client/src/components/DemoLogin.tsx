/**
 * Care Canvas entry reminder: Phase 1 uses an explicit demo identity choice
 * instead of exposing a role switcher inside the patient workspace. This is a
 * visual demo boundary; server authentication and RBAC arrive in Phase 2.
 */
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { roleMeta, type DemoRole } from "@/lib/demoData";

const demoRoles: DemoRole[] = ["Clinician", "Staff", "Patient", "Admin"];

const roleDescriptions: Record<DemoRole, string> = {
  Clinician: "Review clinical signals, resolve care-plan questions, and own decisions.",
  Staff: "Work through assigned follow-up, patient updates, and team coordination.",
  Patient: "See approved next steps and the care context shared with you.",
  Admin: "Review governance signals and operational traceability without clinical actions.",
};

const roleInitials: Record<DemoRole, string> = {
  Clinician: "RP",
  Staff: "NL",
  Patient: "MC",
  Admin: "AM",
};

export function DemoLogin({ onSignIn }: { onSignIn: (role: DemoRole) => void }) {
  const [selectedRole, setSelectedRole] = useState<DemoRole>("Clinician");

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
                  <small>{roleDescriptions[role]}</small>
                </span>
                <span className="demo-role-check" aria-hidden="true">{isSelected ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>

        <div className="demo-login-note">
          <ShieldCheck aria-hidden="true" size={17} />
          <span>Phase 1 demo identity only. Server-enforced authentication and RBAC follow in Phase 2.</span>
        </div>
        <button className="demo-login-submit" type="button" onClick={() => onSignIn(selectedRole)}>
          Enter {roleMeta[selectedRole].shortLabel} workspace <ArrowRight aria-hidden="true" size={17} />
        </button>
      </section>
      <aside className="demo-login-aside" aria-label="Nightingale demo principles">
        <span className="aside-index">01</span>
        <p className="eyebrow">ONE ROLE · ONE FOCUS</p>
        <h2>Start with the action that matters.</h2>
        <p>Glance View keeps the first decision visible, then lets each role follow its own evidence trail.</p>
        <div className="aside-line" />
        <span className="aside-caption">Nightingale English · Phase 1</span>
      </aside>
    </main>
  );
}
