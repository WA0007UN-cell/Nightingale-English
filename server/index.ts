import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { SignJWT } from "jose";
import { and, eq } from "drizzle-orm";
import { clinicMembers, users } from "../drizzle/schema";
import { createServer as createViteServer } from "vite";
import { closeDb, getDb } from "./db";
import { appRouter } from "./routers";
import { createTrpcContext } from "./trpc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const projectRoot = path.resolve(__dirname, "..");
  const isProduction = process.env.NODE_ENV === "production";

  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext: createTrpcContext }));

  // Development-only fixture login for the synthetic Staff workflow preview.
  // It is absent from production and still flows through the normal signed-session and scope checks.
  if (!isProduction) {
    // Development-only fixture logins are restricted to known synthetic seed users.
    // The generated token is still verified in server/auth/session.ts before every tRPC procedure.
    const createPreviewSession = (pathName: string, openId: string, role: "Staff" | "Clinician" | "Patient", preview: "synthetic_staff" | "synthetic_clinician" | "synthetic_patient") => {
      app.all(pathName, async (_req, res) => {
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: "JWT_SECRET is not configured." });
        const [actor] = await getDb()
          .select({ id: users.id, clinicId: clinicMembers.clinicId })
          .from(users)
          .innerJoin(clinicMembers, eq(clinicMembers.userId, users.id))
          .where(and(eq(users.openId, openId), eq(clinicMembers.role, role)))
          .limit(1);
        if (!actor) return res.status(404).json({ error: `Synthetic ${role} seed is not available.` });
        const token = await new SignJWT({ userId: String(actor.id), clinicId: String(actor.clinicId), preview })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("10m")
          .sign(new TextEncoder().encode(secret));
        return res.json({ ok: true, syntheticOnly: true, previewToken: token });
      });
    };

    app.all("/api/dev/staff-session", async (_req, res) => {
      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(500).json({ error: "JWT_SECRET is not configured." });
      const [staff] = await getDb()
        .select({ id: users.id, clinicId: clinicMembers.clinicId })
        .from(users)
        .innerJoin(clinicMembers, eq(clinicMembers.userId, users.id))
        .where(and(eq(users.openId, "synthetic-staff-nora"), eq(clinicMembers.role, "Staff")))
        .limit(1);
      if (!staff) return res.status(404).json({ error: "Synthetic Staff seed is not available." });
      const token = await new SignJWT({ userId: String(staff.id), clinicId: String(staff.clinicId), preview: "synthetic_staff" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("10m")
        .sign(new TextEncoder().encode(secret));
      return res.json({ ok: true, syntheticOnly: true, previewToken: token });
    });
    createPreviewSession("/api/dev/clinician-session", "synthetic-clinician-ravi", "Clinician", "synthetic_clinician");
    createPreviewSession("/api/dev/patient-session", "synthetic-patient-maya", "Patient", "synthetic_patient");
  }

  if (isProduction) {
    const staticPath = path.resolve(__dirname, "public");
    app.use(express.static(staticPath));
    app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));
  } else {
    const vite = await createViteServer({
      configFile: path.join(projectRoot, "vite.config.ts"),
      server: { middlewareMode: true, hmr: { server } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT ?? process.env.npm_config_port ?? 3000);
  if (!Number.isInteger(port) || port <= 0) throw new Error("A valid runtime port is required.");

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  const shutdown = async () => { server.close(); await closeDb(); };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}

startServer().catch(console.error);
