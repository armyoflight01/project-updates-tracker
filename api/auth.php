<?php
/**
 * Franchise Ready Saudi Arabia (فرنشايز ريدي السعودية)
 * Authentication API Endpoint
 * Handles: Login, Logout, Session Verification, Password Change
 */

require_once __DIR__ . '/security.php';

sendSecurityHeaders();
startSecureSession();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Preflight CORS handler
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $pdo = getDbConnection();

    // ----------------------------------------------------
    // GET ?action=check - Verify current logged-in session
    // ----------------------------------------------------
    if ($method === 'GET' && $action === 'check') {
        if (!empty($_SESSION['user_id'])) {
            // Verify user is still active in database
            $stmt = $pdo->prepare("SELECT `id`, `username`, `full_name`, `email`, `role`, `status` FROM `users` WHERE `id` = ? AND `status` = 'active'");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();

            if ($user) {
                jsonResponse(true, 'Authenticated', [
                    'id'       => (int)$user['id'],
                    'username' => $user['username'],
                    'fullName' => $user['full_name'],
                    'email'    => $user['email'],
                    'role'     => $user['role']
                ]);
            } else {
                session_unset();
                session_destroy();
                jsonResponse(false, 'Session expired or user inactive', null, 401);
            }
        }
        jsonResponse(false, 'Guest mode - not authenticated', null, 200);
    }

    // ----------------------------------------------------
    // GET/POST ?action=unlock - Clear any failed login throttle
    // ----------------------------------------------------
    if ($action === 'unlock') {
        resetAllFailedLogins();
        jsonResponse(true, 'Login attempts counter has been cleared. You can sign in now.');
    }

    // ----------------------------------------------------
    // POST ?action=login - Authenticate with rate limiting & bcrypt
    // ----------------------------------------------------
    if ($method === 'POST' && ($action === 'login' || empty($action))) {
        $body = getRequestBody();
        $username = trim($body['username'] ?? '');
        $password = $body['password'] ?? '';

        if (empty($username) || empty($password)) {
            jsonResponse(false, 'Please provide both username and password.', null, 400);
        }

        // 1. Check Brute-Force Rate Limiting (bypassed on localhost and for admin)
        if (!checkBruteForce($username)) {
            logAudit('LOGIN_LOCKED', "Brute force lock triggered for: $username");
            jsonResponse(false, 'Too many failed login attempts. Please wait 10 minutes before trying again.', null, 429);
        }

        // 2. Fetch User by Username (Case-insensitive)
        $stmt = $pdo->prepare("SELECT `id`, `username`, `password`, `full_name`, `email`, `role`, `status` FROM `users` WHERE LOWER(`username`) = LOWER(?)");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        // 3. Verify Password (supports BCRYPT and fallback plain-text with auto-upgrade)
        $passwordMatches = false;
        if ($user && ($user['status'] === 'active' || empty($user['status']))) {
            if (password_verify($password, $user['password'])) {
                $passwordMatches = true;
            } elseif ($password === $user['password']) {
                $passwordMatches = true;
                // Upgrade plain-text password to secure BCRYPT immediately
                $newHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
                $updHash = $pdo->prepare("UPDATE `users` SET `password` = ? WHERE `id` = ?");
                $updHash->execute([$newHash, $user['id']]);
            }
        }

        if ($user && $passwordMatches) {
            // Clear brute force counter
            clearFailedLogins($username);

            // Regenerate session ID to prevent session fixation attacks
            session_regenerate_id(true);

            // Populate session
            $_SESSION['user_id']       = (int)$user['id'];
            $_SESSION['user_username'] = $user['username'];
            $_SESSION['user_fullname'] = $user['full_name'];
            $_SESSION['user_role']     = $user['role']; // 'admin' or 'user'
            $_SESSION['logged_in_at']  = time();

            // Update last_login in database
            $upd = $pdo->prepare("UPDATE `users` SET `last_login` = NOW() WHERE `id` = ?");
            $upd->execute([$user['id']]);

            // Audit Log
            logAudit('LOGIN_SUCCESS', "User {$user['username']} logged in successfully as {$user['role']}", $user['id'], $user['username']);

            jsonResponse(true, 'Sign in successful. Welcome!', [
                'id'       => (int)$user['id'],
                'username' => $user['username'],
                'fullName' => $user['full_name'],
                'email'    => $user['email'],
                'role'     => $user['role']
            ]);
        } else {
            // Record failure for throttling
            recordFailedLogin($username);
            logAudit('LOGIN_FAILED', "Failed sign-in attempt for username: $username");
            jsonResponse(false, 'Invalid username or password. Please verify your credentials.', null, 401);
        }
    }

    // ----------------------------------------------------
    // POST ?action=logout - Destroy Session
    // ----------------------------------------------------
    if ($method === 'POST' && $action === 'logout') {
        if (!empty($_SESSION['user_username'])) {
            logAudit('LOGOUT', "User {$_SESSION['user_username']} signed out");
        }
        
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        jsonResponse(true, 'Signed out successfully.');
    }

    // ----------------------------------------------------
    // POST ?action=change_password - Change credentials
    // ----------------------------------------------------
    if ($method === 'POST' && $action === 'change_password') {
        $body = getRequestBody();
        $oldPassword = $body['oldPassword'] ?? '';
        $newPassword = $body['newPassword'] ?? '';
        $currentUsername = trim($body['currentUsername'] ?? $_SESSION['user_username'] ?? '');

        if (empty($currentUsername)) {
            jsonResponse(false, 'Unable to identify user account. Please sign in again.', null, 401);
        }

        if (empty($newPassword) || strlen($newPassword) < 6) {
            jsonResponse(false, 'New password must be at least 6 characters long.', null, 400);
        }

        // Fetch user from DB
        $stmt = $pdo->prepare("SELECT `id`, `username`, `password`, `full_name`, `role` FROM `users` WHERE LOWER(`username`) = LOWER(?)");
        $stmt->execute([$currentUsername]);
        $targetUser = $stmt->fetch();

        if (!$targetUser) {
            jsonResponse(false, 'User not found in system database.', null, 404);
        }

        // Verify current password (supports BCRYPT and fallback plain-text)
        $dbPass = $targetUser['password'];
        $oldMatches = (password_verify($oldPassword, $dbPass) || $oldPassword === $dbPass);

        if (!$oldMatches) {
            jsonResponse(false, 'Current password is incorrect.', null, 400);
        }

        $newUsername = trim($body['newUsername'] ?? $targetUser['username']);
        $newFullName = trim($body['newFullName'] ?? $targetUser['full_name']);

        if (empty($newUsername)) {
            $newUsername = $targetUser['username'];
        }

        // Check if username is changing and ensure uniqueness
        if (strtolower($newUsername) !== strtolower($targetUser['username'])) {
            $checkStmt = $pdo->prepare("SELECT `id` FROM `users` WHERE LOWER(`username`) = LOWER(?) AND `id` != ?");
            $checkStmt->execute([$newUsername, $targetUser['id']]);
            if ($checkStmt->fetch()) {
                jsonResponse(false, "Username '{$newUsername}' is already taken by another user.", null, 400);
            }
        }

        // Hash new password securely with BCRYPT
        $newHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 10]);

        $updateStmt = $pdo->prepare("
            UPDATE `users` 
            SET `password` = ?, `username` = ?, `full_name` = ? 
            WHERE `id` = ?
        ");
        $updateStmt->execute([$newHash, $newUsername, $newFullName, $targetUser['id']]);

        // Update active session
        $_SESSION['user_id']       = (int)$targetUser['id'];
        $_SESSION['user_username'] = $newUsername;
        $_SESSION['user_fullname'] = $newFullName;
        $_SESSION['user_role']     = $targetUser['role'];

        logAudit('PASSWORD_CHANGED', "User '{$targetUser['username']}' updated credentials. New username: '{$newUsername}'.");

        jsonResponse(true, 'Password and credentials updated successfully! Old password is now disabled.', [
            'id'       => (int)$targetUser['id'],
            'username' => $newUsername,
            'fullName' => $newFullName,
            'role'     => $targetUser['role']
        ]);
    }

    jsonResponse(false, 'Invalid request action or method.', null, 400);

} catch (Exception $e) {
    jsonResponse(false, 'Server Error: ' . $e->getMessage(), null, 500);
}
