import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createServer as createViteServer } from "vite";
import { closeDb } from "./db";
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
