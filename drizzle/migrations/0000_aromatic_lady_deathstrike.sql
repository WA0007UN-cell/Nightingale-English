CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`patientId` int,
	`actorUserId` int,
	`action` varchar(120) NOT NULL,
	`targetType` varchar(120) NOT NULL,
	`targetId` varchar(120) NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `careEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`patientId` int NOT NULL,
	`authorUserId` int,
	`authorRole` enum('Clinician','Staff','Patient','System') NOT NULL,
	`entryType` enum('clinician','staff','patient','system','ai') NOT NULL,
	`visibility` enum('clinic','patient') NOT NULL DEFAULT 'clinic',
	`reviewState` enum('not_required','review_required','approved','rejected') NOT NULL DEFAULT 'not_required',
	`content` text NOT NULL,
	`occurredAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `careEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clinicMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('Clinician','Staff','Patient','Admin') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clinicMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `clinic_members_clinic_user_unique` UNIQUE(`clinicId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `clinics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clinics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`patientUserId` int,
	`displayName` varchar(160) NOT NULL,
	`dateOfBirth` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `patients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`patientId` int NOT NULL,
	`sourceEntryId` int,
	`assigneeUserId` int,
	`title` varchar(255) NOT NULL,
	`status` enum('open','in_progress','complete','cancelled') NOT NULL DEFAULT 'open',
	`dueAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_clinicId_clinics_id_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careEntries` ADD CONSTRAINT `careEntries_clinicId_clinics_id_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careEntries` ADD CONSTRAINT `careEntries_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careEntries` ADD CONSTRAINT `careEntries_authorUserId_users_id_fk` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinicMembers` ADD CONSTRAINT `clinicMembers_clinicId_clinics_id_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinicMembers` ADD CONSTRAINT `clinicMembers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `patients` ADD CONSTRAINT `patients_clinicId_clinics_id_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `patients` ADD CONSTRAINT `patients_patientUserId_users_id_fk` FOREIGN KEY (`patientUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_clinicId_clinics_id_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_sourceEntryId_careEntries_id_fk` FOREIGN KEY (`sourceEntryId`) REFERENCES `careEntries`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assigneeUserId_users_id_fk` FOREIGN KEY (`assigneeUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_logs_clinic_created_index` ON `auditLogs` (`clinicId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `care_entries_clinic_patient_occurred_index` ON `careEntries` (`clinicId`,`patientId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `care_entries_patient_visibility_index` ON `careEntries` (`patientId`,`visibility`);--> statement-breakpoint
CREATE INDEX `clinic_members_user_index` ON `clinicMembers` (`userId`);--> statement-breakpoint
CREATE INDEX `patients_clinic_index` ON `patients` (`clinicId`);--> statement-breakpoint
CREATE INDEX `tasks_clinic_assignee_status_index` ON `tasks` (`clinicId`,`assigneeUserId`,`status`);