-- SportsCourt course export
-- Schema plus demo rows. Made on MariaDB 10.11.14 with:
--   DB_DATABASE=sportscourt_export php artisan migrate:fresh --seed --force
--   mysqldump -u root --single-transaction --skip-add-locks --no-tablespaces --default-character-set=utf8mb4 --skip-comments sportscourt_export
-- Passwords in this file are hashes, not the typed password.
-- Import: create an empty database named sportscourt (utf8mb4_unicode_ci), select it, then import this file.
-- Re-importing drops the tables in that database. Do not import this over a database that has real bookings.

/*M!999999\- enable the sandbox mode */

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `booking_status_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_status_histories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) unsigned NOT NULL,
  `from_status` enum('pending','confirmed','rejected','cancelled','completed','expired') DEFAULT NULL,
  `to_status` enum('pending','confirmed','rejected','cancelled','completed','expired') NOT NULL,
  `changed_by` bigint(20) unsigned DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `booking_status_histories_changed_by_foreign` (`changed_by`),
  KEY `booking_status_histories_booking_id_created_at_index` (`booking_id`,`created_at`),
  CONSTRAINT `booking_status_histories_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `booking_status_histories_changed_by_foreign` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `booking_status_histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_status_histories` ENABLE KEYS */;
DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `court_id` bigint(20) unsigned NOT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `price_per_hour` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `status` enum('pending','confirmed','rejected','cancelled','completed','expired') NOT NULL DEFAULT 'pending',
  `expires_at` datetime DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bookings_code_unique` (`code`),
  KEY `bookings_court_id_start_at_end_at_index` (`court_id`,`start_at`,`end_at`),
  KEY `bookings_user_id_start_at_index` (`user_id`,`start_at`),
  KEY `bookings_status_expires_at_index` (`status`,`expires_at`),
  KEY `bookings_status_end_at_index` (`status`,`end_at`),
  CONSTRAINT `bookings_court_id_foreign` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`),
  CONSTRAINT `bookings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES
(1,'SC-DEMO0006',1,1,'2026-11-29 10:41:25','2026-11-29 11:41:25',75000.00,75000.00,'expired','2026-11-21 09:41:25',NULL,'2026-11-21 09:41:25','2026-11-21 10:41:25'),
(2,'SC-DEMO0005',1,1,'2026-11-28 10:41:25','2026-11-28 11:41:25',75000.00,75000.00,'rejected',NULL,NULL,'2026-11-21 09:51:25','2026-11-21 10:41:25'),
(3,'SC-DEMO0004',1,1,'2026-11-27 10:41:25','2026-11-27 11:41:25',75000.00,75000.00,'cancelled',NULL,NULL,'2026-11-21 10:01:25','2026-11-21 10:41:25'),
(4,'SC-DEMO0003',1,1,'2026-11-18 10:41:25','2026-11-18 11:41:25',75000.00,75000.00,'confirmed',NULL,NULL,'2026-11-21 10:11:25','2026-11-21 10:41:25'),
(5,'SC-DEMO0002',1,1,'2026-11-25 10:41:25','2026-11-25 11:41:25',75000.00,75000.00,'confirmed',NULL,NULL,'2026-11-21 10:21:25','2026-11-21 10:41:25'),
(6,'SC-DEMO0001',1,1,'2026-11-23 10:41:25','2026-11-23 11:41:25',75000.00,75000.00,'pending','2026-11-21 11:11:25',NULL,'2026-11-21 10:31:25','2026-11-21 10:41:25'),
(7,'SC-DEMO0007',2,2,'2026-11-24 10:41:25','2026-11-24 11:41:25',75000.00,75000.00,'confirmed',NULL,NULL,'2026-11-21 10:36:25','2026-11-21 10:41:25');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
DROP TABLE IF EXISTS `court_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `court_blocks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `court_id` bigint(20) unsigned NOT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `reason` varchar(255) NOT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `court_blocks_created_by_foreign` (`created_by`),
  KEY `court_blocks_court_id_start_at_end_at_index` (`court_id`,`start_at`,`end_at`),
  CONSTRAINT `court_blocks_court_id_foreign` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `court_blocks_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `court_blocks` DISABLE KEYS */;
/*!40000 ALTER TABLE `court_blocks` ENABLE KEYS */;
DROP TABLE IF EXISTS `courts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `courts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `venue_id` bigint(20) unsigned NOT NULL,
  `sport_id` bigint(20) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price_per_hour` decimal(12,2) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courts_sport_id_foreign` (`sport_id`),
  KEY `courts_venue_id_is_active_index` (`venue_id`,`is_active`),
  KEY `courts_price_per_hour_index` (`price_per_hour`),
  CONSTRAINT `courts_sport_id_foreign` FOREIGN KEY (`sport_id`) REFERENCES `sports` (`id`),
  CONSTRAINT `courts_venue_id_foreign` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `courts` DISABLE KEYS */;
INSERT INTO `courts` VALUES
(1,1,1,'Court A',NULL,75000.00,NULL,1,'2026-11-21 10:41:25','2026-11-21 10:41:25',NULL),
(2,1,2,'Court B',NULL,75000.00,NULL,1,'2026-11-21 10:41:25','2026-11-21 10:41:25',NULL),
(3,2,3,'Court C',NULL,75000.00,NULL,1,'2026-11-21 10:41:25','2026-11-21 10:41:25',NULL),
(4,4,4,'Court D',NULL,75000.00,NULL,1,'2026-11-21 10:41:25','2026-11-21 10:41:25',NULL);
/*!40000 ALTER TABLE `courts` ENABLE KEYS */;
DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES
(1,'0001_01_01_000000_create_users_table',1),
(2,'0001_01_01_000001_create_cache_table',1),
(3,'0001_01_01_000002_create_jobs_table',1),
(4,'2026_11_22_000001_add_role_status_phone_to_users_table',1),
(5,'2026_11_21_100001_create_sports_table',1),
(6,'2026_11_21_100002_create_venues_table',1),
(7,'2026_11_21_100003_create_venue_images_table',1),
(8,'2026_11_21_100004_create_operating_hours_table',1),
(9,'2026_11_21_100005_create_courts_table',1),
(10,'2026_11_21_110001_create_court_blocks_table',1),
(11,'2026_11_21_110002_create_bookings_table',1),
(12,'2026_11_21_120001_create_booking_status_histories_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
DROP TABLE IF EXISTS `operating_hours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `operating_hours` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `venue_id` bigint(20) unsigned NOT NULL,
  `day_of_week` tinyint(3) unsigned NOT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT 0,
  `open_hour` tinyint(3) unsigned DEFAULT NULL,
  `close_hour` tinyint(3) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `operating_hours_venue_id_day_of_week_unique` (`venue_id`,`day_of_week`),
  CONSTRAINT `operating_hours_venue_id_foreign` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `operating_hours` DISABLE KEYS */;
INSERT INTO `operating_hours` VALUES
(1,1,1,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(2,1,2,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(3,1,3,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(4,1,4,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(5,1,5,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(6,1,6,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(7,1,7,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(8,2,1,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(9,2,2,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(10,2,3,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(11,2,4,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(12,2,5,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(13,2,6,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(14,2,7,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(15,3,1,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(16,3,2,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(17,3,3,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(18,3,4,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(19,3,5,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(20,3,6,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(21,3,7,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(22,4,1,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(23,4,2,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(24,4,3,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(25,4,4,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(26,4,5,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(27,4,6,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(28,4,7,0,8,22,'2026-11-21 10:41:25','2026-11-21 10:41:25');
/*!40000 ALTER TABLE `operating_hours` ENABLE KEYS */;
DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
DROP TABLE IF EXISTS `sports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sports` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `slug` varchar(60) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sports_name_unique` (`name`),
  UNIQUE KEY `sports_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `sports` DISABLE KEYS */;
INSERT INTO `sports` VALUES
(1,'Badminton','badminton',1,'2026-11-21 10:41:24','2026-11-21 10:41:24'),
(2,'Futsal','futsal',1,'2026-11-21 10:41:24','2026-11-21 10:41:24'),
(3,'Basket','basket',1,'2026-11-21 10:41:24','2026-11-21 10:41:24'),
(4,'Tenis','tenis',1,'2026-11-21 10:41:24','2026-11-21 10:41:24'),
(5,'Padel','padel',1,'2026-11-21 10:41:24','2026-11-21 10:41:24');
/*!40000 ALTER TABLE `sports` ENABLE KEYS */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('customer','owner','admin') NOT NULL DEFAULT 'customer',
  `status` enum('active','suspended') NOT NULL DEFAULT 'active',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_status_index` (`role`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'Andi Pelanggan','andi@demo.test','081111111111',NULL,'$2y$12$FGwvfPr/lYcLu6lAay4cm.mbo0JLa6OpSrIDkZurlswUkZUroIGcW','customer','active',NULL,'2026-11-21 10:41:24','2026-11-21 10:41:24'),
(2,'Bima Pelanggan','bima@demo.test','081111111112',NULL,'$2y$12$EqMdnxzcFooj3r4bFNjh2Oo0ukqypq.llWKDP90GP7KTWUiORV8Sy','customer','active',NULL,'2026-11-21 10:41:24','2026-11-21 10:41:24'),
(3,'Sari Venue','sari@demo.test','081222222222',NULL,'$2y$12$LsKFF7n607W1WKaNC9Hy0OH.rMYEbKcVgaBasRbjNeP/FNNH7VfTy','owner','active',NULL,'2026-11-21 10:41:25','2026-11-21 10:41:25'),
(4,'Raka Venue','raka@demo.test','081222222223',NULL,'$2y$12$YKSMcpwso1uaItxKszB8beAtiHqW6Jh1Ax2vPWqx9/sKDkM7OEzCS','owner','active',NULL,'2026-11-21 10:41:25','2026-11-21 10:41:25');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
DROP TABLE IF EXISTS `venue_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `venue_images` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `venue_id` bigint(20) unsigned NOT NULL,
  `path` varchar(255) NOT NULL,
  `sort_order` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `venue_images_venue_id_foreign` (`venue_id`),
  CONSTRAINT `venue_images_venue_id_foreign` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `venue_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `venue_images` ENABLE KEYS */;
DROP TABLE IF EXISTS `venues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `venues` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint(20) unsigned NOT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(180) NOT NULL,
  `description` text NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `timezone` varchar(40) NOT NULL DEFAULT 'Asia/Jakarta',
  `facilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`facilities`)),
  `status` enum('pending_verification','approved','rejected','suspended') NOT NULL DEFAULT 'pending_verification',
  `status_reason` varchar(500) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `verified_by` bigint(20) unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `venues_slug_unique` (`slug`),
  KEY `venues_owner_id_foreign` (`owner_id`),
  KEY `venues_verified_by_foreign` (`verified_by`),
  KEY `venues_status_is_active_index` (`status`,`is_active`),
  KEY `venues_city_index` (`city`),
  KEY `venues_name_index` (`name`),
  CONSTRAINT `venues_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`),
  CONSTRAINT `venues_verified_by_foreign` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40000 ALTER TABLE `venues` DISABLE KEYS */;
INSERT INTO `venues` VALUES
(1,3,'GOR Demo Sehat','gor-demo-sehat','Venue contoh untuk dashboard.','Jalan Contoh 1','Bandung','Jawa Barat','081234567890','Asia/Jakarta','[\"parking\"]','approved',NULL,NULL,NULL,1,'2026-11-21 10:41:25','2026-11-21 10:41:25',NULL),
(2,3,'GOR Demo Baru','gor-demo-baru','Venue contoh untuk dashboard.','Jalan Contoh 1','Jakarta','Jawa Barat','081234567890','Asia/Jakarta','[\"parking\"]','pending_verification',NULL,NULL,NULL,0,'2026-11-21 10:41:25','2026-11-21 10:41:25',NULL),
(3,4,'GOR Demo Ditolak','gor-demo-ditolak','Venue contoh untuk dashboard.','Jalan Contoh 1','Surabaya','Jawa Barat','081234567890','Asia/Jakarta','[\"parking\"]','rejected',NULL,NULL,NULL,0,'2026-11-21 10:41:25','2026-11-21 10:41:25',NULL),
(4,4,'GOR Demo Ditahan','gor-demo-ditahan','Venue contoh untuk dashboard.','Jalan Contoh 1','Medan','Jawa Barat','081234567890','Asia/Jakarta','[\"parking\"]','suspended',NULL,NULL,NULL,0,'2026-11-21 10:41:25','2026-11-21 10:41:25',NULL);
/*!40000 ALTER TABLE `venues` ENABLE KEYS */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
