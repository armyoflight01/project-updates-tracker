/**
 * Franchise Ready (فرنشايز ريدي السعودية) - Executive Tracker Controller
 * Full-featured pure JavaScript implementation with LocalStorage persistence,
 * Responsive UI, Print/PDF with Franchise Ready Branding, CSV Export, Inline Editing, and Search/Filters.
 */

(function () {
  'use strict';

  // Storage Key for Franchise Ready Tracker
  const STORAGE_KEY = 'franchise_ready_tracker_v1';

  // Sample Data matching the user's executive project portfolio
  const DEFAULT_SAMPLE_PROJECTS = [
    {
      id: 'PRJ-101',
      code: 'PRJ-101',
      name: 'Catering & Hospitality Division Launch',
      department: 'Business Development',
      manager: 'Khalid Al-Otaibi',
      status: 'In Progress',
      progress: 85,
      dueDate: '2026-12-05',
      latestUpdates: 'Corporate profile and buffet menus finalized; finalizing tableware supplier contracts.',
      updatedAt: '2 hours ago',
      lastModified: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: 'PRJ-102',
      code: 'PRJ-102',
      name: 'Specialty Coffee Bar & Expo Setup',
      department: 'Events & Exhibitions',
      manager: 'Sarah Al-Mansoor',
      status: 'Delayed / Urgent',
      progress: 60,
      dueDate: '2026-11-28',
      latestUpdates: 'Specialty coffee bar equipment shipment delayed at customs; backup local vendor sourced.',
      updatedAt: 'Today, 10:30 AM',
      lastModified: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    },
    {
      id: 'PRJ-103',
      code: 'PRJ-103',
      name: 'Hospitality Operations & Logistics Contract',
      department: 'Operations & Logistics',
      manager: 'Tariq Al-Dossary',
      status: 'Completed',
      progress: 100,
      dueDate: '2026-11-20',
      latestUpdates: 'Annual contract signed and full daily hospitality operations commenced with zero issues.',
      updatedAt: 'Yesterday',
      lastModified: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'PRJ-104',
      code: 'PRJ-104',
      name: 'Brand Identity & Omni-Channel Campaign',
      department: 'Marketing & Brand',
      manager: 'Noura Al-Ghamdi',
      status: 'In Progress',
      progress: 45,
      dueDate: '2026-12-15',
      latestUpdates: 'Brand identity assets completed; social media campaign launched across regional platforms.',
      updatedAt: 'Nov 21, 2026',
      lastModified: new Date('2026-11-21T09:00:00').toISOString()
    },
    {
      id: 'PRJ-105',
      code: 'PRJ-105',
      name: 'Food Safety & Hygiene Compliance Audit',
      department: 'Quality & Compliance',
      manager: 'Dr. Faisal Al-Harbi',
      status: 'In Progress',
      progress: 70,
      dueDate: '2026-12-01',
      latestUpdates: 'Internal hygiene audit conducted; final ISO certification assessment scheduled for next week.',
      updatedAt: 'Nov 18, 2026',
      lastModified: new Date('2026-11-18T14:30:00').toISOString()
    }
  ];

  // Application State
  let projects = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let sortColumn = 'dueDate';
  let sortDirection = 'asc'; // 'asc' | 'desc'
  let deleteTargetId = null;

  // DOM Elements
  const el = {
    // Header
    dateText: document.getElementById('dateText'),
    btnPrint: document.getElementById('btnPrint'),
    btnExportCSV: document.getElementById('btnExportCSV'),
    btnOpenNewModal: document.getElementById('btnOpenNewModal'),
    fabNewProject: document.getElementById('fabNewProject'),
    printDateStamp: document.getElementById('printDateStamp'),

    // KPIs
    kpiTotal: document.getElementById('kpiTotal'),
    kpiInProgress: document.getElementById('kpiInProgress'),
    kpiDelayed: document.getElementById('kpiDelayed'),
    kpiCompleted: document.getElementById('kpiCompleted'),

    // Filter counts
    countAll: document.getElementById('countAll'),
    countInProgress: document.getElementById('countInProgress'),
    countDelayed: document.getElementById('countDelayed'),
    countCompleted: document.getElementById('countCompleted'),

    // Search & Filters
    searchInput: document.getElementById('searchInput'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    filterButtons: document.querySelectorAll('.filter-btn'),

    // Table
    table: document.getElementById('projectsTable'),
    tableBody: document.getElementById('projectsTableBody'),
    emptyState: document.getElementById('emptyState'),
    btnEmptyCreate: document.getElementById('btnEmptyCreate'),
    btnResetData: document.getElementById('btnResetData'),
    lastSyncTime: document.getElementById('lastSyncTime'),
    sortHeaders: document.querySelectorAll('th.sortable'),

    // Project Modal
    projectModal: document.getElementById('projectModal'),
    modalTitle: document.getElementById('modalTitle'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnCancelModal: document.getElementById('btnCancelModal'),
    projectForm: document.getElementById('projectForm'),
    editProjectId: document.getElementById('editProjectId'),
    projectCode: document.getElementById('projectCode'),
    projectName: document.getElementById('projectName'),
    clientDepartment: document.getElementById('clientDepartment'),
    projectManager: document.getElementById('projectManager'),
    projectStatus: document.getElementById('projectStatus'),
    dueDate: document.getElementById('dueDate'),
    progressRange: document.getElementById('progressRange'),
    progressValBadge: document.getElementById('progressValBadge'),
    latestUpdates: document.getElementById('latestUpdates'),

    // Inline Update Modal
    inlineEditModal: document.getElementById('inlineEditModal'),
    btnCloseInlineModal: document.getElementById('btnCloseInlineModal'),
    btnCancelInline: document.getElementById('btnCancelInline'),
    inlineEditForm: document.getElementById('inlineEditForm'),
    inlineProjectId: document.getElementById('inlineProjectId'),
    inlineProjectInfo: document.getElementById('inlineProjectInfo'),
    inlineUpdateText: document.getElementById('inlineUpdateText'),

    // Delete Modal
    deleteConfirmModal: document.getElementById('deleteConfirmModal'),
    deleteProjectName: document.getElementById('deleteProjectName'),
    btnCloseDeleteModal: document.getElementById('btnCloseDeleteModal'),
    btnCancelDelete: document.getElementById('btnCancelDelete'),
    btnConfirmDelete: document.getElementById('btnConfirmDelete'),

    // Toasts
    toastContainer: document.getElementById('toastContainer')
  };

  /**
   * Initialize Application
   */
  function init() {
    loadProjects();
    updateHeaderDate();
    bindEvents();
    render();
  }

  /**
   * Load data from LocalStorage or seed defaults
   */
  function loadProjects() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        projects = JSON.parse(stored);
      } else {
        projects = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_PROJECTS));
        saveProjects();
      }
    } catch (err) {
      console.error('Error loading projects from storage:', err);
      projects = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_PROJECTS));
    }
  }

  /**
   * Save data into LocalStorage
   */
  function saveProjects() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      updateLastSync();
    } catch (err) {
      console.error('Failed to save projects to storage:', err);
      showToast('Storage error: unable to save changes', 'error');
    }
  }

  /**
   * Format header date display
   */
  function updateHeaderDate() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);
    if (el.dateText) el.dateText.textContent = dateStr;
    if (el.printDateStamp) el.printDateStamp.textContent = `${dateStr} ${now.toLocaleTimeString()}`;
  }

  function updateLastSync() {
    if (el.lastSyncTime) {
      const now = new Date();
      el.lastSyncTime.textContent = `Updated: ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  }

  /**
   * Bind DOM Event Listeners
   */
  function bindEvents() {
    // Open New Project Modal
    if (el.btnOpenNewModal) el.btnOpenNewModal.addEventListener('click', openAddModal);
    if (el.fabNewProject) el.fabNewProject.addEventListener('click', openAddModal);
    if (el.btnEmptyCreate) el.btnEmptyCreate.addEventListener('click', openAddModal);

    // Modal Close buttons
    if (el.btnCloseModal) el.btnCloseModal.addEventListener('click', closeProjectModal);
    if (el.btnCancelModal) el.btnCancelModal.addEventListener('click', closeProjectModal);
    if (el.projectModal) {
      el.projectModal.addEventListener('click', (e) => {
        if (e.target === el.projectModal) closeProjectModal();
      });
    }

    // Modal Form Submit
    if (el.projectForm) el.projectForm.addEventListener('submit', handleProjectFormSubmit);

    // Progress Range Live Badge Update
    if (el.progressRange) {
      el.progressRange.addEventListener('input', (e) => {
        const val = e.target.value;
        if (el.progressValBadge) el.progressValBadge.textContent = `${val}%`;
      });
    }

    // Status change auto-adjust progress
    if (el.projectStatus) {
      el.projectStatus.addEventListener('change', (e) => {
        if (e.target.value === 'Completed' && parseInt(el.progressRange.value, 10) < 100) {
          el.progressRange.value = 100;
          if (el.progressValBadge) el.progressValBadge.textContent = '100%';
        }
      });
    }

    // Search Input
    if (el.searchInput) {
      el.searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        if (el.btnClearSearch) {
          el.btnClearSearch.style.display = searchQuery ? 'block' : 'none';
        }
        render();
      });
    }

    if (el.btnClearSearch) {
      el.btnClearSearch.addEventListener('click', () => {
        el.searchInput.value = '';
        searchQuery = '';
        el.btnClearSearch.style.display = 'none';
        el.searchInput.focus();
        render();
      });
    }

    // Filter Buttons
    el.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        el.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        render();
      });
    });

    // Column Sorting
    el.sortHeaders.forEach(th => {
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-sort');
        if (!field) return;

        if (sortColumn === field) {
          sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          sortColumn = field;
          sortDirection = 'asc';
        }

        // Update Sort Indicator Icons
        el.sortHeaders.forEach(header => {
          const icon = header.querySelector('.sort-icon');
          if (icon) {
            if (header === th) {
              icon.textContent = sortDirection === 'asc' ? '▲' : '▼';
            } else {
              icon.textContent = '⇅';
            }
          }
        });

        render();
      });
    });

    // Reset Sample Data
    if (el.btnResetData) {
      el.btnResetData.addEventListener('click', () => {
        if (confirm('Reset tracker to default Franchise Ready sample projects?')) {
          projects = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_PROJECTS));
          saveProjects();
          render();
          showToast('Franchise Ready sample projects restored', 'info');
        }
      });
    }

    // Print / PDF
    if (el.btnPrint) {
      el.btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    // Export CSV
    if (el.btnExportCSV) {
      el.btnExportCSV.addEventListener('click', exportToCSV);
    }

    // Inline Update Modal Events
    if (el.btnCloseInlineModal) el.btnCloseInlineModal.addEventListener('click', closeInlineModal);
    if (el.btnCancelInline) el.btnCancelInline.addEventListener('click', closeInlineModal);
    if (el.inlineEditForm) el.inlineEditForm.addEventListener('submit', handleInlineFormSubmit);

    // Delete Confirmation Modal Events
    if (el.btnCloseDeleteModal) el.btnCloseDeleteModal.addEventListener('click', closeDeleteModal);
    if (el.btnCancelDelete) el.btnCancelDelete.addEventListener('click', closeDeleteModal);
    if (el.btnConfirmDelete) el.btnConfirmDelete.addEventListener('click', confirmDeleteProject);

    // Keyboard Shortcuts (Esc to close open modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeProjectModal();
        closeInlineModal();
        closeDeleteModal();
      }
    });
  }

  /**
   * Filter and Sort Projects
   */
  function getProcessedProjects() {
    let result = [...projects];

    // Status Filter
    if (currentFilter !== 'all') {
      result = result.filter(p => p.status === currentFilter);
    }

    // Search Filter
    if (searchQuery) {
      result = result.filter(p => {
        return (
          (p.code && p.code.toLowerCase().includes(searchQuery)) ||
          (p.name && p.name.toLowerCase().includes(searchQuery)) ||
          (p.department && p.department.toLowerCase().includes(searchQuery)) ||
          (p.manager && p.manager.toLowerCase().includes(searchQuery)) ||
          (p.latestUpdates && p.latestUpdates.toLowerCase().includes(searchQuery)) ||
          (p.status && p.status.toLowerCase().includes(searchQuery))
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (sortColumn === 'progress') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }

  /**
   * Update KPI Cards & Filter Counters
   */
  function updateKPIs() {
    const total = projects.length;
    const inProgress = projects.filter(p => p.status === 'In Progress').length;
    const delayed = projects.filter(p => p.status === 'Delayed / Urgent').length;
    const completed = projects.filter(p => p.status === 'Completed').length;

    if (el.kpiTotal) el.kpiTotal.textContent = total;
    if (el.kpiInProgress) el.kpiInProgress.textContent = inProgress;
    if (el.kpiDelayed) el.kpiDelayed.textContent = delayed;
    if (el.kpiCompleted) el.kpiCompleted.textContent = completed;

    if (el.countAll) el.countAll.textContent = total;
    if (el.countInProgress) el.countInProgress.textContent = inProgress;
    if (el.countDelayed) el.countDelayed.textContent = delayed;
    if (el.countCompleted) el.countCompleted.textContent = completed;
  }

  /**
   * Main Render Routine
   */
  function render() {
    updateKPIs();
    const items = getProcessedProjects();

    if (!el.tableBody) return;
    el.tableBody.innerHTML = '';

    if (items.length === 0) {
      if (el.emptyState) el.emptyState.style.display = 'flex';
      if (el.table) el.table.style.display = 'none';
      return;
    }

    if (el.emptyState) el.emptyState.style.display = 'none';
    if (el.table) el.table.style.display = 'table';

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    items.forEach(project => {
      const tr = document.createElement('tr');
      const isDelayed = project.status === 'Delayed / Urgent';
      if (isDelayed) {
        tr.classList.add('row-delayed-urgent');
      }

      // Initial for Avatar
      const initial = (project.manager && project.manager.trim()) ? project.manager.trim().charAt(0).toUpperCase() : 'M';
      let avatarClass = 'avatar-k';
      if (initial === 'S') avatarClass = 'avatar-s';
      else if (initial === 'T') avatarClass = 'avatar-t';
      else if (initial === 'N') avatarClass = 'avatar-n';
      else if (initial === 'F' || initial === 'D') avatarClass = 'avatar-s';

      // Status Class & Fill
      let statusClass = 'in-progress';
      let fillClass = 'fill-in-progress';
      if (project.status === 'Delayed / Urgent') {
        statusClass = 'delayed-urgent';
        fillClass = 'fill-delayed';
      } else if (project.status === 'Completed') {
        statusClass = 'completed';
        fillClass = 'fill-completed';
      }

      // Check if overdue
      const isOverdue = project.dueDate && project.dueDate < todayStr && project.status !== 'Completed';

      tr.innerHTML = `
        <!-- Client / Department -->
        <td class="td-dept" data-label="CLIENT / DEPARTMENT">
          <div class="dept-cell">
            <div class="dept-icon-box" title="Department">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
              </svg>
            </div>
            <div class="dept-info">
              <span class="dept-name">${escapeHTML(project.department || 'General')}</span>
              <span class="dept-project-code">${escapeHTML(project.code || '')} &bull; ${escapeHTML(project.name || '')}</span>
            </div>
          </div>
        </td>

        <!-- Project Manager -->
        <td data-label="PROJECT MANAGER">
          <div class="manager-cell">
            <div class="manager-avatar ${avatarClass}" title="${escapeHTML(project.manager || '')}">
              ${escapeHTML(initial)}
            </div>
            <span class="manager-name">${escapeHTML(project.manager || 'Unassigned')}</span>
          </div>
        </td>

        <!-- Status -->
        <td data-label="STATUS">
          <span class="status-pill ${statusClass}">
            <span class="status-dot"></span>
            ${escapeHTML(project.status || 'In Progress')}
          </span>
        </td>

        <!-- Progress -->
        <td data-label="PROGRESS">
          <div class="progress-cell">
            <div class="progress-header">
              <span>Progress ${project.progress || 0}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill ${fillClass}" style="width: ${Math.min(100, Math.max(0, project.progress || 0))}%;"></div>
            </div>
          </div>
        </td>

        <!-- Latest Updates (Click directly to edit inline) -->
        <td data-label="LATEST UPDATES">
          <div class="update-cell" data-id="${project.id}" title="Click to edit update inline">
            <div class="update-text">${escapeHTML(project.latestUpdates || 'No operational update logged yet.')}</div>
            <div class="update-meta">
              <span>🕒 Updated: ${escapeHTML(project.updatedAt || 'Recently')}</span>
              <span class="update-edit-hint">✎ Quick Edit</span>
            </div>
          </div>
        </td>

        <!-- Due Date -->
        <td data-label="DUE DATE">
          <div class="date-cell ${isOverdue ? 'date-overdue' : ''}">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>${escapeHTML(project.dueDate || 'N/A')}</span>
          </div>
        </td>

        <!-- Actions -->
        <td class="td-actions" data-label="ACTIONS">
          <div class="actions-cell">
            <button type="button" class="btn-action-icon btn-action-edit" data-id="${project.id}" title="Edit Project">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button type="button" class="btn-action-icon btn-action-delete" data-id="${project.id}" title="Delete Project">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      `;

      // Event delegation
      const btnEdit = tr.querySelector('.btn-action-edit');
      if (btnEdit) btnEdit.addEventListener('click', () => openEditModal(project.id));

      const btnDelete = tr.querySelector('.btn-action-delete');
      if (btnDelete) btnDelete.addEventListener('click', () => promptDelete(project.id));

      const updateCell = tr.querySelector('.update-cell');
      if (updateCell) updateCell.addEventListener('click', () => openInlineModal(project.id));

      el.tableBody.appendChild(tr);
    });
  }

  /**
   * Generate Next Project Code (e.g. PRJ-106)
   */
  function generateNextCode() {
    let maxNum = 100;
    projects.forEach(p => {
      if (p.code && p.code.startsWith('PRJ-')) {
        const num = parseInt(p.code.replace('PRJ-', ''), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    return `PRJ-${maxNum + 1}`;
  }

  /**
   * Open Add Project Modal
   */
  function openAddModal() {
    clearErrors();
    el.editProjectId.value = '';
    el.modalTitle.textContent = 'Add New Project';
    el.projectCode.value = generateNextCode();
    el.projectName.value = '';
    el.clientDepartment.value = '';
    el.projectManager.value = '';
    el.projectStatus.value = 'In Progress';

    // Default due date: 3 weeks from now
    const future = new Date();
    future.setDate(future.getDate() + 21);
    el.dueDate.value = future.toISOString().split('T')[0];

    el.progressRange.value = 0;
    el.progressValBadge.textContent = '0%';
    el.latestUpdates.value = '';

    el.projectModal.classList.add('show');
    el.projectName.focus();
  }

  /**
   * Open Edit Project Modal
   */
  function openEditModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    clearErrors();
    el.editProjectId.value = project.id;
    el.modalTitle.textContent = `Edit Project: ${project.code}`;
    el.projectCode.value = project.code || '';
    el.projectName.value = project.name || '';
    el.clientDepartment.value = project.department || '';
    el.projectManager.value = project.manager || '';
    el.projectStatus.value = project.status || 'In Progress';
    el.dueDate.value = project.dueDate || '';
    el.progressRange.value = project.progress || 0;
    el.progressValBadge.textContent = `${project.progress || 0}%`;
    el.latestUpdates.value = project.latestUpdates || '';

    el.projectModal.classList.add('show');
    el.projectName.focus();
  }

  function closeProjectModal() {
    el.projectModal.classList.remove('show');
    clearErrors();
  }

  /**
   * Validation & Form Submit Handling
   */
  function handleProjectFormSubmit(e) {
    e.preventDefault();
    clearErrors();

    const code = el.projectCode.value.trim();
    const name = el.projectName.value.trim();
    const department = el.clientDepartment.value.trim();
    const manager = el.projectManager.value.trim();
    const status = el.projectStatus.value;
    const dueDate = el.dueDate.value;
    const progress = parseInt(el.progressRange.value, 10) || 0;
    const updates = el.latestUpdates.value.trim();

    let hasError = false;

    if (!code) {
      showFieldError('errProjectCode', 'Project code is required');
      hasError = true;
    }
    if (!name) {
      showFieldError('errProjectName', 'Project name is required');
      hasError = true;
    }
    if (!department) {
      showFieldError('errClientDepartment', 'Client/Department is required');
      hasError = true;
    }
    if (!manager) {
      showFieldError('errProjectManager', 'Project manager is required');
      hasError = true;
    }
    if (!dueDate) {
      showFieldError('errDueDate', 'Due date is required');
      hasError = true;
    }
    if (!updates) {
      showFieldError('errLatestUpdates', 'Latest updates summary is required');
      hasError = true;
    }

    if (hasError) return;

    const editId = el.editProjectId.value;

    if (editId) {
      // Update existing
      const idx = projects.findIndex(p => p.id === editId);
      if (idx !== -1) {
        projects[idx] = {
          ...projects[idx],
          code,
          name,
          department,
          manager,
          status,
          dueDate,
          progress,
          latestUpdates: updates,
          updatedAt: 'Just now',
          lastModified: new Date().toISOString()
        };
        showToast(`Project ${code} updated successfully`, 'success');
      }
    } else {
      // Create new
      const newProject = {
        id: code,
        code,
        name,
        department,
        manager,
        status,
        dueDate,
        progress,
        latestUpdates: updates,
        updatedAt: 'Just now',
        lastModified: new Date().toISOString()
      };
      projects.unshift(newProject);
      showToast(`New project ${code} added to tracker`, 'success');
    }

    saveProjects();
    closeProjectModal();
    render();
  }

  function showFieldError(elementId, message) {
    const errEl = document.getElementById(elementId);
    if (errEl) errEl.textContent = message;
  }

  function clearErrors() {
    const errorEls = document.querySelectorAll('.field-error');
    errorEls.forEach(el => el.textContent = '');
  }

  /**
   * Inline Edit Modal for Quick Updates
   */
  function openInlineModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    el.inlineProjectId.value = project.id;
    el.inlineProjectInfo.innerHTML = `
      <strong>${escapeHTML(project.code)}</strong>: ${escapeHTML(project.name)}<br>
      <span class="text-muted" style="font-size: 0.8rem;">${escapeHTML(project.department)} &bull; Manager: ${escapeHTML(project.manager)}</span>
    `;
    el.inlineUpdateText.value = project.latestUpdates || '';
    el.inlineEditModal.classList.add('show');
    el.inlineUpdateText.focus();
  }

  function closeInlineModal() {
    el.inlineEditModal.classList.remove('show');
  }

  function handleInlineFormSubmit(e) {
    e.preventDefault();
    const id = el.inlineProjectId.value;
    const text = el.inlineUpdateText.value.trim();
    if (!text) return;

    const project = projects.find(p => p.id === id);
    if (project) {
      project.latestUpdates = text;
      project.updatedAt = 'Just now';
      project.lastModified = new Date().toISOString();
      saveProjects();
      render();
      showToast(`Latest update for ${project.code} saved`, 'success');
    }
    closeInlineModal();
  }

  /**
   * Delete Confirmation
   */
  function promptDelete(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    deleteTargetId = projectId;
    el.deleteProjectName.textContent = `${project.code} (${project.name})`;
    el.deleteConfirmModal.classList.add('show');
  }

  function closeDeleteModal() {
    deleteTargetId = null;
    el.deleteConfirmModal.classList.remove('show');
  }

  function confirmDeleteProject() {
    if (!deleteTargetId) return;
    const target = projects.find(p => p.id === deleteTargetId);
    const code = target ? target.code : 'Project';

    projects = projects.filter(p => p.id !== deleteTargetId);
    saveProjects();
    render();
    closeDeleteModal();
    showToast(`${code} removed successfully`, 'info');
  }

  /**
   * Export to CSV
   */
  function exportToCSV() {
    if (projects.length === 0) {
      showToast('No project data to export', 'error');
      return;
    }

    const headers = ['Project Code', 'Project Name', 'Client/Department', 'Project Manager', 'Status', 'Progress %', 'Due Date', 'Latest Updates', 'Last Updated'];
    const rows = projects.map(p => [
      `"${(p.code || '').replace(/"/g, '""')}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.department || '').replace(/"/g, '""')}"`,
      `"${(p.manager || '').replace(/"/g, '""')}"`,
      `"${(p.status || '').replace(/"/g, '""')}"`,
      p.progress || 0,
      `"${p.dueDate || ''}"`,
      `"${(p.latestUpdates || '').replace(/"/g, '""')}"`,
      `"${p.updatedAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Franchise_Ready_Projects_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Franchise Ready data exported to CSV', 'success');
  }

  /**
   * Toast Notifications
   */
  function showToast(message, type = 'info') {
    if (!el.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    else if (type === 'error') icon = '✕';

    toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }

  /**
   * Helper: Escape HTML to prevent XSS
   */
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start application on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
