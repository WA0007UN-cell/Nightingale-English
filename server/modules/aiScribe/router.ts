import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { careEntries, clinicMembers } from "../../../drizzle/schema";
import { getDb } from "../../db";
import { protectedProcedure, router } from "../../trpc";
import { ingestMockAiScribe } from "./service";

const interactionType = z.enum(["ai_doctor_consult_summary", "ai_nurse_consult_summary", "ai_patient_session_summary"]);

export const aiScribeRouter = router({
  ingest: protectedProcedure.input(z.object({
    clinicId: z.number().int().positive(), patientId: z.number().int().positive(), sourceEntryId: z.number().int().positive(),
    sessionId: z.string().min(1).max(120), interactionType, transcript: z.string().min(1), knownNames: z.array(z.string()).optional(), occurredAt: z.coerce.date().optional(),
  })).mutation(async ({ ctx, input }) => {
    const database = getDb();
    const [member] = await database.select({ clinicId: clinicMembers.clinicId, role: clinicMembers.role }).from(clinicMembers)
      .where(and(eq(clinicMembers.userId, ctx.actor.userId), eq(clinicMembers.clinicId, input.clinicId)));
    if (!member || !["Admin", "Clinician", "Staff"].includes(member.role)) throw new TRPCError({ code: "FORBIDDEN", message: "AI Scribe ingestion is limited to authorised clinic team members." });
    const generated = ingestMockAiScribe(input);
    const [created] = await database.insert(careEntries).values({
      clinicId: input.clinicId, patientId: input.patientId, sourceEntryId: generated.sourceEntryId, authorRole: generated.authorRole,
      entryType: "ai", aiType: generated.interactionType, provenancePointer: generated.provenancePointer, visibility: generated.visibility,
      reviewState: generated.reviewState, content: generated.content, occurredAt: input.occurredAt ?? new Date(),
    }).$returningId();
    return { id: created?.id, interactionType: generated.interactionType, provenancePointer: generated.provenancePointer, reviewState: generated.reviewState };
  }),
});
