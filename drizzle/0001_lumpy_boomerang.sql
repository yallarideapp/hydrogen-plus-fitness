CREATE TABLE `gym_fitness_goals` (
	`user_id` text PRIMARY KEY NOT NULL,
	`focus` text NOT NULL,
	`weekly_target` integer NOT NULL,
	`experience` text NOT NULL,
	`preferred_training` text NOT NULL,
	`notes` text,
	`consented_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gym_planned_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`class_key` text NOT NULL,
	`class_name` text NOT NULL,
	`coach` text NOT NULL,
	`category` text NOT NULL,
	`scheduled_date` text NOT NULL,
	`scheduled_time` text NOT NULL,
	`notes` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`consented_at` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `gym_planned_sessions_user_date_idx` ON `gym_planned_sessions` (`user_id`,`scheduled_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `gym_planned_sessions_unique_slot_idx` ON `gym_planned_sessions` (`user_id`,`class_key`,`scheduled_date`,`scheduled_time`);