/**
 * Database access for Phase 2. The connection string is read only from the
 * runtime environment; source code never contains a credential.
 */
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import * as schema from "../drizzle/schema";

function createDatabase(connectionString: string) {
  const client = createPool(connectionString);
  return {
    client,
    db: drizzle({ client, schema, mode: "default" }),
  };
}

let connection: ReturnType<typeof createDatabase> | undefined;

export function getDb() {
  if (!connection) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required for Phase 2 persistence.");
    }
    connection = createDatabase(connectionString);
  }
  return connection.db;
}

export async function closeDb() {
  await connection?.client.end();
  connection = undefined;
}
