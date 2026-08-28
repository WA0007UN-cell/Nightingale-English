import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ClinicScopeError } from "../../authz/clinicScope";
import { getDb } from "../../db";
import { protectedProcedure, router } from "../../trpc";
import { updateAssignedTaskStatus } from "./mutations";
import { readAssignedStaffTasks } from "./read";
import { createDbTaskWriter } from "./repository";

const clinicInput = z.object({ clinicId: z.number().int().positive() });
const updateInput = clinicInput.extend({
  taskId: z.number().int().positive(),
  action: z.enum(["start", "complete"]),
});

export const tasksRouter = router({
  assigned: protectedProcedure.input(clinicInput).query(async ({ ctx, input }) => {
    try {
      return await readAssignedStaffTasks(createDbTaskWriter(getDb()), ctx.actor.userId, input.clinicId);
    } catch (error) {
      if (error instanceof ClinicScopeError) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
      throw error;
    }
  }),
  updateStatus: protectedProcedure.input(updateInput).mutation(async ({ ctx, input }) => {
    try {
      return await updateAssignedTaskStatus(createDbTaskWriter(getDb()), {
        actorUserId: ctx.actor.userId,
        clinicId: input.clinicId,
        taskId: input.taskId,
        action: input.action,
      });
    } catch (error) {
      if (error instanceof ClinicScopeError) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
      throw error;
    }
  }),
});
