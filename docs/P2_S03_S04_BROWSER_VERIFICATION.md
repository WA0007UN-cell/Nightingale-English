# P2-S03/P2-S04 Browser Verification

On the development preview, a synthetic Staff session was created through the development-only preview flow. The Staff user selected an authorised clinician Timeline source, submitted the following synthetic internal escalation, and saw the persisted escalation appear in the Staff activity list:

> Synthetic escalation: request clinician review of the scheduled follow-up context.

The escalation displayed its **View authorised source** action. Selecting that action scrolled to the corresponding persisted clinician source and applied the visible focus treatment. The source and escalation activity are rendered only in the Staff workflow; they are not included in the Patient view.

After the source-link implementation was moved into the main Timeline, the Staff page was reopened and the protected task/escalation queries entered their explicit loading states while the current-tab development preview token was being re-established. No local fallback or Patient-visible internal escalation content was rendered during this state.

The final Staff interaction selected **View authorised source** from the persisted escalation. The viewport moved to the actual **Longitudinal timeline** entry titled **Authorised clinician source** and that entry displayed the existing focused Timeline treatment. This confirms the link no longer targets a parallel source list.
