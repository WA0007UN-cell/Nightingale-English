import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useQuery = vi.hoisted(() => vi.fn());
vi.mock("@/lib/trpc", () => ({ trpc: { foundation: { status: { useQuery } } } }));

import { PersistedFoundationStatus } from "./PersistedFoundationStatus";

describe("PersistedFoundationStatus", () => {
  beforeEach(() => useQuery.mockReset());

  it("renders a loading state before the non-sensitive status has returned", () => {
    useQuery.mockReturnValue({ isLoading: true, isError: false, data: undefined });
    expect(renderToStaticMarkup(<PersistedFoundationStatus />)).toContain("Checking persisted foundation");
  });

  it("renders the returned timestamp after the persisted Foundation responds", () => {
    useQuery.mockReturnValue({ isLoading: false, isError: false, data: { observedAt: new Date("2026-02-18T09:30:00.000Z") } });
    expect(renderToStaticMarkup(<PersistedFoundationStatus />)).toContain("Persisted foundation connected");
  });

  it("renders an explicit error state when the status procedure cannot respond", () => {
    useQuery.mockReturnValue({ isLoading: false, isError: true, data: undefined });
    expect(renderToStaticMarkup(<PersistedFoundationStatus />)).toContain("Persisted foundation unavailable");
  });
});
