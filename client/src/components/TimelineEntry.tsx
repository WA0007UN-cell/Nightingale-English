/**
 * Care Canvas reminder: the Timeline is the evidence layer; each entry must
 * be visually calm yet make author, source type, and review state explicit.
 */
import { Bot, FileClock, HeartPulse, Stethoscope, UserRound } from "lucide-react";
import type { TimelineEntry as TimelineEntryModel, TimelineType } from "@/lib/demoData";

const entryIcon: Record<TimelineType, typeof Bot> = {
  system: Bot,
  patient: UserRound,
  staff: HeartPulse,
  clinician: Stethoscope,
};

interface TimelineEntryProps {
  entry: TimelineEntryModel;
  isFocused: boolean;
}

export function TimelineEntry({ entry, isFocused }: TimelineEntryProps) {
  const EntryIcon = entryIcon[entry.type];

  return (
    <article id={entry.id} className={`timeline-entry ${isFocused ? "is-focused" : ""}`}>
      <div className={`timeline-node node-${entry.type}`} aria-hidden="true">
        <EntryIcon size={15} strokeWidth={2.1} />
      </div>
      <div className="timeline-entry-card">
        <div className="entry-meta-row">
          <div className="entry-author">
            <span className="entry-author-name">{entry.author}</span>
            <span className="entry-role-pill">{entry.roleLabel}</span>
          </div>
          <time>{entry.date} · {entry.time}</time>
        </div>
        <h3>{entry.title}</h3>
        <p>{entry.content}</p>
        <div className="entry-bottom-row">
          <div className="entry-tags">
            {entry.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          {entry.reviewStatus && (
            <span className={`review-status ${entry.reviewStatus === "REVIEW REQUIRED" ? "is-review" : "is-reviewed"}`}>
              <FileClock aria-hidden="true" size={13} />
              {entry.reviewStatus}
            </span>
          )}
        </div>
        {entry.sourceHint && <div className="entry-source-hint">{entry.sourceHint}</div>}
      </div>
    </article>
  );
}
