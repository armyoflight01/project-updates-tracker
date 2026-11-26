<?php
/**
 * Franchise Ready Saudi Arabia (فرنشايز ريدي السعودية)
 * Departments API Endpoint
 * Handles: Department Listing and Adding New Departments
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
    // GET - Retrieve Departments
    // ----------------------------------------------------
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT `id`, `name`, `code`, `description`, `created_at` FROM `departments` ORDER BY `name` ASC");
        $departments = $stmt->fetchAll();

        jsonResponse(true, 'Departments retrieved successfully', $departments);
    }

    // ----------------------------------------------------
    // POST - Add New Department
    // ----------------------------------------------------
    if ($method === 'POST') {
        $body = getRequestBody();
        $name = trim($body['name'] ?? '');
        $code = trim($body['code'] ?? '');
        $desc = trim($body['description'] ?? '');

        if (empty($name)) {
            jsonResponse(false, 'Department name cannot be empty.', null, 400);
        }

        // Check if already exists
        $check = $pdo->prepare("SELECT `id`, `name` FROM `departments` WHERE LOWER(`name`) = LOWER(?)");
        $check->execute([$name]);
        $existing = $check->fetch();

        if ($existing) {
            jsonResponse(false, "Department '{$name}' already exists.", ['id' => (int)$existing['id'], 'name' => $existing['name']], 409);
        }

        $stmt = $pdo->prepare("INSERT INTO `departments` (`name`, `code`, `description`) VALUES (?, ?, ?)");
        $stmt->execute([$name, !empty($code) ? $code : null, !empty($desc) ? $desc : null]);
        $newId = $pdo->lastInsertId();

        logAudit('DEPARTMENT_CREATED', "Added new department: {$name}");

        jsonResponse(true, "Department '{$name}' created successfully!", [
            'id'   => (int)$newId,
            'name' => $name,
            'code' => $code
        ], 201);
    }

    jsonResponse(false, 'Invalid request method.', null, 400);

} catch (Exception $e) {
    jsonResponse(false, 'Server Error: ' . $e->getMessage(), null, 500);
}
