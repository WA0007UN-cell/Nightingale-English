import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Request, Response } from "express";
import { getActorFromSession, type SessionActor } from "./auth/session";

export type TrpcContext = { req: Request; res: Response; actor?: SessionActor };
export async function createTrpcContext({ req, res }: { req: Request; res: Response }): Promise<TrpcContext> {
  return { req, res, actor: await getActorFromSession(req) };
}
const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.actor) throw new TRPCError({ code: "UNAUTHORIZED", message: "A server session is required to read a patient workspace." });
  return next({ ctx: { ...ctx, actor: ctx.actor } });
});
