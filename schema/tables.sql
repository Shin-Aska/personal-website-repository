DROP TABLE IF EXISTS `ip_log`;
CREATE TABLE `ip_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `time_interacted` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=248 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `site_counter`;
CREATE TABLE `site_counter` (
  `id` int NOT NULL AUTO_INCREMENT,
  `page` text,
  `count` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;