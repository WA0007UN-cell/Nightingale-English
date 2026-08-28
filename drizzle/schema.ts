import { type AnySQLiteColumn, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamp = (name: string) => integer(name, { mode: "timestamp" });

type UserRole = "user" | "admin";
type ClinicRole = "Clinician" | "Staff" | "Patient" | "Admin";
type AuthorRole = "Clinician" | "Staff" | "Patient" | "System";
type EntryType = "clinician" | "staff" | "escalation" | "patient" | "system" | "ai";
type Visibility = "clinic" | "patient";
type ReviewState = "not_required" | "review_required" | "reviewed" | "resolved" | "approved" | "rejected";
type AiType = "ai_doctor_consult_summary" | "ai_nurse_consult_summary" | "ai_patient_session_summary";
type TaskStatus = "open" | "in_progress" | "complete" | "cancelled";
type SectionKey = "follow_up_plan";
type ChangeType = "seed" | "edit" | "revert";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role").$type<UserRole>().default("user").notNull(),
  createdAt: timestamp("createdAt").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updatedAt").$defaultFn(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").$defaultFn(() => new Date()).notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const clinics = sqliteTable("clinics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: timestamp("createdAt").$defaultFn(() => new Date()).notNull(),
});

export const clinicMembers = sqliteTable("clinicMembers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clinicId: integer("clinicId").notNull().references(() => clinics.id),
  userId: integer("userId").notNull().references(() => users.id),
  role: text("role").$type<ClinicRole>().notNull(),
  createdAt: timestamp("createdAt").$defaultFn(() => new Date()).notNull(),
}, (table) => [
  uniqueIndex("clinic_members_clinic_user_unique").on(table.clinicId, table.userId),
  index("clinic_members_user_index").on(table.userId),
]);

export const patients = sqliteTable("patients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clinicId: integer("clinicId").notNull().references(() => clinics.id),
  patientUserId: integer("patientUserId").references(() => users.id),
  displayName: text("displayName").notNull(),
  dateOfBirth: timestamp("dateOfBirth"),
  createdAt: timestamp("createdAt").$defaultFn(() => new Date()).notNull(),
}, (table) => [index("patients_clinic_index").on(table.clinicId)]);

export const careEntries = sqliteTable("careEntries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clinicId: integer("clinicId").notNull().references(() => clinics.id),
  patientId: integer("patientId").notNull().references(() => patients.id),
  sourceEntryId: integer("sourceEntryId").references((): AnySQLiteColumn => careEntries.id),
  authorUserId: integer("authorUserId").references(() => users.id),
  authorRole: text("authorRole").$type<AuthorRole>().notNull(),
  entryType: text("entryType").$type<EntryType>().notNull(),
  aiType: text("aiType").$type<AiType>(),
  provenancePointer: text("provenancePointer"),
  visibility: text("visibility").$type<Visibility>().default("clinic").notNull(),
  reviewState: text("reviewState").$type<ReviewState>().default("not_required").notNull(),
  content: text("content").notNull(),
  occurredAt: timestamp("occurredAt").notNull(),
  createdAt: timestamp("createdAt").$defaultFn(() => new Date()).notNull(),
}, (table) => [
  index("care_entries_clinic_patient_time_index").on(table.clinicId, table.patientId, table.occurredAt),
  index("care_entries_patient_visibility_index").on(table.patientId, table.visibility),
  index("care_entries_clinic_patient_source_index").on(table.clinicId, table.patientId, table.sourceEntryId),
]);

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clinicId: integer("clinicId").notNull().references(() => clinics.id),
  patientId: integer("patientId").notNull().references(() => patients.id),
  sourceEntryId: integer("sourceEntryId").references(() => careEntries.id),
  assigneeUserId: integer("assigneeUserId").references(() => users.id),
  title: text("title").notNull(),
  status: text("status").$type<TaskStatus>().default("open").notNull(),
  dueAt: timestamp("dueAt"),
  createdAt: timestamp("createdAt").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updatedAt").$defaultFn(() => new Date()).notNull(),
}, (table) => [
  index("tasks_clinic_patient_index").on(table.clinicId, table.patientId),
  index("tasks_assignee_status_index").on(table.assigneeUserId, table.status),
]);

export const carePlanSections = sqliteTable("carePlanSections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clinicId: integer("clinicId").notNull().references(() => clinics.id),
  patientId: integer("patientId").notNull().references(() => patients.id),
  sectionKey: text("sectionKey").$type<SectionKey>().notNull(),
  content: text("content").notNull(),
  currentVersion: integer("currentVersion").notNull(),
  updatedByUserId: integer("updatedByUserId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updatedAt").$defaultFn(() => new Date()).notNull(),
}, (table) => [
  uniqueIndex("care_plan_section_clinic_patient_key_unique").on(table.clinicId, table.patientId, table.sectionKey),
  index("care_plan_sections_clinic_patient_index").on(table.clinicId, table.patientId),
]);

export const carePlanSectionVersions = sqliteTable("carePlanSectionVersions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clinicId: integer("clinicId").notNull().references(() => clinics.id),
  patientId: integer("patientId").notNull().references(() => patients.id),
  sectionId: integer("sectionId").notNull().references(() => carePlanSections.id),
  versionNumber: integer("versionNumber").notNull(),
  content: text("content").notNull(),
  changeType: text("changeType").$type<ChangeType>().notNull(),
  revertedFromVersion: integer("revertedFromVersion"),
  changedByUserId: integer("changedByUserId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").$defaultFn(() => new Date()).notNull(),
}, (table) => [
  uniqueIndex("care_plan_section_versions_section_number_unique").on(table.sectionId, table.versionNumber),
  index("care_plan_versions_clinic_patient_section_index").on(table.clinicId, table.patientId, table.sectionId),
]);

export const auditLogs = sqliteTable("auditLogs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clinicId: integer("clinicId").notNull().references(() => clinics.id),
  patientId: integer("patientId").references(() => patients.id),
  actorUserId: integer("actorUserId").references(() => users.id),
  action: text("action").notNull(),
  targetType: text("targetType").notNull(),
  targetId: text("targetId").notNull(),
  metadata: text("metadata", { mode: "json" }),
  createdAt: timestamp("createdAt").$defaultFn(() => new Date()).notNull(),
}, (table) => [index("audit_logs_clinic_patient_time_index").on(table.clinicId, table.patientId, table.createdAt)]);
