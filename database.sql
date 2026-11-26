-- ====================================================================
-- Franchise Ready Saudi Arabia (فرنشايز ريدي السعودية)
-- Project & Updates Tracker - Enterprise Database Schema
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+ (XAMPP default)
-- Character Set: utf8mb4 (Full Unicode & Arabic Support)
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. Create Database
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `franchise_ready_tracker` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `franchise_ready_tracker`;

-- --------------------------------------------------------
-- 2. Table: users
-- Secure enterprise user table with bcrypt hashed passwords
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL COMMENT 'BCRYPT hashed password',
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `last_login` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_username` (`username`),
  INDEX `idx_role` (`role`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Table: departments
-- Organizational departments & client divisions
-- --------------------------------------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL UNIQUE,
  `code` VARCHAR(30) DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_dept_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Table: projects
-- Master initiatives and project milestones
-- --------------------------------------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_code` VARCHAR(50) NOT NULL UNIQUE,
  `project_name` VARCHAR(255) NOT NULL,
  `client_department` VARCHAR(120) NOT NULL,
  `project_manager` VARCHAR(120) NOT NULL,
  `status` ENUM('In Progress', 'Delayed / Urgent', 'Completed') NOT NULL DEFAULT 'In Progress',
  `progress` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `due_date` DATE NOT NULL,
  `latest_updates` TEXT NOT NULL,
  `created_by` VARCHAR(50) DEFAULT 'system',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project_code` (`project_code`),
  INDEX `idx_status` (`status`),
  INDEX `idx_due_date` (`due_date`),
  INDEX `idx_department` (`client_department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Table: project_updates (Audit History)
-- Historical timeline of updates per project
-- --------------------------------------------------------
DROP TABLE IF EXISTS `project_updates`;
CREATE TABLE `project_updates` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` INT UNSIGNED NOT NULL,
  `update_text` TEXT NOT NULL,
  `updated_by` VARCHAR(100) NOT NULL,
  `prev_status` VARCHAR(50) DEFAULT NULL,
  `new_status` VARCHAR(50) DEFAULT NULL,
  `prev_progress` TINYINT UNSIGNED DEFAULT 0,
  `new_progress` TINYINT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_proj_id` (`project_id`),
  CONSTRAINT `fk_updates_project` 
    FOREIGN KEY (`project_id`) 
    REFERENCES `projects` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Table: audit_logs (System Security & Compliance)
-- Real-time audit trail of logins, updates, and user changes
-- --------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NULL,
  `username` VARCHAR(50) NOT NULL,
  `action` VARCHAR(60) NOT NULL,
  `details` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Table: login_attempts (Brute-Force Attack Prevention)
-- Throttles repeated malicious sign-in attempts
-- --------------------------------------------------------
DROP TABLE IF EXISTS `login_attempts`;
CREATE TABLE `login_attempts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ip_address` VARCHAR(45) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `attempted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_throttle` (`ip_address`, `username`, `attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ====================================================================
-- REAL SEED DATA - FRANCHISE READY SAUDI ARABIA
-- ====================================================================

-- --------------------------------------------------------
-- Seed Users (Default Admin: ibraheem01 / 123456789)
-- Passwords hashed with BCRYPT (Cost factor 10)
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `role`, `status`) VALUES
(1, 'ibraheem01', '$2y$10$zpT2O9jbPTrbFsT78gyQY.0UG3DTVVAQKChmqVACjQfeuHA/CQWSS', 'Ibraheem Al-Dosari', 'ibraheem@franchiseready.sa', 'admin', 'active'),
(2, 's.almansoor', '$2y$10$SrUwY2ttbjmLTZRiyitxD.vf5hTKuXaXV/31uxosTVXL3Kj5j2S0G', 'Sarah Al-Mansoor', 's.mansoor@franchiseready.sa', 'user', 'active'),
(3, 'k.alotaibi', '$2y$10$hBDtTyljTGi284HXLvMCvumP3gvJxP6PmxBdjQSXdBQzZCRmUAdv.', 'Khalid Al-Otaibi', 'k.otaibi@franchiseready.sa', 'user', 'active'),
(4, 't.dossary', '$2y$10$XGSd1mt8Yi8j9BorFlCJF.uYGcsAU/jHe.jJwimL2SmwVNHyx459G', 'Tariq Al-Dossary', 't.dossary@franchiseready.sa', 'user', 'active');

-- --------------------------------------------------------
-- Seed Departments (Enterprise Divisions)
-- --------------------------------------------------------
INSERT INTO `departments` (`id`, `name`, `code`, `description`) VALUES
(1, 'Business Development', 'BD', 'Franchise growth, sales pipelines, and expansion strategic partnerships'),
(2, 'Franchise Operations & Logistics', 'OPS', 'Daily franchisee support, commissary logistics, and operational audit'),
(3, 'Events & Exhibitions', 'EVT', 'Trade expos, pop-up events, and hospitality showcase coordination'),
(4, 'Marketing & Brand Identity', 'MKT', 'Corporate branding, digital marketing, packaging, and advertising campaigns'),
(5, 'Quality & Regulatory Compliance', 'QC', 'SFDA food safety, ISO certifications, and municipal inspections'),
(6, 'Legal & Contract Affairs', 'LEG', 'Franchise disclosure documents, commercial agreements, and IP licensing');

-- --------------------------------------------------------
-- Seed Projects (Authentic Saudi Market Initiatives)
-- --------------------------------------------------------
INSERT INTO `projects` (`id`, `project_code`, `project_name`, `client_department`, `project_manager`, `status`, `progress`, `due_date`, `latest_updates`, `created_by`) VALUES
(1, 'PRJ-101', 'Catering & Hospitality Division Launch', 'Business Development', 'Khalid Al-Otaibi', 'In Progress', 85, '2026-12-05', 'Corporate catering menu finalized; commercial contracts signed with 4 Tier-1 supplier partners; staff onboarding underway.', 'ibraheem01'),
(2, 'PRJ-102', 'Specialty Coffee Bar Franchise Rollout - Riyadh', 'Events & Exhibitions', 'Sarah Al-Mansoor', 'Delayed / Urgent', 60, '2026-11-28', 'Custom roasting and espresso machine customs clearance delayed at King Khalid International Airport port; temporary reserve equipment secured.', 'ibraheem01'),
(3, 'PRJ-103', 'Central Commissary Supply Chain Optimization', 'Franchise Operations & Logistics', 'Tariq Al-Dossary', 'Completed', 100, '2026-11-20', 'Cold-chain telemetry IoT sensors installed across all reefer fleets; operational SLA increased to 99.4% on-time delivery.', 'ibraheem01'),
(4, 'PRJ-104', 'Brand Identity & Packaging Redesign 2026', 'Marketing & Brand Identity', 'Noura Al-Shehri', 'In Progress', 40, '2026-12-15', 'Eco-friendly biodegradable packaging prototypes approved by executive board; pre-production test runs scheduled at Dammam plant.', 'ibraheem01'),
(5, 'PRJ-105', 'Annual ISO 22000 & HACCP Food Safety Audit', 'Quality & Regulatory Compliance', 'Dr. Faisal Al-Ghamdi', 'In Progress', 70, '2026-12-01', 'Phase 1 internal gap audit closed with zero major non-conformances; external certification auditor scheduled for final review next week.', 'ibraheem01'),
(6, 'PRJ-106', 'Franchise Disclosure Document (FDD) & Master Agreements', 'Legal & Contract Affairs', 'Abdulrahman Al-Hassan', 'Completed', 100, '2026-11-15', 'All 2026 franchise disclosure documents reviewed against latest Monsha\'at Saudi franchise law regulations; master contracts deposited.', 'ibraheem01');

-- --------------------------------------------------------
-- Seed Project History Logs
-- --------------------------------------------------------
INSERT INTO `project_updates` (`project_id`, `update_text`, `updated_by`, `prev_status`, `new_status`, `prev_progress`, `new_progress`, `created_at`) VALUES
(1, 'Commercial supplier contracts finalized for tableware and fresh produce.', 'Khalid Al-Otaibi', 'In Progress', 'In Progress', 75, 85, '2026-11-24 10:15:00'),
(2, 'Customs broker notified regarding shipment clearance at airport hub.', 'Sarah Al-Mansoor', 'In Progress', 'Delayed / Urgent', 60, 60, '2026-11-24 14:30:00'),
(3, 'Final sign-off by VP of Operations. System fully operational.', 'Tariq Al-Dossary', 'In Progress', 'Completed', 95, 100, '2026-11-20 16:45:00');

-- --------------------------------------------------------
-- Seed Audit Log
-- --------------------------------------------------------
INSERT INTO `audit_logs` (`user_id`, `username`, `action`, `details`, `ip_address`, `user_agent`) VALUES
(1, 'ibraheem01', 'SYSTEM_INIT', 'Franchise Ready Enterprise Database initialized with default schema and authentic records.', '127.0.0.1', 'CLI Installer');

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
