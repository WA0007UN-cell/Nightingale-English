import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useMutation = vi.hoisted(() => vi.fn());
const invalidate = vi.hoisted(() => vi.fn());
const mutate = vi.hoisted(() => vi.fn());
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ tasks: { assigned: { invalidate } } }),
    tasks: { updateStatus: { useMutation } },
  },
}));

import { StaffTaskErrorNotice, TaskStatusButton } from "./TaskStatusButton";

const task = {
  id: 1,
  clinicId: 10,
  patientId: 20,
  sourceEntryId: 30,
  title: "Confirm check-in",
  status: "open" as const,
  dueAt: new Date("2026-02-18T16:00:00.000Z"),
};

describe("TaskStatusButton", () => {
  beforeEach(() => {
    mutate.mockReset();
    invalidate.mockReset();
    useMutation.mockReturnValue({ isPending: false, mutate });
  });

  it("renders Start for an open task", () => {
    expect(renderToStaticMarkup(<TaskStatusButton clinicId={10} task={task} />)).toContain("Start");
  });

  it("renders a user-visible server error notice for a forbidden failure", () => {
    expect(renderToStaticMarkup(<StaffTaskErrorNotice message="Only a Staff member may update tasks." />)).toContain("Only a Staff member may update tasks.");
  });
});
