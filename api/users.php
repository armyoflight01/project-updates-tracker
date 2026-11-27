<?php
/**
 * Franchise Ready Saudi Arabia (فرنشايز ريدي السعودية)
 * User Management API Endpoint (Admin Restricted)
 * Handles: User Listing, Creation, Modification, and Deletion
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
    // GET - Retrieve all users (Admin only)
    // ----------------------------------------------------
    if ($method === 'GET') {
        requireAdmin();

        $stmt = $pdo->query("
            SELECT `id`, `username`, `full_name`, `email`, `role`, `status`, `last_login`, `created_at` 
            FROM `users` 
            ORDER BY `id` ASC
        ");
        $users = $stmt->fetchAll();

        jsonResponse(true, 'Users retrieved successfully', $users);
    }

    // ----------------------------------------------------
    // POST / Action: create - Create User (Admin only)
    // ----------------------------------------------------
    if ($method === 'POST' && ($action === 'create' || empty($action))) {
        $admin = requireAdmin();
        $body = getRequestBody();

        $username = trim($body['username'] ?? '');
        $password = $body['password'] ?? '';
        $fullName = trim($body['fullName'] ?? $body['full_name'] ?? '');
        $email    = trim($body['email'] ?? '');
        $role     = trim($body['role'] ?? 'user');

        if (empty($username) || empty($password) || empty($fullName)) {
            jsonResponse(false, 'Username, password, and full name are required.', null, 400);
        }

        if (strlen($password) < 6) {
            jsonResponse(false, 'Password must be at least 6 characters long.', null, 400);
        }

        $role = ($role === 'admin') ? 'admin' : 'user';

        // Check if username exists
        $check = $pdo->prepare("SELECT `id` FROM `users` WHERE LOWER(`username`) = LOWER(?)");
        $check->execute([$username]);
        if ($check->fetch()) {
            jsonResponse(false, "Username '{$username}' is already in use.", null, 409);
        }

        // Hash password securely with BCRYPT
        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

        $stmt = $pdo->prepare("
            INSERT INTO `users` (`username`, `password`, `full_name`, `email`, `role`, `status`) 
            VALUES (?, ?, ?, ?, ?, 'active')
        ");
        $stmt->execute([$username, $hash, $fullName, !empty($email) ? $email : null, $role]);
        $newId = $pdo->lastInsertId();

        logAudit('USER_CREATED', "Admin {$admin['username']} created user '{$username}' ({$role})", $admin['id'], $admin['username']);

        jsonResponse(true, "User '{$username}' created successfully!", [
            'id'       => (int)$newId,
            'username' => $username,
            'fullName' => $fullName,
            'email'    => $email,
            'role'     => $role
        ], 201);
    }

    // ----------------------------------------------------
    // POST / Action: update - Edit User & Password (Admin only)
    // ----------------------------------------------------
    if ($method === 'POST' && $action === 'update') {
        $admin = requireAdmin();
        $body = getRequestBody();

        $id               = (int)($body['id'] ?? 0);
        $originalUsername = trim($body['originalUsername'] ?? '');
        $username         = trim($body['username'] ?? '');
        $fullName         = trim($body['fullName'] ?? $body['full_name'] ?? '');
        $email            = trim($body['email'] ?? '');
        $role             = trim($body['role'] ?? 'user');
        $status           = trim($body['status'] ?? 'active');
        $password         = $body['password'] ?? '';

        if (empty($username) || empty($fullName)) {
            jsonResponse(false, 'Username and full name are required.', null, 400);
        }

        // Verify target exists by ID or original username
        $target = null;
        if ($id > 0) {
            $currStmt = $pdo->prepare("SELECT * FROM `users` WHERE `id` = ?");
            $currStmt->execute([$id]);
            $target = $currStmt->fetch();
        }
        if (!$target && !empty($originalUsername)) {
            $currStmt = $pdo->prepare("SELECT * FROM `users` WHERE LOWER(`username`) = LOWER(?)");
            $currStmt->execute([$originalUsername]);
            $target = $currStmt->fetch();
            if ($target) $id = (int)$target['id'];
        }

        if (!$target) {
            jsonResponse(false, 'User not found in system database.', null, 404);
        }

        // Check unique username against other accounts
        $check = $pdo->prepare("SELECT `id` FROM `users` WHERE LOWER(`username`) = LOWER(?) AND `id` != ?");
        $check->execute([$username, $target['id']]);
        if ($check->fetch()) {
            jsonResponse(false, "Username '{$username}' is already in use by another account.", null, 409);
        }

        $role = ($role === 'admin') ? 'admin' : 'user';
        $status = in_array($status, ['active', 'inactive', 'suspended']) ? $status : 'active';

        // Update with optional new password
        if (!empty($password)) {
            if (strlen($password) < 6) {
                jsonResponse(false, 'Password must be at least 6 characters long.', null, 400);
            }
            $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
            $stmt = $pdo->prepare("
                UPDATE `users` 
                SET `username` = ?, `full_name` = ?, `email` = ?, `role` = ?, `status` = ?, `password` = ? 
                WHERE `id` = ?
            ");
            $stmt->execute([$username, $fullName, !empty($email) ? $email : null, $role, $status, $hash, $target['id']]);
        } else {
            $stmt = $pdo->prepare("
                UPDATE `users` 
                SET `username` = ?, `full_name` = ?, `email` = ?, `role` = ?, `status` = ? 
                WHERE `id` = ?
            ");
            $stmt->execute([$username, $fullName, !empty($email) ? $email : null, $role, $status, $target['id']]);
        }

        logAudit('USER_UPDATED', "Admin {$admin['username']} updated user ID #{$target['id']} ({$username})", $admin['id'], $admin['username']);

        jsonResponse(true, "User '{$username}' updated successfully!", [
            'id'       => (int)$target['id'],
            'username' => $username,
            'fullName' => $fullName,
            'email'    => $email,
            'role'     => $role,
            'status'   => $status
        ]);
    }

    // ----------------------------------------------------
    // POST / Action: delete - Delete User (Admin only)
    // ----------------------------------------------------
    if ($method === 'POST' && $action === 'delete') {
        $admin = requireAdmin();
        $body = getRequestBody();
        $id = (int)($body['id'] ?? 0);
        $username = trim($body['username'] ?? '');

        // Fetch target
        $target = null;
        if ($id > 0) {
            $stmt = $pdo->prepare("SELECT `id`, `username`, `role` FROM `users` WHERE `id` = ?");
            $stmt->execute([$id]);
            $target = $stmt->fetch();
        }
        if (!$target && !empty($username)) {
            $stmt = $pdo->prepare("SELECT `id`, `username`, `role` FROM `users` WHERE LOWER(`username`) = LOWER(?)");
            $stmt->execute([$username]);
            $target = $stmt->fetch();
        }

        if (!$target) {
            jsonResponse(false, 'User not found in system database.', null, 404);
        }

        // Prevent admin from deleting themselves
        if ((int)$target['id'] === (int)$admin['id'] || strtolower($target['username']) === strtolower($admin['username'])) {
            jsonResponse(false, 'You cannot delete your own active administrator account.', null, 400);
        }

        // Protect primary root admin
        if (strtolower($target['username']) === 'ibraheem01') {
            jsonResponse(false, 'The root administrator account (ibraheem01) cannot be deleted.', null, 403);
        }

        $del = $pdo->prepare("DELETE FROM `users` WHERE `id` = ?");
        $del->execute([$target['id']]);

        logAudit('USER_DELETED', "Admin {$admin['username']} deleted user '{$target['username']}'", $admin['id'], $admin['username']);

        jsonResponse(true, "User '{$target['username']}' has been deleted.");
    }

    jsonResponse(false, 'Invalid request action or method.', null, 400);

} catch (Exception $e) {
    jsonResponse(false, 'Server Error: ' . $e->getMessage(), null, 500);
}
