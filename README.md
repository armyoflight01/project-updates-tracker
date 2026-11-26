# Franchise Ready (فرنشايز ريدي السعودية) - Project & Updates Tracker

An enterprise executive operational tracker designed for **Franchise Ready Saudi Arabia**. Built with a **Secure PHP / MySQL (PDO) Enterprise Backend** and responsive **HTML5, CSS3, and JavaScript Frontend**, featuring full bilingual support (**English & Arabic RTL**), official Franchise Ready branding, role-based authentication (**Admin & User**), dynamic client/department management, audit trail logging, and brute-force security defense.

---

## 🗄️ Database & XAMPP Setup (2 Easy Options)

The application includes real enterprise data and is ready to run directly in your local XAMPP environment.

### Option 1: 1-Click Web Installer (Fastest & Easiest)
1. Open the **XAMPP Control Panel** and click **Start** for both **Apache** and **MySQL**.
2. Open your browser and navigate to:
   ```
   http://localhost/YARAMAYA-SIDELINE-PROJECT/project&updates-tracker/api/install.php
   ```
3. Click the **🚀 1-Click Install Database & Real Data** button.
4. The system will automatically create the database `franchise_ready_tracker`, create all 6 tables, and populate the real sample records!

---

### Option 2: Manual Import via phpMyAdmin
1. Start **Apache** and **MySQL** in XAMPP.
2. Open phpMyAdmin in your web browser:
   ```
   http://localhost/phpmyadmin/
   ```
3. Click on the **Import** tab in the top navigation bar.
4. Click **Choose File** and select:
   `c:\xampp\htdocs\YARAMAYA-SIDELINE-PROJECT\project&updates-tracker\database.sql`
5. Click **Import** (or **Go**) at the bottom.
6. Done! The database `franchise_ready_tracker` will be created with all tables and authentic sample data.

---

## 🔐 Default Authentication Credentials

All passwords in the database are secured using **BCRYPT** hashing.

| Role | Full Name | Username | Password |
|---|---|---|---|
| **System Administrator** | Ibraheem Al-Dosari | `ibraheem01` | `123456789` |
| **Project Manager** | Sarah Al-Mansoor | `s.almansoor` | `mansoor@2026` |
| **Development Lead** | Khalid Al-Otaibi | `k.alotaibi` | `otaibi@2026` |
| **Operations Lead** | Tariq Al-Dossary | `t.dossary` | `dossary@2026` |

---

## 🛡️ Enterprise Security Architecture

This release incorporates modern security standards to protect sensitive project data and user credentials:

1. **Strong Password Hashing (BCRYPT)**:
   - Uses PHP's native `password_hash($password, PASSWORD_BCRYPT)` and `password_verify()`.
   - Cleartext passwords are never stored in the database or logged in history.

2. **Native SQL Injection Prevention**:
   - 100% of database queries use PDO prepared statements with `PDO::ATTR_EMULATE_PREPARES => false`.
   - User inputs are strictly parameterized and validated.

3. **Session Hardening & Anti-Fixation**:
   - `session_regenerate_id(true)` is executed upon every successful sign-in.
   - Session cookies are protected with `httponly => true` (prevents XSS cookie theft) and `samesite => 'Lax'`.
   - Inactive sessions automatically expire after 8 hours.

4. **Brute-Force Rate Limiting**:
   - Monitored via the `login_attempts` table.
   - Throttles malicious sign-in attempts by locking out an IP address after 5 consecutive failed attempts for 10 minutes.

5. **Server-Side Role-Based Access Control (RBAC)**:
   - User Management endpoints (`api/users.php`) strictly verify administrator privileges (`requireAdmin()`) on the server side, preventing unauthorized access even if requested directly.

6. **Audit Trail Logging**:
   - Every sensitive event (logins, logouts, project creations, modifications, deletions, password updates) is logged in the `audit_logs` table with timestamp, IP address, and user agent.

7. **Strict Security HTTP Headers**:
   - `X-Content-Type-Options: nosniff` (prevents MIME type sniffing)
   - `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
   - `X-XSS-Protection: 1; mode=block`
   - `Content-Type: application/json; charset=UTF-8`

---

## 📁 Database Schema Overview (`franchise_ready_tracker`)

The database consists of 6 structured tables:

1. **`users`**: Secure user accounts, roles (`admin`, `user`), status (`active`, `suspended`), and last login timestamps.
2. **`departments`**: Divisions & client departments (e.g. *Business Development*, *Franchise Operations & Logistics*, *Events & Exhibitions*, *Marketing & Brand Identity*, *Quality & Regulatory Compliance*, *Legal & Contract Affairs*).
3. **`projects`**: Project codes, initiatives, departments, managers, status (`In Progress`, `Delayed / Urgent`, `Completed`), progress percentages, due dates, and latest updates.
4. **`project_updates`**: Audit history of all status and progress changes per project.
5. **`audit_logs`**: System-wide compliance and security activity log.
6. **`login_attempts`**: Security tracking for brute-force rate limiting.

---

## 🌐 Dual Mode: MySQL Backend + Offline Fallback

- **When hosted on XAMPP (`http://localhost/...`)**:
  - Automatically connects to the PHP REST API and MySQL database.
  - Displays a green indicator in the header: **`🟢 MySQL Connected`**.
  - All actions (CRUD, quick update, user management, department addition) persist directly into MySQL.

- **When opened directly offline (`file:///...`)**:
  - Automatically falls back to browser **LocalStorage** so the application continues to function without crashing.
  - Displays: **`🟡 LocalStorage Mode`**.

---

## 🚀 Accessing the Application

1. **Main Project & Updates Tracker**:
   ```
   http://localhost/YARAMAYA-SIDELINE-PROJECT/project&updates-tracker/index.html
   ```

2. **Executive Standalone Login Portal**:
   ```
   http://localhost/YARAMAYA-SIDELINE-PROJECT/project&updates-tracker/login.html
   ```

3. **Database Setup & Diagnostics Tool**:
   ```
   http://localhost/YARAMAYA-SIDELINE-PROJECT/project&updates-tracker/api/install.php
   ```
