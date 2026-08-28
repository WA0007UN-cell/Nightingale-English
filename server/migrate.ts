import { createClient } from "@libsql/client";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

async function main() {
  const databasePath = process.env.SQLITE_DB_PATH?.trim() || resolve(process.cwd(), "data/nightingale.sqlite");
  const migrationsPath = resolve(process.cwd(), "drizzle/migrations-sqlite");
  if (databasePath !== ":memory:") mkdirSync(dirname(databasePath), { recursive: true });
  const client = createClient({ url: databasePath === ":memory:" ? "file::memory:" : databasePath.startsWith("file:") ? databasePath : `file:${databasePath}` });

  try {
    await client.execute("PRAGMA foreign_keys = ON");
    await client.execute("CREATE TABLE IF NOT EXISTS __app_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL UNIQUE, appliedAt INTEGER NOT NULL)");
    const appliedResult = await client.execute("SELECT filename FROM __app_migrations");
    const applied = new Set(appliedResult.rows.map((row) => String(row.filename)));
    const migrationFiles = readdirSync(migrationsPath).filter((file) => file.endsWith(".sql")).sort();

    for (const filename of migrationFiles) {
      if (applied.has(filename)) continue;
      const sql = readFileSync(resolve(migrationsPath, filename), "utf8");
      const statements = sql.split("--> statement-breakpoint").map((statement) => statement.trim()).filter(Boolean);
      for (const statement of statements) await client.execute(statement);
      await client.execute({ sql: "INSERT INTO __app_migrations (filename, appliedAt) VALUES (?, ?)", args: [filename, Date.now()] });
      console.log(`Applied SQLite migration ${filename}`);
    }
    console.log(`SQLite ready at ${databasePath}`);
  } finally {
    client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
