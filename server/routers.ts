import { desc } from "drizzle-orm";
import { auditLogs } from "../drizzle/schema";
import { getDb } from "./db";
import { escalationsRouter } from "./modules/escalations/router";
import { carePlanRouter } from "./modules/carePlan/router";
import { workspaceRouter } from "./modules/workspace/router";
import { tasksRouter } from "./modules/tasks/router";
import { patientRouter } from "./modules/patient/router";
import { auditRouter } from "./modules/audit/router";
import { publicProcedure, router } from "./trpc";

/** This non-sensitive status proves persistence is reachable without returning patient records. */
const foundationRouter = router({
  status: publicProcedure.query(async () => {
    const [latestAudit] = await getDb().select({ createdAt: auditLogs.createdAt }).from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(1);
    return { storage: "connected" as const, observedAt: latestAudit?.createdAt ?? new Date(), syntheticOnly: true };
  }),
});
export const appRouter = router({
  foundation: foundationRouter,
  workspace: workspaceRouter,
  tasks: tasksRouter,
  escalations: escalationsRouter,
  carePlan: carePlanRouter,
  patient: patientRouter,
  audit: auditRouter,
});
export type AppRouter = typeof appRouter;
