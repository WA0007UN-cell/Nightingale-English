import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ClinicScopeError } from "../../authz/clinicScope";
import { getDb } from "../../db";
import { protectedProcedure, router } from "../../trpc";
import { createStaffEscalation, EscalationValidationError } from "./create";
import { readStaffEscalationContext } from "./read";
import { createDbEscalationWriter } from "./repository";
import { EscalationReviewConflictError, isEscalationReviewScopeError, readClinicianReviewQueue, updateClinicianEscalationReview } from "./review";

const patientScopeInput = z.object({ patientId: z.number().int().positive() });
const createInput = patientScopeInput.extend({
  sourceEntryId: z.number().int().positive(),
  content: z.string().max(1200),
});
const reviewInput = z.object({ escalationId: z.number().int().positive(), nextState: z.enum(["reviewed", "resolved"]) });

function requireSessionClinicId(clinicId: number | undefined) {
  if (!clinicId) throw new TRPCError({ code: "FORBIDDEN", message: "An active clinic session is required for Staff escalations." });
  return clinicId;
}

export const escalationsRouter = router({
  reviewQueue: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await readClinicianReviewQueue(createDbEscalationWriter(getDb()), ctx.actor.userId, requireSessionClinicId(ctx.actor.clinicId));
    } catch (error) {
      if (isEscalationReviewScopeError(error)) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
      throw error;
    }
  }),
  updateReview: protectedProcedure.input(reviewInput).mutation(async ({ ctx, input }) => {
    try {
      return await updateClinicianEscalationReview(createDbEscalationWriter(getDb()), {
        actorUserId: ctx.actor.userId,
        clinicId: requireSessionClinicId(ctx.actor.clinicId),
        ...input,
      });
    } catch (error) {
      if (isEscalationReviewScopeError(error)) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
      if (error instanceof EscalationReviewConflictError) throw new TRPCError({ code: "CONFLICT", message: error.message });
      throw error;
    }
  }),
  context: protectedProcedure.input(patientScopeInput).query(async ({ ctx, input }) => {
    try {
      return await readStaffEscalationContext(createDbEscalationWriter(getDb()), ctx.actor.userId, requireSessionClinicId(ctx.actor.clinicId), input.patientId);
    } catch (error) {
      if (error instanceof ClinicScopeError) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
      throw error;
    }
  }),
  create: protectedProcedure.input(createInput).mutation(async ({ ctx, input }) => {
    try {
      return await createStaffEscalation(createDbEscalationWriter(getDb()), {
        actorUserId: ctx.actor.userId,
        clinicId: requireSessionClinicId(ctx.actor.clinicId),
        patientId: input.patientId,
        sourceEntryId: input.sourceEntryId,
        content: input.content,
      });
    } catch (error) {
      if (error instanceof ClinicScopeError) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
      if (error instanceof EscalationValidationError) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      throw error;
    }
  }),
});
