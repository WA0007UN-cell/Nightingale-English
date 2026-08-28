import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../drizzle/schema";

let client: Client | undefined;
let database: LibSQLDatabase<typeof schema> | undefined;

function databaseUrl() {
  const path = process.env.SQLITE_DB_PATH?.trim() || resolve(process.cwd(), "data/nightingale.sqlite");
  if (path === ":memory:") return "file::memory:";
  mkdirSync(dirname(path), { recursive: true });
  return path.startsWith("file:") ? path : `file:${path}`;
}

/** Returns the server-only local SQLite client without exposing filesystem paths to the browser bundle. */
export function getDb() {
  if (!client) client = createClient({ url: databaseUrl() });
  if (!database) database = drizzle(client, { schema });
  return database;
}

/** Closes the local database during a controlled server shutdown or test cleanup. */
export async function closeDb() {
  if (!client) return;
  client.close();
  client = undefined;
  database = undefined;
}
