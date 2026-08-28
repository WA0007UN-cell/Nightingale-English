CREATE TABLE `carePlanSectionVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`patientId` int NOT NULL,
	`sectionId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`content` text NOT NULL,
	`changeType` enum('seed','edit','revert') NOT NULL,
	`revertedFromVersion` int,
	`changedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `carePlanSectionVersions_id` PRIMARY KEY(`id`),
	CONSTRAINT `care_plan_section_versions_section_number_unique` UNIQUE(`sectionId`,`versionNumber`)
);
--> statement-breakpoint
CREATE TABLE `carePlanSections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`patientId` int NOT NULL,
	`sectionKey` enum('follow_up_plan') NOT NULL,
	`content` text NOT NULL,
	`currentVersion` int NOT NULL,
	`updatedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carePlanSections_id` PRIMARY KEY(`id`),
	CONSTRAINT `care_plan_section_clinic_patient_key_unique` UNIQUE(`clinicId`,`patientId`,`sectionKey`)
);
--> statement-breakpoint
ALTER TABLE `careEntries` MODIFY COLUMN `reviewState` enum('not_required','review_required','reviewed','resolved','approved','rejected') NOT NULL DEFAULT 'not_required';--> statement-breakpoint
ALTER TABLE `carePlanSectionVersions` ADD CONSTRAINT `carePlanSectionVersions_clinicId_clinics_id_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carePlanSectionVersions` ADD CONSTRAINT `carePlanSectionVersions_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carePlanSectionVersions` ADD CONSTRAINT `carePlanSectionVersions_sectionId_carePlanSections_id_fk` FOREIGN KEY (`sectionId`) REFERENCES `carePlanSections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carePlanSectionVersions` ADD CONSTRAINT `carePlanSectionVersions_changedByUserId_users_id_fk` FOREIGN KEY (`changedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carePlanSections` ADD CONSTRAINT `carePlanSections_clinicId_clinics_id_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carePlanSections` ADD CONSTRAINT `carePlanSections_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carePlanSections` ADD CONSTRAINT `carePlanSections_updatedByUserId_users_id_fk` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `care_plan_versions_clinic_patient_section_index` ON `carePlanSectionVersions` (`clinicId`,`patientId`,`sectionId`);--> statement-breakpoint
CREATE INDEX `care_plan_sections_clinic_patient_index` ON `carePlanSections` (`clinicId`,`patientId`);