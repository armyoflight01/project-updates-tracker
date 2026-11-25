# Franchise Ready (فرنشايز ريدي السعودية) - Project & Updates Tracker

An executive-level operational tracker designed for **Franchise Ready Saudi Arabia**. Built with pure **HTML5, CSS3, and Vanilla JavaScript**, featuring full bilingual support (**English & Arabic RTL**), complete brand integration with the official Franchise Ready logo, colors, role-based authentication (**Admin & User**), dynamic client/department management, and 100% responsiveness on mobile, tablet, and desktop.

---

## 🔐 Authentication & Access Control

- **Pre-configured Admin Account**:
  - **Username**: `ibraheem01`
  - **Password**: `123456789`
- **Role Capabilities**:
  - **Admin (Full Control)**:
    - Add, edit, and delete projects.
    - Change admin username & password (Profile / Password Settings).
    - Access **User Management**: create new users/admins, view registered accounts, and delete users.
    - Create and manage custom Clients / Departments.
  - **User (Standard Access)**:
    - View projects, search, filter, export to CSV, print executive reports, and log operational updates.
    - Change their own password.
    - Restricted from modifying user accounts or deleting projects.
  - **Guest Mode**:
    - Instant preview without login.

---

## 🏢 Dynamic Client / Department Selection

- **Choose or Add Department**:
  - In the "Add / Edit Project" modal, the **Client / Department** field features an interactive dropdown of existing departments.
  - Includes a dedicated **`+ Add Department`** button right next to the label.
  - Clicking the button opens an inline prompt to type a new department name (e.g. *Digital Transformation*, *Franchise Operations*, *Hospitality*), which is instantly added to the list, selected, and saved to `localStorage`.

---

## 🌐 Full Bilingual Support (English & Arabic)

- **One-Click Instant Toggle**: Click the **🌐 العربية / English** button in the top navigation bar to toggle between English and Arabic.
- **RTL & LTR Automatic Layout**:
  - Automatically switches document direction (`dir="rtl"` vs `dir="ltr"`).
  - Uses Google's **Cairo** typography for Arabic and **Plus Jakarta Sans** for English.
  - Mirrored table alignments, search bars, KPI indicator borders, and dialogs.
- **Persistent Language Preference**: Saves your language choice in `localStorage` so the site remains in Arabic or English across page refreshes.

---

## 🌟 Key Features

1. **Dashboard Overview**:
   - 4 Dynamic KPI metrics cards (**Total Projects / إجمالي المشاريع**, **In Progress / قيد التنفيذ**, **Delayed / Urgent / متأخر وعاجل**, **Completed / مكتمل**).
   - Real-time date indicator in localized format.
   - Live pulsating status badge (`● Live Status / حالة مباشرة`).

2. **Full Project Management (CRUD)**:
   - **Add Project**: Auto-suggests project code (`PRJ-106`), handles title, client department selection/quick-add, project manager, status, due date, live progress slider, and operational updates in both languages.
   - **Edit Project**: Modal with pre-filled project parameters.
   - **Delete Project**: Confirmation modal with safeguards.
   - **Inline Updates Editing**: Click directly on any "Latest Updates" cell in the table to log quick updates without opening the full form.

3. **Search, Filter & Sorting**:
   - **Real-Time Live Search**: Filters across codes, project titles, client departments, managers, and update notes in both English and Arabic.
   - **Status Tabs**: Filter by *All Projects*, *In Progress*, *Delayed / Urgent*, and *Completed* with live count indicators.
   - **Column Sorting**: Sort ascending/descending by Due Date, Progress, Manager, or Department.

4. **Zero-Configuration Local Database**:
   - Built-in persistent browser **LocalStorage**.
   - No external database (MySQL) or PHP backend required.
   - "Reset Sample Data / استعادة البيانات التجريبية" button to restore default demo records anytime.

5. **100% Responsive (Mobile, Tablet, Desktop)**:
   - **Desktop**: Full data table with avatar badges, progress bars, and action icons.
   - **Tablet**: Adaptive 2-column KPI grid and fluid layout.
   - **Mobile**: Responsive card view with clear data labels, touch-friendly modals, and a floating **`+` Action Button (FAB)** in the bottom corner (mirrored to the left in RTL mode).

6. **Export & Print**:
   - **Print / Save as PDF**: Clean executive report print styling (`@media print`) featuring the Franchise Ready corporate letterhead format.
   - **Export CSV**: Instant one-click spreadsheet download for Excel or Google Sheets in the active language.

---

## 🚀 How to Open

- **Direct Open**: Double-click [index.html](file:///c:/xampp/htdocs/YARAMAYA-SIDELINE-PROJECT/project&updates-tracker/index.html) in your browser.
- **Via XAMPP**: Start Apache in XAMPP and go to:
  ```
  http://localhost/YARAMAYA-SIDELINE-PROJECT/project&updates-tracker/
  ```
