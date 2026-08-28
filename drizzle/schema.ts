import { type AnyMySqlColumn, index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** A clinic is the top-level data tenancy boundary for this prototype. */
export const clinics = mysqlTable("clinics", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Maps an authenticated user to exactly one role within a clinic. */
export const clinicMembers = mysqlTable(
  "clinicMembers",
  {
    id: int("id").autoincrement().primaryKey(),
    clinicId: int("clinicId").notNull().references(() => clinics.id),
    userId: int("userId").notNull().references(() => users.id),
    role: mysqlEnum("role", ["Clinician", "Staff", "Patient", "Admin"]).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("clinic_members_clinic_user_unique").on(table.clinicId, table.userId),
    index("clinic_members_user_index").on(table.userId),
  ],
);

/** A patient always belongs to one clinic; patientUserId links a patient portal actor when present. */
export const patients = mysqlTable(
  "patients",
  {
    id: int("id").autoincrement().primaryKey(),
    clinicId: int("clinicId").notNull().references(() => clinics.id),
    patientUserId: int("patientUserId").references(() => users.id),
    displayName: varchar("displayName", { length: 160 }).notNull(),
    dateOfBirth: timestamp("dateOfBirth"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("patients_clinic_index").on(table.clinicId)],
);

/** The minimal, auditable longitudinal entry; comments and versions remain future slices. */
export const careEntries = mysqlTable(
  "careEntries",
  {
    id: int("id").autoincrement().primaryKey(),
    clinicId: int("clinicId").notNull().references(() => clinics.id),
    patientId: int("patientId").notNull().references(() => patients.id),
    sourceEntryId: int("sourceEntryId").references((): AnyMySqlColumn => careEntries.id),
    authorUserId: int("authorUserId").references(() => users.id),
    authorRole: mysqlEnum("authorRole", ["Clinician", "Staff", "Patient", "System"]).notNull(),
    entryType: mysqlEnum("entryType", ["clinician", "staff", "escalation", "patient", "system", "ai"]).notNull(),
    visibility: mysqlEnum("visibility", ["clinic", "patient"]).default("clinic").notNull(),
    reviewState: mysqlEnum("reviewState", ["not_required", "review_required", "approved", "rejected"]).default("not_required").notNull(),
    content: text("content").notNull(),
    occurredAt: timestamp("occurredAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("care_entries_clinic_patient_time_index").on(table.clinicId, table.patientId, table.occurredAt),
    index("care_entries_patient_visibility_index").on(table.patientId, table.visibility),
    index("care_entries_clinic_patient_source_index").on(table.clinicId, table.patientId, table.sourceEntryId),
  ],
);

/** A task has explicit clinic, patient, source and assignee references. No task mutation is included yet. */
export const tasks = mysqlTable(
  "tasks",
  {
    id: int("id").autoincrement().primaryKey(),
    clinicId: int("clinicId").notNull().references(() => clinics.id),
    patientId: int("patientId").notNull().references(() => patients.id),
    sourceEntryId: int("sourceEntryId").references(() => careEntries.id),
    assigneeUserId: int("assigneeUserId").references(() => users.id),
    title: varchar("title", { length: 255 }).notNull(),
    status: mysqlEnum("status", ["open", "in_progress", "complete", "cancelled"]).default("open").notNull(),
    dueAt: timestamp("dueAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("tasks_clinic_patient_index").on(table.clinicId, table.patientId),
    index("tasks_assignee_status_index").on(table.assigneeUserId, table.status),
  ],
);

/** Append-oriented trace records; this Foundation exposes no audit browsing UI yet. */
export const auditLogs = mysqlTable(
  "auditLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    clinicId: int("clinicId").notNull().references(() => clinics.id),
    patientId: int("patientId").references(() => patients.id),
    actorUserId: int("actorUserId").references(() => users.id),
    action: varchar("action", { length: 120 }).notNull(),
    targetType: varchar("targetType", { length: 120 }).notNull(),
    targetId: varchar("targetId", { length: 120 }).notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("audit_logs_clinic_patient_time_index").on(table.clinicId, table.patientId, table.createdAt)],
);
