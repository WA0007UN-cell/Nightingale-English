import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { resolve } from "node:path";

export default defineConfig({
  dialect: "sqlite",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations-sqlite",
  dbCredentials: { url: resolve(process.cwd(), process.env.SQLITE_DB_PATH || "data/nightingale.sqlite") },
  verbose: true,
  strict: true,
});
