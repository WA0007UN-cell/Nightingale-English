import { and, eq } from "drizzle-orm";
import { auditLogs, careEntries, carePlanSections, carePlanSectionVersions, clinicMembers, clinics, patients, tasks, users } from "../drizzle/schema";
import { closeDb, getDb } from "./db";

export const syntheticFoundation = {
  clinicName: "Harborview Family Clinic — Synthetic",
  actors: {
    clinician: { openId: "synthetic-clinician-ravi", name: "Dr. Ravi Patel", email: "ravi.patel@nightingale.example.test", role: "Clinician" as const },
    staff: { openId: "synthetic-staff-nora", name: "Nora Lewis", email: "nora.lewis@nightingale.example.test", role: "Staff" as const },
    patient: { openId: "synthetic-patient-maya", name: "Maya Chen", email: "maya.chen@nightingale.example.test", role: "Patient" as const },
    admin: { openId: "synthetic-admin-alex", name: "Alex Morgan", email: "alex.morgan@nightingale.example.test", role: "Admin" as const },
  },
  patient: { displayName: "Maya Chen", dateOfBirth: new Date("1985-03-09T00:00:00.000Z") },
  timestamps: {
    staffEntry: new Date("2026-02-18T08:45:00.000Z"),
    clinicianEntry: new Date("2026-02-18T09:30:00.000Z"),
    escalationEntry: new Date("2026-02-18T10:15:00.000Z"),
    taskDue: new Date("2026-02-18T16:00:00.000Z"),
  },
} as const;

type SeedActor = (typeof syntheticFoundation.actors)[keyof typeof syntheticFoundation.actors];
type SeedEntry = {
  clinicId: number;
  patientId: number;
  sourceEntryId?: number;
  authorUserId: number;
  authorRole: "Clinician" | "Staff";
  entryType: "clinician" | "staff" | "escalation";
  visibility: "clinic" | "patient";
  reviewState: "not_required" | "review_required" | "approved";
  content: string;
  occurredAt: Date;
};

async function ensureUser(actor: SeedActor) {
  const database = getDb();
  const [existing] = await database.select().from(users).where(eq(users.openId, actor.openId)).limit(1);
  if (existing) return existing;
  await database.insert(users).values({ openId: actor.openId, name: actor.name, email: actor.email, loginMethod: "synthetic_seed", role: "user" });
  const [created] = await database.select().from(users).where(eq(users.openId, actor.openId)).limit(1);
  if (!created) throw new Error(`Could not create synthetic user ${actor.openId}.`);
  return created;
}

async function ensureClinic() {
  const database = getDb();
  const [existing] = await database.select().from(clinics).where(eq(clinics.name, syntheticFoundation.clinicName)).limit(1);
  if (existing) return existing;
  await database.insert(clinics).values({ name: syntheticFoundation.clinicName });
  const [created] = await database.select().from(clinics).where(eq(clinics.name, syntheticFoundation.clinicName)).limit(1);
  if (!created) throw new Error("Could not create synthetic clinic.");
  return created;
}

async function ensureMembership(clinicId: number, userId: number, role: "Clinician" | "Staff" | "Patient" | "Admin") {
  const database = getDb();
  const [existing] = await database.select().from(clinicMembers).where(and(eq(clinicMembers.clinicId, clinicId), eq(clinicMembers.userId, userId))).limit(1);
  if (!existing) await database.insert(clinicMembers).values({ clinicId, userId, role });
}

async function ensurePatient(clinicId: number, patientUserId: number) {
  const database = getDb();
  const [existing] = await database.select().from(patients).where(and(eq(patients.clinicId, clinicId), eq(patients.patientUserId, patientUserId))).limit(1);
  if (existing) return existing;
  await database.insert(patients).values({ clinicId, patientUserId, displayName: syntheticFoundation.patient.displayName, dateOfBirth: syntheticFoundation.patient.dateOfBirth });
  const [created] = await database.select().from(patients).where(and(eq(patients.clinicId, clinicId), eq(patients.patientUserId, patientUserId))).limit(1);
  if (!created) throw new Error("Could not create synthetic patient.");
  return created;
}

async function ensureEntry(input: SeedEntry) {
  const database = getDb();
  const [existing] = await database.select().from(careEntries).where(and(eq(careEntries.clinicId, input.clinicId), eq(careEntries.patientId, input.patientId), eq(careEntries.content, input.content))).limit(1);
  if (existing) return existing;
  await database.insert(careEntries).values(input);
  const [created] = await database.select().from(careEntries).where(and(eq(careEntries.clinicId, input.clinicId), eq(careEntries.patientId, input.patientId), eq(careEntries.content, input.content))).limit(1);
  if (!created) throw new Error("Could not create synthetic care entry.");
  return created;
}

/** Re-running this function resolves the same records instead of creating duplicate synthetic data. */
export async function seedSyntheticFoundation() {
  const database = getDb();
  const clinic = await ensureClinic();
  const clinician = await ensureUser(syntheticFoundation.actors.clinician);
  const staff = await ensureUser(syntheticFoundation.actors.staff);
  const patientActor = await ensureUser(syntheticFoundation.actors.patient);
  const admin = await ensureUser(syntheticFoundation.actors.admin);

  await ensureMembership(clinic.id, clinician.id, "Clinician");
  await ensureMembership(clinic.id, staff.id, "Staff");
  await ensureMembership(clinic.id, patientActor.id, "Patient");
  await ensureMembership(clinic.id, admin.id, "Admin");

  const patient = await ensurePatient(clinic.id, patientActor.id);
  const staffEntry = await ensureEntry({
    clinicId: clinic.id, patientId: patient.id, authorUserId: staff.id, authorRole: "Staff", entryType: "staff", visibility: "clinic", reviewState: "not_required",
    content: "Synthetic staff handover: confirm the scheduled check-in window before end of day.", occurredAt: syntheticFoundation.timestamps.staffEntry,
  });
  const clinicianEntry = await ensureEntry({
    clinicId: clinic.id, patientId: patient.id, authorUserId: clinician.id, authorRole: "Clinician", entryType: "clinician", visibility: "patient", reviewState: "approved",
    content: "Synthetic shared instruction: review your next scheduled check-in with the care team.", occurredAt: syntheticFoundation.timestamps.clinicianEntry,
  });
  await ensureEntry({
    clinicId: clinic.id, patientId: patient.id, sourceEntryId: staffEntry.id, authorUserId: staff.id, authorRole: "Staff", entryType: "escalation", visibility: "clinic", reviewState: "review_required",
    content: "Synthetic pending Staff escalation: request clinician review of the follow-up sequence.", occurredAt: syntheticFoundation.timestamps.escalationEntry,
  });

  const [existingSection] = await database.select().from(carePlanSections)
    .where(and(eq(carePlanSections.clinicId, clinic.id), eq(carePlanSections.patientId, patient.id), eq(carePlanSections.sectionKey, "follow_up_plan")))
    .limit(1);
  let carePlanSection = existingSection;
  if (!carePlanSection) {
    await database.insert(carePlanSections).values({
      clinicId: clinic.id, patientId: patient.id, sectionKey: "follow_up_plan", currentVersion: 1,
      content: "Synthetic plan: continue monitoring and arrange a clinician follow-up after the scheduled check-in.",
      updatedByUserId: clinician.id,
    });
    [carePlanSection] = await database.select().from(carePlanSections)
      .where(and(eq(carePlanSections.clinicId, clinic.id), eq(carePlanSections.patientId, patient.id), eq(carePlanSections.sectionKey, "follow_up_plan")))
      .limit(1);
  }
  if (!carePlanSection) throw new Error("Could not create synthetic Care Plan section.");
  const [existingVersion] = await database.select().from(carePlanSectionVersions)
    .where(and(eq(carePlanSectionVersions.sectionId, carePlanSection.id), eq(carePlanSectionVersions.versionNumber, 1)))
    .limit(1);
  if (!existingVersion) {
    await database.insert(carePlanSectionVersions).values({
      clinicId: clinic.id, patientId: patient.id, sectionId: carePlanSection.id, versionNumber: 1,
      content: carePlanSection.content, changeType: "seed", changedByUserId: clinician.id,
    });
  }

  const taskFixtures = [
    { title: "Synthetic: confirm scheduled check-in", dueAt: syntheticFoundation.timestamps.taskDue },
    { title: "Synthetic: review new patient update", dueAt: new Date("2026-02-18T17:00:00.000Z") },
    { title: "Synthetic: verify medication follow-up", dueAt: new Date("2026-02-19T09:00:00.000Z") },
  ];
  for (const taskFixture of taskFixtures) {
    const [existingTask] = await database.select().from(tasks).where(and(eq(tasks.clinicId, clinic.id), eq(tasks.patientId, patient.id), eq(tasks.title, taskFixture.title))).limit(1);
    if (!existingTask) {
      await database.insert(tasks).values({ clinicId: clinic.id, patientId: patient.id, sourceEntryId: staffEntry.id, assigneeUserId: staff.id, title: taskFixture.title, status: "open", dueAt: taskFixture.dueAt });
    }
  }

  const [existingAudit] = await database.select().from(auditLogs).where(and(eq(auditLogs.clinicId, clinic.id), eq(auditLogs.patientId, patient.id), eq(auditLogs.action, "synthetic_foundation_seeded"))).limit(1);
  if (!existingAudit) {
    await database.insert(auditLogs).values({
      clinicId: clinic.id, patientId: patient.id, actorUserId: admin.id, action: "synthetic_foundation_seeded", targetType: "patient_workspace", targetId: String(patient.id),
      metadata: { source: "P2-F04", synthetic: true, patientVisibleEntryId: clinicianEntry.id },
    });
  }

  return { clinicId: clinic.id, patientId: patient.id, entryCount: 3, taskCount: taskFixtures.length, carePlanSectionId: carePlanSection.id };
}

const isDirectRun = process.argv[1]?.endsWith("seedDemo.ts");
if (isDirectRun) {
  void (async () => {
    try {
      const result = await seedSyntheticFoundation();
      console.log(`Synthetic Foundation ready: clinic=${result.clinicId}, patient=${result.patientId}, entries=${result.entryCount}, tasks=${result.taskCount}`);
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await closeDb();
      process.exit();
    }
  })();
}
