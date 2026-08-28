ALTER TABLE `careEntries` ADD COLUMN `aiType` enum('ai_doctor_consult_summary','ai_nurse_consult_summary','ai_patient_session_summary');--> statement-breakpoint
ALTER TABLE `careEntries` ADD COLUMN `provenancePointer` varchar(255);--> statement-breakpoint
CREATE INDEX `care_entries_provenance_pointer_index` ON `careEntries` (`provenancePointer`);
