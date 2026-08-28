/**
 * Care Canvas reminder: each Glance card expresses one role-owned action,
 * one concise reason, and one traceable source — never a miniature patient record.
 */
import { CheckCircle2, CircleAlert, Clock3, FileSearch, ShieldAlert } from "lucide-react";
import type { GlanceCard as GlanceCardModel, Severity } from "@/lib/demoData";

const severityConfig: Record<Severity, { labelClass: string; icon: typeof CircleAlert }> = {
  critical: { labelClass: "is-critical", icon: ShieldAlert },
  high: { labelClass: "is-high", icon: CircleAlert },
  medium: { labelClass: "is-medium", icon: Clock3 },
  routine: { labelClass: "is-routine", icon: CheckCircle2 },
};

interface GlanceCardProps {
  card: GlanceCardModel;
  primary?: boolean;
  onOpenSource?: (entryId: string) => void;
}


export function GlanceCard({ card, primary = false, onOpenSource }: GlanceCardProps) {
  const config = severityConfig[card.severity];
  const SeverityIcon = config.icon;

  return (
    <article className={`glance-card ${primary ? "glance-card-primary" : "glance-card-secondary"}`}>
      <div className="glance-card-topline">
        <span className={`status-chip ${config.labelClass}`}>
          <SeverityIcon aria-hidden="true" size={13} strokeWidth={2.4} />
          {card.label}
        </span>
        {primary && <span className="attention-score">ATTENTION {card.score}</span>}
      </div>

      <div className="glance-card-copy">
        <h3>{card.title}</h3>
        <p>{card.reason}</p>
      </div>

      <div className="glance-card-footer">
        <button className="action-link" type="button" onClick={() => onOpenSource?.(card.sourceEntryId)}>
          <span>{card.action}</span>
        </button>
        <button className="source-link" type="button" onClick={() => onOpenSource?.(card.sourceEntryId)}>
          <FileSearch aria-hidden="true" size={14} />
          <span>{card.sourceLabel}</span>
          <span className="source-time">{card.timeLabel}</span>
        </button>
      </div>
    </article>
  );
}
