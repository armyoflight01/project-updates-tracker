<?php
/**
 * Franchise Ready Saudi Arabia (فرنشايز ريدي السعودية)
 * Database Connection Configuration (PDO MySQL)
 * 
 * Standard XAMPP Default:
 *   Host: 127.0.0.1 (or localhost)
 *   User: root
 *   Password: (empty)
 *   Database: franchise_ready_tracker
 */

// Prevent direct script execution from command line if not CLI
if (defined('STDIN') && !isset($_SERVER['HTTP_HOST'])) {
    // CLI mode permitted
}

define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'franchise_ready_tracker');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');

/**
 * Get PDO Database Connection
 * Uses prepared statement emulation off for true native prepared statements
 * 
 * @param bool $selectDb If false, connects to MySQL server without selecting a specific database (useful for installer)
 * @return PDO
 */
function getDbConnection($selectDb = true) {
    static $pdo = null;

    if ($selectDb && $pdo !== null) {
        return $pdo;
    }

    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
    if ($selectDb) {
        $dsn .= ";dbname=" . DB_NAME;
    }

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false, // Native prepared statements for maximum SQL injection defense
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ];

    try {
        $instance = new PDO($dsn, DB_USER, DB_PASS, $options);
        if ($selectDb) {
            $pdo = $instance;
        }
        return $instance;
    } catch (PDOException $e) {
        // Return null or throw clean exception without leaking credentials
        throw new Exception("Database Connection Failed: " . $e->getMessage(), (int)$e->getCode());
    }
}
