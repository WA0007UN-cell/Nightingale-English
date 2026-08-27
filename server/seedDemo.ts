/**
 * Deterministic Phase 2 seed for local/demo development.
 * It creates synthetic identities and care data only; no user credential,
 * real patient, or external record is read or written.
 */
import { eq } from "drizzle-orm";
import { auditLogs, careEntries, clinicMembers, clinics, patients, tasks, users } from "../drizzle/schema";
import { closeDb, getDb } from "./db";

type SeedUser = { openId: string; name: string; email: string };

const seedUsers: Record<"clinician" | "staff" | "patient" | "admin", SeedUser> = {
  clinician: { openId: "demo-clinician-ravi", name: "Dr. Ravi Patel", email: "ravi.demo@example.test" },
  staff: { openId: "demo-staff-noor", name: "Noor Lewis", email: "noor.demo@example.test" },
  patient: { openId: "demo-patient-maya", name: "Maya Chen", email: "maya.demo@example.test" },
  admin: { openId: "demo-admin-amara", name: "Amara Moss", email: "amara.demo@example.test" },
};

async function upsertUser(seedUser: SeedUser) {
  const db = getDb();
  await db.insert(users).values(seedUser).onDuplicateKeyUpdate({
    set: { name: seedUser.name, email: seedUser.email },
  });
  const [record] = await db.select().from(users).where(eq(users.openId, seedUser.openId)).limit(1);
  if (!record) throw new Error(`Could not load synthetic user ${seedUser.openId}`);
  return record;
}

async function main() {
  const db = getDb();
  const clinician = await upsertUser(seedUsers.clinician);
  const staff = await upsertUser(seedUsers.staff);
  const patientUser = await upsertUser(seedUsers.patient);
  const admin = await upsertUser(seedUsers.admin);

  await db.insert(clinics).values({ name: "Harbour Clinic — Synthetic Demo" }).onDuplicateKeyUpdate({
    set: { name: "Harbour Clinic — Synthetic Demo" },
  });
  const [clinic] = await db.select().from(clinics).where(eq(clinics.name, "Harbour Clinic — Synthetic Demo")).limit(1);
  if (!clinic) throw new Error("Could not load synthetic clinic");

  const memberships = [
    { clinicId: clinic.id, userId: clinician.id, role: "Clinician" as const },
    { clinicId: clinic.id, userId: staff.id, role: "Staff" as const },
    { clinicId: clinic.id, userId: patientUser.id, role: "Patient" as const },
    { clinicId: clinic.id, userId: admin.id, role: "Admin" as const },
  ];
  for (const membership of memberships) {
    await db.insert(clinicMembers).values(membership).onDuplicateKeyUpdate({ set: { role: membership.role } });
  }

  await db.insert(patients).values({
    clinicId: clinic.id,
    patientUserId: patientUser.id,
    displayName: "Maya Chen (Synthetic)",
    dateOfBirth: new Date("1984-05-14T00:00:00.000Z"),
  }).onDuplicateKeyUpdate({ set: { patientUserId: patientUser.id } });
  const [patient] = await db.select().from(patients).where(eq(patients.patientUserId, patientUser.id)).limit(1);
  if (!patient) throw new Error("Could not load synthetic patient");

  const [existingEntry] = await db.select().from(careEntries)
    .where(eq(careEntries.patientId, patient.id)).limit(1);
  if (!existingEntry) {
    await db.insert(careEntries).values([
      {
        clinicId: clinic.id,
        patientId: patient.id,
        authorUserId: staff.id,
        authorRole: "Staff",
        entryType: "staff",
        visibility: "clinic",
        content: "Synthetic follow-up note: dizziness reported after two missed doses.",
        occurredAt: new Date("2026-02-18T09:00:00.000Z"),
      },
      {
        clinicId: clinic.id,
        patientId: patient.id,
        authorUserId: clinician.id,
        authorRole: "Clinician",
        entryType: "clinician",
        visibility: "patient",
        content: "Synthetic approved next step: a care-team member will follow up today.",
        occurredAt: new Date("2026-02-18T10:15:00.000Z"),
      },
    ]);
  }

  const [existingTask] = await db.select().from(tasks).where(eq(tasks.patientId, patient.id)).limit(1);
  if (!existingTask) {
    await db.insert(tasks).values({
      clinicId: clinic.id,
      patientId: patient.id,
      assigneeUserId: staff.id,
      title: "Synthetic follow-up: call Maya today",
      status: "open",
      dueAt: new Date("2026-02-18T17:00:00.000Z"),
    });
  }

  const [existingAudit] = await db.select().from(auditLogs).where(eq(auditLogs.clinicId, clinic.id)).limit(1);
  if (!existingAudit) {
    await db.insert(auditLogs).values({
      clinicId: clinic.id,
      patientId: patient.id,
      actorUserId: admin.id,
      action: "seeded_synthetic_foundation",
      targetType: "clinic",
      targetId: String(clinic.id),
      metadata: { synthetic: true, phase: 2 },
    });
  }

  console.log("Seeded Harbour Clinic synthetic Phase 2 foundation.");
}

async function run() {
  try {
    await main();
  } finally {
    await closeDb();
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
