CREATE TABLE `notice_table` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`image` varchar(255),
	`published_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `notice_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users_table` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`fullname` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`roll_no` int,
	`programme` varchar(255),
	`semester` varchar(255),
	`shift` varchar(255),
	`address` varchar(255) NOT NULL,
	`contact_no` varchar(255) NOT NULL,
	`dob` varchar(255) NOT NULL,
	`role` enum('student','admin'),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `users_table_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_table_email_unique` UNIQUE(`email`)
);
