import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ClinicScopeError } from "../../authz/clinicScope";
import { getDb } from "../../db";
import { protectedProcedure, router } from "../../trpc";
import { updateAssignedTaskStatus } from "./mutations";
import { readAssignedStaffTasks } from "./read";
import { createDbTaskWriter } from "./repository";

const updateInput = z.object({
  taskId: z.number().int().positive(),
  action: z.enum(["start", "complete"]),
});

function requireSessionClinicId(clinicId: number | undefined) {
  if (!clinicId) throw new TRPCError({ code: "FORBIDDEN", message: "An active clinic session is required for Staff tasks." });
  return clinicId;
}

export const tasksRouter = router({
  assigned: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await readAssignedStaffTasks(createDbTaskWriter(getDb()), ctx.actor.userId, requireSessionClinicId(ctx.actor.clinicId));
    } catch (error) {
      if (error instanceof ClinicScopeError) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
      throw error;
    }
  }),
  updateStatus: protectedProcedure.input(updateInput).mutation(async ({ ctx, input }) => {
    try {
      return await updateAssignedTaskStatus(createDbTaskWriter(getDb()), {
        actorUserId: ctx.actor.userId,
        clinicId: requireSessionClinicId(ctx.actor.clinicId),
        taskId: input.taskId,
        action: input.action,
      });
    } catch (error) {
      if (error instanceof ClinicScopeError) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
      throw error;
    }
  }),
});
