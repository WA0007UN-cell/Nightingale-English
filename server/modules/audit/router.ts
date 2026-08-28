import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ClinicScopeError } from "../../authz/clinicScope";
import { getDb } from "../../db";
import { protectedProcedure, router } from "../../trpc";
import { readAuthorizedAuditEvents } from "./read";
import { createDbAuditReader } from "./repository";

export const auditRouter = router({
  list: protectedProcedure.input(z.object({ clinicId: z.number().int().positive(), limit: z.number().int().min(1).max(100).optional() })).query(async ({ ctx, input }) => {
    try {
      return await readAuthorizedAuditEvents(createDbAuditReader(getDb()), ctx.actor.userId, input);
    } catch (error) {
      if (error instanceof ClinicScopeError) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
      throw error;
    }
  }),
});
