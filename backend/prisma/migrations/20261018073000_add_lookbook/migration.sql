CREATE TABLE `lookbook_items` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  INDEX `lookbook_items_is_active_sort_order_updated_at_idx`(`is_active`, `sort_order`, `updated_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;