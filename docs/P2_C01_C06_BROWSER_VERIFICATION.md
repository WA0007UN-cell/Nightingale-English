# P2-C01 to P2-C06 Browser Verification

The development preview was tested with synthetic data only. After entering the Clinician workspace and activating the visible synthetic Clinician preview action, the protected review queue and Care Plan appeared through the same server-authorised tRPC path used by the page.

| Workflow | Verified visible result |
|---|---|
| Escalation review | A pending Staff escalation changed from `review_required` to `reviewed`, then to `resolved`; the resolved item left the pending queue. |
| Care Plan edit | Editing the Follow-up plan created version 2 while version 1 remained visible in history. |
| Safe revert | Reverting version 1 created version 3 with `revert from v1`; no historical version was deleted. |
| Concurrency boundary | The deterministic stale `baseVersion` rejection is covered by the Care Plan server service tests, rather than a race-prone browser demonstration. |

The development preview token is synthetic and short-lived. Production requests do not accept this preview-token path.
