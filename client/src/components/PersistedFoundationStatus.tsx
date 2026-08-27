import React from "react";
import { CircleAlert, DatabaseZap, LoaderCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

/** A deliberately small, non-sensitive proof that the Phase 2 persistence layer answered. */
export function PersistedFoundationStatus() {
  const status = trpc.foundation.status.useQuery(undefined, { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false });
  if (status.isLoading) return <span className="persisted-foundation-status is-loading"><LoaderCircle aria-hidden="true" size={12} /> Checking persisted foundation…</span>;
  if (status.isError || !status.data) return <span className="persisted-foundation-status is-error"><CircleAlert aria-hidden="true" size={12} /> Persisted foundation unavailable</span>;
  return <span className="persisted-foundation-status" title="No patient record is exposed by this status check."><DatabaseZap aria-hidden="true" size={12} /> Persisted foundation connected · {new Date(status.data.observedAt).toLocaleString()}</span>;
}
