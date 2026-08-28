import fs from "node:fs/promises";
import mysql from "mysql2/promise";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

type SeedModule = typeof import("./seedDemo");

const originalDatabaseUrl = process.env.DATABASE_URL;
const schemaName = `nightingale_seed_test_${Date.now().toString(36)}`;
let admin: mysql.Pool;
let testDb: mysql.Pool;
let seedModule: SeedModule;

describe.skipIf(!originalDatabaseUrl).sequential("synthetic Foundation seed integration", () => {
  beforeAll(async () => {
    if (!originalDatabaseUrl) throw new Error("DATABASE_URL is required for the isolated seed integration test.");

    admin = mysql.createPool({ uri: originalDatabaseUrl });
    await admin.query(`CREATE DATABASE \`${schemaName}\``);
    const isolatedUrl = new URL(originalDatabaseUrl);
    isolatedUrl.pathname = `/${schemaName}`;
    testDb = mysql.createPool({ uri: isolatedUrl.toString() });

    const migrationDirectory = new URL("../drizzle/migrations/", import.meta.url);
    const migrationFiles = (await fs.readdir(migrationDirectory)).filter((file) => file.endsWith(".sql")).sort();
    for (const migrationFile of migrationFiles) {
      const sql = await fs.readFile(new URL(`../drizzle/migrations/${migrationFile}`, import.meta.url), "utf8");
      for (const statement of sql.split("--> statement-breakpoint").map((part) => part.trim()).filter(Boolean)) {
        await testDb.query(statement);
      }
    }

    process.env.DATABASE_URL = isolatedUrl.toString();
    vi.resetModules();
    seedModule = await import("./seedDemo");
  });

  afterAll(async () => {
    const { closeDb } = await import("./db");
    await closeDb();
    if (originalDatabaseUrl) process.env.DATABASE_URL = originalDatabaseUrl;
    await testDb.end();
    await admin.query(`DROP DATABASE IF EXISTS \`${schemaName}\``);
    await admin.end();
  });

  it("creates exactly one deterministic Foundation record set after two seed runs", async () => {
    await seedModule.seedSyntheticFoundation();
    await seedModule.seedSyntheticFoundation();

    const [rows] = await testDb.query(
      "SELECT (SELECT COUNT(*) FROM clinics WHERE name = 'Harborview Family Clinic — Synthetic') AS clinics, (SELECT COUNT(*) FROM users WHERE openId LIKE 'synthetic-%') AS users, (SELECT COUNT(*) FROM clinicMembers) AS memberships, (SELECT COUNT(*) FROM patients WHERE displayName = 'Maya Chen') AS patients, (SELECT COUNT(*) FROM careEntries WHERE content LIKE 'Synthetic %') AS entries, (SELECT COUNT(*) FROM tasks WHERE title = 'Synthetic: confirm scheduled check-in') AS tasks, (SELECT COUNT(*) FROM auditLogs WHERE action = 'synthetic_foundation_seeded') AS audits",
    );
    expect((rows as Array<Record<string, number>>)[0]).toMatchObject({ clinics: 1, users: 4, memberships: 4, patients: 1, entries: 3, tasks: 1, audits: 1 });
  });
});
