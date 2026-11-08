CREATE TABLE `gym_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`user_id` text,
	`client_request_id` text,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`interest` text,
	`preferred_date` text,
	`message` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`consented_at` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `gym_requests_user_created_idx` ON `gym_requests` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `gym_requests_phone_created_idx` ON `gym_requests` (`phone`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `gym_requests_client_request_idx` ON `gym_requests` (`client_request_id`);--> statement-breakpoint
CREATE TABLE `gym_measurements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`weight` real NOT NULL,
	`date` text NOT NULL,
	`consented_at` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `gym_measurements_user_date_idx` ON `gym_measurements` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `gym_workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`duration` integer NOT NULL,
	`date` text NOT NULL,
	`notes` text,
	`consented_at` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `gym_workouts_user_date_idx` ON `gym_workouts` (`user_id`,`date`);