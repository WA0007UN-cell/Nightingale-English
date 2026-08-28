CREATE TABLE `auditLogs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clinicId` integer NOT NULL,
	`patientId` integer,
	`actorUserId` integer,
	`action` text NOT NULL,
	`targetType` text NOT NULL,
	`targetId` text NOT NULL,
	`metadata` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_logs_clinic_patient_time_index` ON `auditLogs` (`clinicId`,`patientId`,`createdAt`);--> statement-breakpoint
CREATE TABLE `careEntries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clinicId` integer NOT NULL,
	`patientId` integer NOT NULL,
	`sourceEntryId` integer,
	`authorUserId` integer,
	`authorRole` text NOT NULL,
	`entryType` text NOT NULL,
	`aiType` text,
	`provenancePointer` text,
	`visibility` text DEFAULT 'clinic' NOT NULL,
	`reviewState` text DEFAULT 'not_required' NOT NULL,
	`content` text NOT NULL,
	`occurredAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sourceEntryId`) REFERENCES `careEntries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `care_entries_clinic_patient_time_index` ON `careEntries` (`clinicId`,`patientId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `care_entries_patient_visibility_index` ON `careEntries` (`patientId`,`visibility`);--> statement-breakpoint
CREATE INDEX `care_entries_clinic_patient_source_index` ON `careEntries` (`clinicId`,`patientId`,`sourceEntryId`);--> statement-breakpoint
CREATE TABLE `carePlanSectionVersions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clinicId` integer NOT NULL,
	`patientId` integer NOT NULL,
	`sectionId` integer NOT NULL,
	`versionNumber` integer NOT NULL,
	`content` text NOT NULL,
	`changeType` text NOT NULL,
	`revertedFromVersion` integer,
	`changedByUserId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sectionId`) REFERENCES `carePlanSections`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`changedByUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `care_plan_section_versions_section_number_unique` ON `carePlanSectionVersions` (`sectionId`,`versionNumber`);--> statement-breakpoint
CREATE INDEX `care_plan_versions_clinic_patient_section_index` ON `carePlanSectionVersions` (`clinicId`,`patientId`,`sectionId`);--> statement-breakpoint
CREATE TABLE `carePlanSections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clinicId` integer NOT NULL,
	`patientId` integer NOT NULL,
	`sectionKey` text NOT NULL,
	`content` text NOT NULL,
	`currentVersion` integer NOT NULL,
	`updatedByUserId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `care_plan_section_clinic_patient_key_unique` ON `carePlanSections` (`clinicId`,`patientId`,`sectionKey`);--> statement-breakpoint
CREATE INDEX `care_plan_sections_clinic_patient_index` ON `carePlanSections` (`clinicId`,`patientId`);--> statement-breakpoint
CREATE TABLE `clinicMembers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clinicId` integer NOT NULL,
	`userId` integer NOT NULL,
	`role` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clinic_members_clinic_user_unique` ON `clinicMembers` (`clinicId`,`userId`);--> statement-breakpoint
CREATE INDEX `clinic_members_user_index` ON `clinicMembers` (`userId`);--> statement-breakpoint
CREATE TABLE `clinics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clinicId` integer NOT NULL,
	`patientUserId` integer,
	`displayName` text NOT NULL,
	`dateOfBirth` integer,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patientUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `patients_clinic_index` ON `patients` (`clinicId`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clinicId` integer NOT NULL,
	`patientId` integer NOT NULL,
	`sourceEntryId` integer,
	`assigneeUserId` integer,
	`title` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`dueAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sourceEntryId`) REFERENCES `careEntries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigneeUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `tasks_clinic_patient_index` ON `tasks` (`clinicId`,`patientId`);--> statement-breakpoint
CREATE INDEX `tasks_assignee_status_index` ON `tasks` (`assigneeUserId`,`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);