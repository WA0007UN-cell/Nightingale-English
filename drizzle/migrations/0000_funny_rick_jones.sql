CREATE TABLE IF NOT EXISTS `users` (
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
CREATE TABLE IF NOT EXISTS `clinics` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(160) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `clinics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `clinicMembers` (
  `id` int AUTO_INCREMENT NOT NULL,
  `clinicId` int NOT NULL,
  `userId` int NOT NULL,
  `role` enum('Clinician','Staff','Patient','Admin') NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `clinicMembers_id` PRIMARY KEY(`id`),
  CONSTRAINT `clinic_members_clinic_user_unique` UNIQUE(`clinicId`,`userId`),
  KEY `clinic_members_user_index` (`userId`),
  CONSTRAINT `clinicMembers_clinicId_clinics_id_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `clinicMembers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `patients` (
  `id` int AUTO_INCREMENT NOT NULL,
  `clinicId` int NOT NULL,
  `patientUserId` int,
  `displayName` varchar(160) NOT NULL,
  `dateOfBirth` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `patients_id` PRIMARY KEY(`id`),
  KEY `patients_clinic_index` (`clinicId`),
  CONSTRAINT `patients_clinicId_clinics_id_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `patients_patientUserId_users_id_fk` FOREIGN KEY (`patientUserId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `careEntries` (
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
  CONSTRAINT `careEntries_id` PRIMARY KEY(`id`),
  KEY `care_entries_clinic_patient_time_index` (`clinicId`,`patientId`,`occurredAt`),
  KEY `care_entries_patient_visibility_index` (`patientId`,`visibility`),
  CONSTRAINT `careEntries_clinicId_clinics_id_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `careEntries_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `careEntries_authorUserId_users_id_fk` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tasks` (
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
  CONSTRAINT `tasks_id` PRIMARY KEY(`id`),
  KEY `tasks_clinic_patient_index` (`clinicId`,`patientId`),
  KEY `tasks_assignee_status_index` (`assigneeUserId`,`status`),
  CONSTRAINT `tasks_clinicId_clinics_id_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `tasks_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `tasks_sourceEntryId_careEntries_id_fk` FOREIGN KEY (`sourceEntryId`) REFERENCES `careEntries`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `tasks_assigneeUserId_users_id_fk` FOREIGN KEY (`assigneeUserId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `auditLogs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `clinicId` int NOT NULL,
  `patientId` int,
  `actorUserId` int,
  `action` varchar(120) NOT NULL,
  `targetType` varchar(120) NOT NULL,
  `targetId` varchar(120) NOT NULL,
  `metadata` json,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`),
  KEY `audit_logs_clinic_patient_time_index` (`clinicId`,`patientId`,`createdAt`),
  CONSTRAINT `auditLogs_clinicId_clinics_id_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `auditLogs_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `auditLogs_actorUserId_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
