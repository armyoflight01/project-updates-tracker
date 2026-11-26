<?php
/**
 * Franchise Ready Saudi Arabia (فرنشايز ريدي السعودية)
 * Projects API Endpoint
 * Handles: Listing, Filtering, Search, Creation, Updates, Deletions, and History Tracking
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
    // GET - Retrieve Projects (with optional filters)
    // ----------------------------------------------------
    if ($method === 'GET') {
        $status = trim($_GET['status'] ?? '');
        $search = trim($_GET['search'] ?? '');
        $id     = isset($_GET['id']) ? (int)$_GET['id'] : 0;

        // Fetch single project by ID
        if ($id > 0) {
            $stmt = $pdo->prepare("SELECT * FROM `projects` WHERE `id` = ?");
            $stmt->execute([$id]);
            $proj = $stmt->fetch();
            if (!$proj) {
                jsonResponse(false, 'Project not found.', null, 404);
            }
            jsonResponse(true, 'Project details', $proj);
        }

        // Build filtered query with prepared parameters
        $sql = "SELECT * FROM `projects` WHERE 1=1";
        $params = [];

        if (!empty($status) && $status !== 'all') {
            $sql .= " AND `status` = ?";
            $params[] = $status;
        }

        if (!empty($search)) {
            $sql .= " AND (`project_name` LIKE ? OR `project_code` LIKE ? OR `client_department` LIKE ? OR `project_manager` LIKE ? OR `latest_updates` LIKE ?)";
            $term = "%$search%";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY `id` DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $projects = $stmt->fetchAll();

        // Calculate KPI summaries
        $kpiStmt = $pdo->query("
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN `status` = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
                SUM(CASE WHEN `status` = 'Delayed / Urgent' THEN 1 ELSE 0 END) AS delayed,
                SUM(CASE WHEN `status` = 'Completed' THEN 1 ELSE 0 END) AS completed
            FROM `projects`
        ");
        $kpi = $kpiStmt->fetch();

        jsonResponse(true, 'Projects retrieved successfully', [
            'projects' => $projects,
            'kpis' => [
                'total'      => (int)$kpi['total'],
                'inProgress' => (int)$kpi['in_progress'],
                'delayed'    => (int)$kpi['delayed'],
                'completed'  => (int)$kpi['completed']
            ]
        ]);
    }

    // ----------------------------------------------------
    // POST / Action: create - Create new Project
    // ----------------------------------------------------
    if ($method === 'POST' && ($action === 'create' || empty($action))) {
        $body = getRequestBody();

        $code        = trim($body['project_code'] ?? $body['projectCode'] ?? '');
        $name        = trim($body['project_name'] ?? $body['projectName'] ?? '');
        $department  = trim($body['client_department'] ?? $body['clientDepartment'] ?? '');
        $manager     = trim($body['project_manager'] ?? $body['projectManager'] ?? '');
        $status      = trim($body['status'] ?? 'In Progress');
        $progress    = (int)($body['progress'] ?? 0);
        $dueDate     = trim($body['due_date'] ?? $body['dueDate'] ?? '');
        $latestUpdate= trim($body['latest_updates'] ?? $body['latestUpdates'] ?? '');
        $currentUser = $_SESSION['user_username'] ?? 'ibraheem01';

        // Validation
        if (empty($code) || empty($name) || empty($department) || empty($manager) || empty($dueDate) || empty($latestUpdate)) {
            jsonResponse(false, 'Please fill in all required fields.', null, 400);
        }

        $allowedStatuses = ['In Progress', 'Delayed / Urgent', 'Completed'];
        if (!in_array($status, $allowedStatuses)) {
            $status = 'In Progress';
        }

        $progress = max(0, min(100, $progress));

        // Check unique code
        $check = $pdo->prepare("SELECT `id` FROM `projects` WHERE `project_code` = ?");
        $check->execute([$code]);
        if ($check->fetch()) {
            jsonResponse(false, "Project code '{$code}' already exists. Please choose a unique code.", null, 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO `projects` 
            (`project_code`, `project_name`, `client_department`, `project_manager`, `status`, `progress`, `due_date`, `latest_updates`, `created_by`) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$code, $name, $department, $manager, $status, $progress, $dueDate, $latestUpdate, $currentUser]);
        $newId = $pdo->lastInsertId();

        // Also record in project_updates history
        $histStmt = $pdo->prepare("
            INSERT INTO `project_updates` (`project_id`, `update_text`, `updated_by`, `prev_status`, `new_status`, `prev_progress`, `new_progress`)
            VALUES (?, ?, ?, NULL, ?, 0, ?)
        ");
        $histStmt->execute([$newId, $latestUpdate, $currentUser, $status, $progress]);

        logAudit('PROJECT_CREATED', "Created project #{$code}: {$name}", null, $currentUser);

        jsonResponse(true, 'Project created successfully!', ['id' => (int)$newId], 201);
    }

    // ----------------------------------------------------
    // POST / Action: update - Modify Project
    // ----------------------------------------------------
    if ($method === 'POST' && $action === 'update') {
        $body = getRequestBody();

        $id          = (int)($body['id'] ?? 0);
        $code        = trim($body['project_code'] ?? $body['projectCode'] ?? '');
        $name        = trim($body['project_name'] ?? $body['projectName'] ?? '');
        $department  = trim($body['client_department'] ?? $body['clientDepartment'] ?? '');
        $manager     = trim($body['project_manager'] ?? $body['projectManager'] ?? '');
        $status      = trim($body['status'] ?? 'In Progress');
        $progress    = (int)($body['progress'] ?? 0);
        $dueDate     = trim($body['due_date'] ?? $body['dueDate'] ?? '');
        $latestUpdate= trim($body['latest_updates'] ?? $body['latestUpdates'] ?? '');
        $currentUser = $_SESSION['user_username'] ?? 'ibraheem01';

        if ($id <= 0) {
            jsonResponse(false, 'Missing project ID.', null, 400);
        }

        // Fetch current project state
        $currStmt = $pdo->prepare("SELECT * FROM `projects` WHERE `id` = ?");
        $currStmt->execute([$id]);
        $existing = $currStmt->fetch();

        if (!$existing) {
            jsonResponse(false, 'Project not found.', null, 404);
        }

        // Check code uniqueness against other projects
        $check = $pdo->prepare("SELECT `id` FROM `projects` WHERE `project_code` = ? AND `id` != ?");
        $check->execute([$code, $id]);
        if ($check->fetch()) {
            jsonResponse(false, "Project code '{$code}' already exists for another project.", null, 400);
        }

        $allowedStatuses = ['In Progress', 'Delayed / Urgent', 'Completed'];
        if (!in_array($status, $allowedStatuses)) {
            $status = $existing['status'];
        }
        $progress = max(0, min(100, $progress));

        $stmt = $pdo->prepare("
            UPDATE `projects` 
            SET `project_code` = ?, `project_name` = ?, `client_department` = ?, `project_manager` = ?, 
                `status` = ?, `progress` = ?, `due_date` = ?, `latest_updates` = ?
            WHERE `id` = ?
        ");
        $stmt->execute([$code, $name, $department, $manager, $status, $progress, $dueDate, $latestUpdate, $id]);

        // Record update history if changed
        if ($existing['latest_updates'] !== $latestUpdate || $existing['status'] !== $status || $existing['progress'] != $progress) {
            $histStmt = $pdo->prepare("
                INSERT INTO `project_updates` (`project_id`, `update_text`, `updated_by`, `prev_status`, `new_status`, `prev_progress`, `new_progress`)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $histStmt->execute([$id, $latestUpdate, $currentUser, $existing['status'], $status, $existing['progress'], $progress]);
        }

        logAudit('PROJECT_UPDATED', "Updated project #{$code}: {$name}", null, $currentUser);

        jsonResponse(true, 'Project updated successfully!');
    }

    // ----------------------------------------------------
    // POST / Action: quick_update - Update inline text/status
    // ----------------------------------------------------
    if ($method === 'POST' && $action === 'quick_update') {
        $body = getRequestBody();
        $id = (int)($body['id'] ?? 0);
        $updateText = trim($body['latest_updates'] ?? $body['latestUpdates'] ?? '');
        $status = isset($body['status']) ? trim($body['status']) : null;
        $progress = isset($body['progress']) ? (int)$body['progress'] : null;
        $currentUser = $_SESSION['user_username'] ?? 'ibraheem01';

        if ($id <= 0) {
            jsonResponse(false, 'Missing project ID.', null, 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM `projects` WHERE `id` = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            jsonResponse(false, 'Project not found.', null, 404);
        }

        $newText = !empty($updateText) ? $updateText : $existing['latest_updates'];
        $newStatus = $status ?? $existing['status'];
        $newProgress = $progress !== null ? max(0, min(100, $progress)) : $existing['progress'];

        $upd = $pdo->prepare("
            UPDATE `projects` 
            SET `latest_updates` = ?, `status` = ?, `progress` = ? 
            WHERE `id` = ?
        ");
        $upd->execute([$newText, $newStatus, $newProgress, $id]);

        // Record history
        $histStmt = $pdo->prepare("
            INSERT INTO `project_updates` (`project_id`, `update_text`, `updated_by`, `prev_status`, `new_status`, `prev_progress`, `new_progress`)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $histStmt->execute([$id, $newText, $currentUser, $existing['status'], $newStatus, $existing['progress'], $newProgress]);

        logAudit('PROJECT_QUICK_UPDATE', "Quick update on project #{$existing['project_code']}", null, $currentUser);

        jsonResponse(true, 'Quick update saved!');
    }

    // ----------------------------------------------------
    // POST / Action: delete - Delete Project
    // ----------------------------------------------------
    if ($method === 'POST' && $action === 'delete') {
        $body = getRequestBody();
        $id = (int)($body['id'] ?? 0);
        $currentUser = $_SESSION['user_username'] ?? 'ibraheem01';

        if ($id <= 0) {
            jsonResponse(false, 'Missing project ID.', null, 400);
        }

        $stmt = $pdo->prepare("SELECT `project_code`, `project_name` FROM `projects` WHERE `id` = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            jsonResponse(false, 'Project not found.', null, 404);
        }

        $del = $pdo->prepare("DELETE FROM `projects` WHERE `id` = ?");
        $del->execute([$id]);

        logAudit('PROJECT_DELETED', "Deleted project #{$existing['project_code']}: {$existing['project_name']}", null, $currentUser);

        jsonResponse(true, 'Project deleted successfully.');
    }

    jsonResponse(false, 'Invalid request action or method.', null, 400);

} catch (Exception $e) {
    jsonResponse(false, 'Server Error: ' . $e->getMessage(), null, 500);
}
