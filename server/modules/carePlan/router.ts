import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ClinicScopeError } from "../../authz/clinicScope";
import { getDb } from "../../db";
import { protectedProcedure, router } from "../../trpc";
import { createDbCarePlanWriter } from "./repository";
import { CarePlanValidationError, CarePlanVersionConflictError, editCarePlanSection, readCarePlanVersionHistory, readClinicianCarePlan, revertCarePlanVersion } from "./service";

const patientInput = z.object({ patientId: z.number().int().positive() });
const sectionInput = patientInput.extend({ sectionId: z.number().int().positive() });
const editInput = sectionInput.extend({ baseVersion: z.number().int().positive(), content: z.string().max(4000) });
const revertInput = sectionInput.extend({ baseVersion: z.number().int().positive(), targetVersion: z.number().int().positive() });

function requireClinic(clinicId: number | undefined) {
  if (!clinicId) throw new TRPCError({ code: "FORBIDDEN", message: "An active clinic session is required for Care Plan access." });
  return clinicId;
}

function mapError(error: unknown): never {
  if (error instanceof ClinicScopeError) throw new TRPCError({ code: "FORBIDDEN", message: error.message });
  if (error instanceof CarePlanValidationError) throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
  if (error instanceof CarePlanVersionConflictError) throw new TRPCError({ code: "CONFLICT", message: error.message });
  throw error;
}

export const carePlanRouter = router({
  current: protectedProcedure.input(patientInput).query(async ({ ctx, input }) => {
    try { return await readClinicianCarePlan(createDbCarePlanWriter(getDb()), { actorUserId: ctx.actor.userId, clinicId: requireClinic(ctx.actor.clinicId), ...input }); }
    catch (error) { return mapError(error); }
  }),
  history: protectedProcedure.input(sectionInput).query(async ({ ctx, input }) => {
    try { return await readCarePlanVersionHistory(createDbCarePlanWriter(getDb()), { actorUserId: ctx.actor.userId, clinicId: requireClinic(ctx.actor.clinicId), ...input }); }
    catch (error) { return mapError(error); }
  }),
  edit: protectedProcedure.input(editInput).mutation(async ({ ctx, input }) => {
    try { return await editCarePlanSection(createDbCarePlanWriter(getDb()), { actorUserId: ctx.actor.userId, clinicId: requireClinic(ctx.actor.clinicId), ...input }); }
    catch (error) { return mapError(error); }
  }),
  revert: protectedProcedure.input(revertInput).mutation(async ({ ctx, input }) => {
    try { return await revertCarePlanVersion(createDbCarePlanWriter(getDb()), { actorUserId: ctx.actor.userId, clinicId: requireClinic(ctx.actor.clinicId), ...input }); }
    catch (error) { return mapError(error); }
  }),
});
