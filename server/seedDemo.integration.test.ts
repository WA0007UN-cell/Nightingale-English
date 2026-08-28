import { createClient } from "@libsql/client";
import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeDb } from "./db";

type SeedModule = typeof import("./seedDemo");
const testPath = resolve(process.cwd(), "data/seed-integration.test.sqlite");
let seedModule: SeedModule;
let client: ReturnType<typeof createClient>;

beforeAll(async () => {
  process.env.SQLITE_DB_PATH = testPath;
  if (existsSync(testPath)) unlinkSync(testPath);
  const { execFile } = await import("node:child_process");
  await new Promise<void>((resolvePromise, reject) => {
    const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
    execFile(command, ["db:migrate"], { env: process.env }, (error, _stdout, stderr) => error ? reject(new Error(stderr || error.message)) : resolvePromise());
  });
  client = createClient({ url: `file:${testPath}` });
  seedModule = await import("./seedDemo");
});

afterAll(async () => {
  await closeDb();
  client?.close();
  if (existsSync(testPath)) unlinkSync(testPath);
  delete process.env.SQLITE_DB_PATH;
});

describe("synthetic Foundation seed integration", () => {
  it("creates exactly one deterministic Foundation record set after two seed runs", async () => {
    await seedModule.seedSyntheticFoundation();
    await seedModule.seedSyntheticFoundation();
    const result = await client.execute(`
      SELECT
        (SELECT COUNT(*) FROM clinics WHERE name = 'Harborview Family Clinic — Synthetic') AS clinics,
        (SELECT COUNT(*) FROM users WHERE openId LIKE 'synthetic-%') AS users,
        (SELECT COUNT(*) FROM clinicMembers) AS memberships,
        (SELECT COUNT(*) FROM patients WHERE displayName = 'Maya Chen') AS patients,
        (SELECT COUNT(*) FROM careEntries WHERE content LIKE 'Synthetic %') AS entries,
        (SELECT COUNT(*) FROM tasks WHERE title = 'Synthetic: confirm scheduled check-in') AS tasks,
        (SELECT COUNT(*) FROM auditLogs WHERE action = 'synthetic_foundation_seeded') AS audits
    `);
    expect(result.rows[0]).toMatchObject({ clinics: 1, users: 4, memberships: 4, patients: 1, entries: 3, tasks: 1, audits: 1 });
  });
});
