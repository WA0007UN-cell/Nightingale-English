import React from "react";

type EscalationSourceLinkProps = {
  sourceEntryId: number;
  onOpen: (sourceEntryId: number) => void;
};

/** Opens a source already returned by the Staff-authorised escalation context query. */
export function EscalationSourceLink({ sourceEntryId, onOpen }: EscalationSourceLinkProps) {
  return (
    <button className="escalation-source-link" type="button" onClick={() => onOpen(sourceEntryId)}>
      View authorised source <span>→</span>
    </button>
  );
}
