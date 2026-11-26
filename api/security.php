<?php
/**
 * Franchise Ready Saudi Arabia (فرنشايز ريدي السعودية)
 * Enterprise Security Engine & Helpers
 * 
 * Implements:
 * 1. Security Response Headers (Anti-Clickjacking, MIME Sniffing, XSS)
 * 2. Hardened Session Management (HttpOnly, SameSite, Lifetime, Regeneration)
 * 3. Role-Based Access Control (RBAC: Admin vs User vs Public)
 * 4. Brute-Force Rate Limiting (Tracks failed attempts by IP)
 * 5. Native SQL Injection Defense (Strict Prepared Statements)
 * 6. Audit Trail Logging (User actions, timestamps, IPs)
 */

require_once __DIR__ . '/db.php';

// Set strict JSON and security headers
function sendSecurityHeaders() {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=UTF-8');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // CORS: Allow current origin
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    }
}

// Start hardened secure session
function startSecureSession() {
    if (session_status() === PHP_SESSION_NONE) {
        $lifetime = 60 * 60 * 8; // 8 hours
        session_set_cookie_params([
            'lifetime' => $lifetime,
            'path' => '/',
            'domain' => '',
            'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
        session_start();
        
        // Auto session expiration check
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $lifetime)) {
            session_unset();
            session_destroy();
            session_start();
        }
        $_SESSION['last_activity'] = time();
    }
}

// Unified JSON response
function jsonResponse($success, $message, $data = null, $statusCode = 200) {
    sendSecurityHeaders();
    http_response_code($statusCode);
    echo json_encode([
        'success'   => (bool)$success,
        'message'   => $message,
        'data'      => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Get client IP address
function getClientIp() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ips[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

// Log audit action into database
function logAudit($action, $details = null, $userId = null, $username = null) {
    try {
        $pdo = getDbConnection();
        $ip = getClientIp();
        $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown', 0, 255);
        
        if ($username === null && isset($_SESSION['user_username'])) {
            $username = $_SESSION['user_username'];
            $userId   = $_SESSION['user_id'] ?? null;
        }
        if (!$username) {
            $username = 'guest';
        }

        $stmt = $pdo->prepare("
            INSERT INTO `audit_logs` (`user_id`, `username`, `action`, `details`, `ip_address`, `user_agent`)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $username, $action, $details, $ip, $ua]);
    } catch (Exception $e) {
        // Silently continue if audit log fails so normal flow isn't blocked
        error_log("Audit log failed: " . $e->getMessage());
    }
}

// Brute-force check: relaxed on localhost/internal IPs, throttles repeated malicious attempts
function checkBruteForce($username) {
    try {
        $ip = getClientIp();
        
        // Never lock out local development / localhost or root admin
        if ($ip === '127.0.0.1' || $ip === '::1' || $ip === 'localhost' || strtolower($username) === 'ibraheem01') {
            return true;
        }

        $pdo = getDbConnection();
        $stmt = $pdo->prepare("
            SELECT COUNT(*) AS failed_count 
            FROM `login_attempts` 
            WHERE (`ip_address` = ? OR LOWER(`username`) = LOWER(?)) 
              AND `attempted_at` > (NOW() - INTERVAL 10 MINUTE)
        ");
        $stmt->execute([$ip, $username]);
        $count = (int)$stmt->fetchColumn();

        if ($count >= 15) {
            return false; // Throttled
        }
        return true;
    } catch (Exception $e) {
        return true; // If table doesn't exist yet, proceed
    }
}

// Reset all failed logins (maintenance / unlock utility)
function resetAllFailedLogins() {
    try {
        $pdo = getDbConnection();
        $pdo->exec("DELETE FROM `login_attempts`");
        return true;
    } catch (Exception $e) {
        return false;
    }
}

// Record failed login attempt
function recordFailedLogin($username) {
    try {
        $pdo = getDbConnection();
        $ip = getClientIp();
        $stmt = $pdo->prepare("INSERT INTO `login_attempts` (`ip_address`, `username`) VALUES (?, ?)");
        $stmt->execute([$ip, $username]);
    } catch (Exception $e) {
        error_log("Failed to record login attempt: " . $e->getMessage());
    }
}

// Clear failed attempts on successful login
function clearFailedLogins($username) {
    try {
        $pdo = getDbConnection();
        $ip = getClientIp();
        $stmt = $pdo->prepare("DELETE FROM `login_attempts` WHERE `ip_address` = ? OR `username` = ?");
        $stmt->execute([$ip, $username]);
    } catch (Exception $e) {
        error_log("Failed to clear login attempts: " . $e->getMessage());
    }
}

// Require authenticated session
function requireAuth() {
    startSecureSession();
    if (empty($_SESSION['user_id']) || empty($_SESSION['user_username'])) {
        jsonResponse(false, 'Unauthorized. Please sign in to access this resource.', null, 401);
    }
    return [
        'id'       => $_SESSION['user_id'],
        'username' => $_SESSION['user_username'],
        'fullName' => $_SESSION['user_fullname'],
        'role'     => $_SESSION['user_role']
    ];
}

// Require admin privileges
function requireAdmin() {
    $user = requireAuth();
    if ($user['role'] !== 'admin') {
        jsonResponse(false, 'Forbidden. Administrator privileges are required.', null, 403);
    }
    return $user;
}

// Read JSON input or POST form body securely
function getRequestBody() {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'application/json') !== false) {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
    return $_POST;
}
