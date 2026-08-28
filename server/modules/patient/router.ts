import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ClinicScopeError } from "../../authz/clinicScope";
import { getDb } from "../../db";
import { protectedProcedure, router } from "../../trpc";
import { readPatientNextSteps } from "./read";
import { createDbPatientReader } from "./repository";

export const patientRouter = router({
  nextSteps: protectedProcedure
    .input(z.object({ patientId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      try {
        return await readPatientNextSteps(createDbPatientReader(getDb()), ctx.actor.userId, input.patientId);
      } catch (error) {
        if (error instanceof ClinicScopeError) {
          throw new TRPCError({ code: "FORBIDDEN", message: error.message });
        }
        throw error;
      }
    }),
});
