ALTER TABLE `users` ADD COLUMN `google_sub` VARCHAR(255) NULL;
CREATE UNIQUE INDEX `users_google_sub_key` ON `users`(`google_sub`);
