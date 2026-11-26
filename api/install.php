<?php
/**
 * Franchise Ready Saudi Arabia (فرنشايز ريدي السعودية)
 * Automated Database Installer & Diagnostic Utility
 * 
 * Access via browser:
 *   http://localhost/YARAMAYA-SIDELINE-PROJECT/project&updates-tracker/api/install.php
 */

require_once __DIR__ . '/db.php';

$format = $_GET['format'] ?? 'html';
$action = $_POST['action'] ?? $_GET['action'] ?? '';

$status = [
    'connected'     => false,
    'db_exists'     => false,
    'tables_count'  => 0,
    'users_count'   => 0,
    'projects_count'=> 0,
    'depts_count'   => 0,
    'message'       => '',
    'error'         => ''
];

try {
    // 1. Try to connect to MySQL server
    $pdoServer = getDbConnection(false);
    $status['connected'] = true;

    // 2. Check if database exists
    $stmt = $pdoServer->query("SHOW DATABASES LIKE '" . DB_NAME . "'");
    if ($stmt->fetch()) {
        $status['db_exists'] = true;

        // Connect to database directly
        $pdo = getDbConnection(true);
        $tablesStmt = $pdo->query("SHOW TABLES");
        $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);
        $status['tables_count'] = count($tables);

        if (in_array('users', $tables)) {
            $status['users_count'] = (int)$pdo->query("SELECT COUNT(*) FROM `users`")->fetchColumn();
        }
        if (in_array('projects', $tables)) {
            $status['projects_count'] = (int)$pdo->query("SELECT COUNT(*) FROM `projects`")->fetchColumn();
        }
        if (in_array('departments', $tables)) {
            $status['depts_count'] = (int)$pdo->query("SELECT COUNT(*) FROM `departments`")->fetchColumn();
        }
    }

    // 3. Handle Installation / Re-installation
    if ($action === 'install' || $action === 'reset') {
        $sqlFile = dirname(__DIR__) . '/database.sql';
        if (!file_exists($sqlFile)) {
            throw new Exception("SQL file not found at: " . $sqlFile);
        }

        $sql = file_get_contents($sqlFile);
        
        // Execute schema
        $pdoServer->exec($sql);

        // Re-check
        $pdo = getDbConnection(true);
        $tablesStmt = $pdo->query("SHOW TABLES");
        $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);
        $status['db_exists'] = true;
        $status['tables_count'] = count($tables);
        $status['users_count'] = (int)$pdo->query("SELECT COUNT(*) FROM `users`")->fetchColumn();
        $status['projects_count'] = (int)$pdo->query("SELECT COUNT(*) FROM `projects`")->fetchColumn();
        $status['depts_count'] = (int)$pdo->query("SELECT COUNT(*) FROM `departments`")->fetchColumn();
        $status['message'] = 'Database and authentic Franchise Ready datasets installed successfully!';
    } elseif ($action === 'clear_lockout') {
        if ($status['db_exists']) {
            $pdo = getDbConnection(true);
            $pdo->exec("DELETE FROM `login_attempts`");
            $status['message'] = 'Login attempt limits reset successfully! You can sign in immediately.';
        }
    }

} catch (Exception $e) {
    $status['error'] = $e->getMessage();
}

// JSON format output
if ($format === 'json') {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => empty($status['error']) && $status['db_exists'],
        'status'  => $status
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// HTML Diagnostic Dashboard
?>
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Franchise Ready | Database Setup & Diagnostics</title>
  <link rel="icon" type="image/png" href="../assets/logo.png">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cairo:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #3654a4;
      --navy: #1a326b;
      --dark: #10214a;
      --accent: #ec173a;
      --bg: #f4f6fb;
      --surface: #ffffff;
      --text: #1e293b;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      background: linear-gradient(135deg, #10214a 0%, #1a326b 40%, #29478c 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      color: var(--text);
    }
    .install-card {
      background: var(--surface);
      width: 100%;
      max-width: 680px;
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.35);
      overflow: hidden;
      border-top: 5px solid var(--accent);
    }
    .header {
      padding: 32px 32px 24px;
      text-align: center;
      background: #fafbfe;
      border-bottom: 1px solid var(--border);
    }
    .logo-img {
      max-width: 220px;
      height: auto;
      margin-bottom: 16px;
    }
    .title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--dark);
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-top: 4px;
    }
    .content {
      padding: 32px;
    }
    .alert {
      padding: 14px 18px;
      border-radius: 10px;
      margin-bottom: 24px;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .alert-success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .alert-danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    .alert-warning { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }

    .diagnostics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 28px;
    }
    .diag-item {
      padding: 16px;
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: 12px;
    }
    .diag-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 700;
      margin-bottom: 6px;
    }
    .diag-val {
      font-size: 1.15rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-badge {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .badge-ok { background: var(--success); box-shadow: 0 0 10px rgba(16,185,129,0.5); }
    .badge-fail { background: var(--danger); box-shadow: 0 0 10px rgba(239,68,68,0.5); }

    .creds-panel {
      background: #f1f5f9;
      border-left: 4px solid var(--primary);
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 28px;
      font-size: 0.9rem;
    }
    .creds-title { font-weight: 700; color: var(--navy); margin-bottom: 8px; }
    .creds-row { display: flex; gap: 20px; flex-wrap: wrap; }
    code {
      background: #e2e8f0;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      color: var(--accent);
      font-family: monospace;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .btn {
      padding: 14px 24px;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      text-align: center;
      text-decoration: none;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-primary {
      background: var(--primary);
      color: #fff;
    }
    .btn-primary:hover {
      background: var(--navy);
      transform: translateY(-1px);
    }
    .btn-success {
      background: var(--success);
      color: #fff;
    }
    .btn-success:hover {
      background: #059669;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: #e2e8f0;
      color: var(--dark);
    }
    .btn-secondary:hover {
      background: #cbd5e1;
    }
    .footer {
      padding: 16px 32px;
      text-align: center;
      background: #fafbfe;
      border-top: 1px solid var(--border);
      font-size: 0.8rem;
      color: var(--text-muted);
    }
  </style>
</head>
<body>

  <div class="install-card">
    <div class="header">
      <img src="../assets/logo.png" alt="Franchise Ready Logo" class="logo-img">
      <h1 class="title">Database Setup & Diagnostics</h1>
      <p class="subtitle">Franchise Ready Saudi Arabia • Project & Updates Tracker</p>
    </div>

    <div class="content">
      <?php if (!empty($status['message'])): ?>
        <div class="alert alert-success">
          <span>✓</span>
          <span><strong>Success!</strong> <?= htmlspecialchars($status['message']) ?></span>
        </div>
      <?php elseif (!empty($status['error'])): ?>
        <div class="alert alert-danger">
          <span>✕</span>
          <span><strong>Setup Notice:</strong> <?= htmlspecialchars($status['error']) ?></span>
        </div>
      <?php elseif ($status['db_exists'] && $status['tables_count'] >= 6): ?>
        <div class="alert alert-success">
          <span>✓</span>
          <span>Database is healthy, active, and populated with enterprise real data!</span>
        </div>
      <?php else: ?>
        <div class="alert alert-warning">
          <span>⚠️</span>
          <span>Database is not yet initialized. Click the button below to install with 1-click!</span>
        </div>
      <?php endif; ?>

      <div class="diagnostics-grid">
        <div class="diag-item">
          <div class="diag-label">MySQL Server (127.0.0.1:<?= DB_PORT ?>)</div>
          <div class="diag-val">
            <span class="status-badge <?= $status['connected'] ? 'badge-ok' : 'badge-fail' ?>"></span>
            <span><?= $status['connected'] ? 'Connected' : 'Offline / Failed' ?></span>
          </div>
        </div>

        <div class="diag-item">
          <div class="diag-label">Database (<?= DB_NAME ?>)</div>
          <div class="diag-val">
            <span class="status-badge <?= $status['db_exists'] ? 'badge-ok' : 'badge-fail' ?>"></span>
            <span><?= $status['db_exists'] ? 'Installed' : 'Missing' ?></span>
          </div>
        </div>

        <div class="diag-item">
          <div class="diag-label">Tables Created</div>
          <div class="diag-val">
            <span><?= $status['tables_count'] ?> / 6 Tables</span>
          </div>
        </div>

        <div class="diag-item">
          <div class="diag-label">Sample Data Loaded</div>
          <div class="diag-val">
            <span><?= $status['projects_count'] ?> Projects &bull; <?= $status['users_count'] ?> Users</span>
          </div>
        </div>
      </div>

      <div class="creds-panel">
        <div class="creds-title">Enterprise Default Admin Credentials:</div>
        <div class="creds-row">
          <div><strong>Username:</strong> <code>ibraheem01</code></div>
          <div><strong>Password:</strong> <code>123456789</code></div>
          <div><strong>Role:</strong> <code>System Administrator</code></div>
        </div>
      </div>

      <div class="actions">
        <?php if (!$status['db_exists'] || $status['tables_count'] < 6): ?>
          <form method="POST">
            <input type="hidden" name="action" value="install">
            <button type="submit" class="btn btn-success" style="width:100%;">
              <span>🚀 1-Click Install Database & Real Data</span>
            </button>
          </form>
        <?php else: ?>
          <a href="../index.html" class="btn btn-primary">
            <span>📊 Open Project Tracker Dashboard &rarr;</span>
          </a>
          <a href="../login.html" class="btn btn-secondary">
            <span>🔐 Go to Standalone Login Portal</span>
          </a>
          <form method="POST" style="margin-top: 6px;">
            <input type="hidden" name="action" value="clear_lockout">
            <button type="submit" class="btn btn-secondary" style="width:100%; font-size: 0.85rem; color: #10b981;">
              <span>🔓 Reset / Clear Login Lockout Attempts</span>
            </button>
          </form>
          <form method="POST" onsubmit="return confirm('Are you sure you want to reset and reinstall the database?');" style="margin-top: 6px;">
            <input type="hidden" name="action" value="reset">
            <button type="submit" class="btn btn-secondary" style="width:100%; font-size: 0.85rem; color: #ef4444;">
              <span>🔄 Reset / Re-import Sample Data</span>
            </button>
          </form>
        <?php endif; ?>
      </div>
    </div>

    <div class="footer">
      &copy; <?= date('Y') ?> Franchise Ready Saudi Arabia &bull; فرنشايز ريدي السعودية. All rights reserved.
    </div>
  </div>

</body>
</html>
