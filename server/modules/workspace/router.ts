import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ClinicScopeError } from "../../authz/clinicScope";
import { getDb } from "../../db";
import { protectedProcedure, router } from "../../trpc";
import { readAuthorizedWorkspace } from "./read";
import { createDbWorkspaceReader } from "./repository";

const workspaceInput = z.object({ clinicId: z.number().int().positive(), patientId: z.number().int().positive() });
export const workspaceRouter = router({
  read: protectedProcedure.input(workspaceInput).query(async ({ ctx, input }) => {
    try {
      return await readAuthorizedWorkspace(createDbWorkspaceReader(getDb()), ctx.actor.userId, input);
    } catch (error) {
      if (error instanceof ClinicScopeError) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
      throw error;
    }
  }),
});
