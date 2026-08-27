import { defineConfig } from "drizzle-kit";

/**
 * Phase 2 migration configuration. DATABASE_URL is supplied by the runtime
 * environment and is never committed to the repository.
 */
export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
