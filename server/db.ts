import mysql, { type Pool } from "mysql2/promise";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema";

let pool: Pool | undefined;
type Database = MySql2Database<typeof schema>;
let database: Database | undefined;

/** Returns the server-only database client without exposing DATABASE_URL to the browser bundle. */
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required before the persisted workspace can run.");
  }

  if (!pool) {
    pool = mysql.createPool({ uri: databaseUrl, connectionLimit: 5, enableKeepAlive: true });
  }
  if (!database) {
    database = drizzle(pool, { schema, mode: "default" });
  }
  return database;
}

/** Closes the lazily-created pool during a controlled server shutdown. */
export async function closeDb() {
  if (!pool) return;
  const activePool = pool;
  pool = undefined;
  database = undefined;
  await activePool.end();
}
