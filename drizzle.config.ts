import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to generate or apply database migrations.");
}

export default defineConfig({
  dialect: "mysql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: { url: databaseUrl },
  verbose: true,
  strict: true,
});
