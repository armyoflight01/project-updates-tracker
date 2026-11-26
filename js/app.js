/**
 * Franchise Ready (فرنشايز ريدي السعودية) - Executive Tracker Controller
 * Fully Bilingual: English (LTR) & Arabic (RTL) with LocalStorage persistence,
 * User Authentication (Admin & User roles with default credentials: ibraheem01 / 123456789),
 * Dynamic Client / Department Selection and Creation,
 * Responsive UI (Mobile, Tablet, Desktop), Print/PDF, CSV Export, and Search/Filters.
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY = 'franchise_ready_tracker_v1';
  const LANG_STORAGE_KEY = 'franchise_ready_lang';
  const USERS_STORAGE_KEY = 'franchise_ready_users_v2';
  const SESSION_STORAGE_KEY = 'franchise_ready_auth_session';
  const DEPTS_STORAGE_KEY = 'franchise_ready_departments_v2';

  // Default Users (Admin: ibraheem01 / 123456789)
  const DEFAULT_USERS = [
    {
      id: 'u_1',
      username: 'ibraheem01',
      password: '123456789',
      fullName: 'Ibraheem (Admin)',
      role: 'admin',
      createdAt: '2026-11-20'
    },
    {
      id: 'u_2',
      username: 'user01',
      password: 'user123',
      fullName: 'Operations User',
      role: 'user',
      createdAt: '2026-11-22'
    }
  ];

  // Default Departments
  const DEFAULT_DEPARTMENTS = [
    'Business Development',
    'Events & Exhibitions',
    'Operations & Logistics',
    'Marketing & Brand',
    'Quality & Compliance',
    'Franchise Operations',
    'Hospitality & Catering Division'
  ];

  // Translation Dictionaries (English & Arabic)
  const i18n = {
    en: {
      langToggleText: 'العربية',
      appTitle: 'Project & Updates Tracker',
      liveStatus: 'Live Status',
      appSubtitle: 'Franchise Ready Saudi Arabia • فرنشايز ريدي • Executive Oversight of Active Initiatives & Milestone Progress',
      printPdf: 'Print / Export PDF',
      exportCsv: 'Export CSV',
      newProject: 'New Project',
      kpiTotal: 'TOTAL PROJECTS',
      kpiInProgress: 'IN PROGRESS',
      kpiDelayed: 'DELAYED / URGENT',
      kpiCompleted: 'COMPLETED',
      searchPlaceholder: 'Search project name, department, manager, or updates...',
      filterAll: 'All Projects',
      filterInProgress: 'In Progress',
      filterDelayed: 'Delayed / Urgent',
      filterCompleted: 'Completed',
      colDept: 'CLIENT / DEPARTMENT',
      colManager: 'PROJECT MANAGER',
      colStatus: 'STATUS',
      colProgress: 'PROGRESS',
      colUpdates: 'LATEST UPDATES',
      colDate: 'DUE DATE',
      colActions: 'ACTIONS',
      emptyTitle: 'No projects found',
      emptyDesc: 'No project matches your search or filter criteria. Try resetting filters or adding a new project.',
      btnAddProject: '+ Add New Project',
      legendOnTrack: 'On Track / In Progress',
      legendDelayed: 'Critical / Delayed Action Required',
      inlineEditHint: 'Click directly on any Latest Update cell to edit inline',
      resetSampleData: 'Reset Sample Data',
      updatedPrefix: 'Updated',
      modalAddTitle: 'Add New Project',
      modalEditPrefix: 'Edit Project',
      lblProjectCode: 'PROJECT CODE',
      lblProjectName: 'PROJECT NAME',
      phProjectName: 'Enter full project title...',
      lblDepartment: 'CLIENT / DEPARTMENT',
      phDepartment: 'e.g., Hospitality & Catering Division',
      btnAddDept: 'Add Department',
      btnSaveDept: 'Add',
      lblManager: 'PROJECT MANAGER',
      phManager: 'e.g., Sarah Al-Mansoor',
      lblStatus: 'STATUS',
      optInProgress: 'In Progress',
      optDelayed: 'Delayed / Urgent',
      optCompleted: 'Completed',
      lblDueDate: 'DUE DATE',
      lblProgress: 'PROGRESS',
      lblUpdates: 'LATEST UPDATES',
      phUpdates: 'Summarize recent milestones, blockers, or next action items...',
      btnCancel: 'Cancel',
      btnSaveProject: 'Save Project',
      inlineModalTitle: 'Edit Latest Update',
      lblInlineUpdate: 'LATEST OPERATIONAL UPDATE',
      phInlineUpdate: 'Type operational update...',
      btnUpdateNow: 'Update Now',
      deleteModalTitle: 'Delete Project',
      deleteConfirmPrefix: 'Are you sure you want to remove project',
      deleteWarning: 'This action cannot be undone.',
      btnConfirmDelete: 'Delete Project',
      printTitle: 'FRANCHISE READY SAUDI ARABIA • فرنشايز ريدي',
      printSub: 'EXECUTIVE PROJECT & OPERATIONAL UPDATES REPORT',
      printGen: 'Generated on',
      printPortal: 'Executive Management Portal',
      quickEditHint: '✎ Quick Edit',
      progressText: 'Progress',
      menuManageUsers: 'Manage Users',
      menuChangePassword: 'Change Password',
      menuStandaloneLogin: 'Login Page',
      menuDatabaseSetup: 'Database Setup & Diagnostics',
      linkOpenLoginPage: 'Open Dedicated Login Page →',
      menuLogout: 'Sign Out',
      modalLoginTitle: 'Executive Portal Sign In',
      lblUsername: 'Username',
      lblPassword: 'Password',
      lblFullName: 'Full Name',
      lblRole: 'Role',
      roleAdmin: 'Admin (Full Control)',
      roleUser: 'User (Standard Access)',
      hintDefaultCreds: 'Default Admin Login:',
      btnContinueGuest: 'Guest View',
      btnSignIn: 'Sign In',
      titleChangePassword: 'Change Password / Profile',
      lblCurrentPassword: 'Current Password',
      lblNewPassword: 'New Password',
      lblConfirmPassword: 'Confirm New Password',
      btnSavePassword: 'Save Password',
      titleUserManagement: 'User Management & Access Control',
      headerRegisteredUsers: 'Registered Users',
      btnAddUser: 'Add New User',
      titleCreateUser: 'Create New User Account',
      btnCreateAccount: 'Create User',
      colUser: 'User',
      colRole: 'Role',
      colCreated: 'Created',
      btnClose: 'Close',
      toastSampleRestored: 'Franchise Ready sample projects restored',
      toastProjectSaved: 'Project saved successfully',
      toastProjectAdded: 'New project added to tracker',
      toastProjectUpdated: 'Project updated successfully',
      toastProjectDeleted: 'Project removed successfully',
      toastUpdateSaved: 'Operational update saved',
      toastCsvExported: 'Franchise Ready data exported to CSV',
      toastStorageError: 'Storage error: unable to save changes',
      toastLoginSuccess: 'Welcome back',
      toastLoginError: 'Invalid username or password',
      toastPasswordChanged: 'Password updated successfully',
      toastUserCreated: 'User created successfully',
      toastUserDeleted: 'User deleted successfully',
      toastDeptAdded: 'New department added successfully',
      toastDeptExists: 'Department already exists'
    },
    ar: {
      langToggleText: 'English',
      appTitle: 'نظام متابعة المشاريع والتحديثات',
      liveStatus: 'حالة مباشرة',
      appSubtitle: 'فرنشايز ريدي السعودية • المتابعة التنفيذية للمشاريع النشطة ونسب الإنجاز التشغيلي',
      printPdf: 'طباعة / تصدير PDF',
      exportCsv: 'تصدير CSV',
      newProject: 'مشروع جديد',
      kpiTotal: 'إجمالي المشاريع',
      kpiInProgress: 'قيد التنفيذ',
      kpiDelayed: 'متأخر / عاجل',
      kpiCompleted: 'مكتمل',
      searchPlaceholder: 'البحث عن اسم المشروع، القسم، المدير، أو التحديثات...',
      filterAll: 'جميع المشاريع',
      filterInProgress: 'قيد التنفيذ',
      filterDelayed: 'متأخر / عاجل',
      filterCompleted: 'مكتمل',
      colDept: 'العميل / القسم',
      colManager: 'مدير المشروع',
      colStatus: 'الحالة',
      colProgress: 'نسبة الإنجاز',
      colUpdates: 'آخر التحديثات التشغيلية',
      colDate: 'تاريخ التسليم',
      colActions: 'الإجراءات',
      emptyTitle: 'لم يتم العثور على مشاريع',
      emptyDesc: 'لا توجد مشاريع تطابق معايير البحث أو التصفية الحالية. جرّب إعادة ضبط الفلاتر أو إضافة مشروع جديد.',
      btnAddProject: '+ إضافة مشروع جديد',
      legendOnTrack: 'تسير حسب الخطة / قيد التنفيذ',
      legendDelayed: 'حرج / يتطلب إجراءات عاجلة',
      inlineEditHint: 'انقر مباشرة على أي خلية لتعديل آخر التحديثات فورياً',
      resetSampleData: 'استعادة البيانات التجريبية',
      updatedPrefix: 'تم التحديث',
      modalAddTitle: 'إضافة مشروع جديد',
      modalEditPrefix: 'تعديل المشروع',
      lblProjectCode: 'كود المشروع',
      lblProjectName: 'اسم المشروع',
      phProjectName: 'أدخل العنوان الكامل للمشروع...',
      lblDepartment: 'العميل / القسم',
      phDepartment: 'مثال: قسم الضيافة والتموين',
      btnAddDept: 'إضافة قسم',
      btnSaveDept: 'إضافة',
      lblManager: 'مدير المشروع',
      phManager: 'مثال: سارة المنصور',
      lblStatus: 'الحالة',
      optInProgress: 'قيد التنفيذ',
      optDelayed: 'متأخر / عاجل',
      optCompleted: 'مكتمل',
      lblDueDate: 'تاريخ التسليم',
      lblProgress: 'نسبة الإنجاز',
      lblUpdates: 'آخر التحديثات',
      phUpdates: 'ملخص أهم الإنجازات الأخيرة، المعوقات، أو خطوات العمل القادمة...',
      btnCancel: 'إلغاء',
      btnSaveProject: 'حفظ المشروع',
      inlineModalTitle: 'تعديل آخر التحديثات',
      lblInlineUpdate: 'آخر التحديثات التشغيلية',
      phInlineUpdate: 'اكتب التحديث التشغيلي هنا...',
      btnUpdateNow: 'تحديث الآن',
      deleteModalTitle: 'حذف المشروع',
      deleteConfirmPrefix: 'هل أنت متأكد من رغبتك في حذف المشروع',
      deleteWarning: 'لا يمكن التراجع عن هذا الإجراء.',
      btnConfirmDelete: 'تأكيد الحذف',
      printTitle: 'فرنشايز ريدي السعودية • FRANCHISE READY',
      printSub: 'تقرير متابعة المشاريع والتحديثات التشغيلية التنفيذية',
      printGen: 'تم الاستخراج في',
      printPortal: 'بوابة الإدارة التنفيذية',
      quickEditHint: '✎ تعديل سريع',
      progressText: 'الإنجاز',
      menuManageUsers: 'إدارة المستخدمين',
      menuChangePassword: 'تغيير كلمة المرور',
      menuStandaloneLogin: 'صفحة تسجيل الدخول',
      menuDatabaseSetup: 'إعداد قاعدة البيانات والتشخيص',
      linkOpenLoginPage: 'فتح صفحة تسجيل الدخول المستقلة ←',
      menuLogout: 'تسجيل الخروج',
      modalLoginTitle: 'تسجيل الدخول إلى البوابة التنفيذية',
      lblUsername: 'اسم المستخدم',
      lblPassword: 'كلمة المرور',
      lblFullName: 'الاسم الكامل',
      lblRole: 'الصلاحية',
      roleAdmin: 'مسؤول (تحكم كامل)',
      roleUser: 'مستخدم (صلاحيات أساسية)',
      hintDefaultCreds: 'بيانات تسجيل الدخول الافتراضية:',
      btnContinueGuest: 'تصفح كزائر',
      btnSignIn: 'تسجيل الدخول',
      titleChangePassword: 'تغيير كلمة المرور / الملف الشخصي',
      lblCurrentPassword: 'كلمة المرور الحالية',
      lblNewPassword: 'كلمة المرور الجديدة',
      lblConfirmPassword: 'تأكيد كلمة المرور الجديدة',
      btnSavePassword: 'حفظ كلمة المرور',
      titleUserManagement: 'إدارة المستخدمين وصلاحيات الوصول',
      headerRegisteredUsers: 'المستخدمون المسجلون',
      btnAddUser: 'إضافة مستخدم جديد',
      titleCreateUser: 'إنشاء حساب مستخدم جديد',
      btnCreateAccount: 'إنشاء الحساب',
      colUser: 'المستخدم',
      colRole: 'الصلاحية',
      colCreated: 'تاريخ الإنشاء',
      btnClose: 'إغلاق',
      toastSampleRestored: 'تمت استعادة مشاريع فرنشايز ريدي التجريبية',
      toastProjectSaved: 'تم حفظ المشروع بنجاح',
      toastProjectAdded: 'تمت إضافة المشروع الجديد بنجاح',
      toastProjectUpdated: 'تم تحديث بيانات المشروع بنجاح',
      toastProjectDeleted: 'تم حذف المشروع بنجاح',
      toastUpdateSaved: 'تم حفظ التحديث التشغيلي',
      toastCsvExported: 'تم تصدير بيانات فرنشايز ريدي إلى ملف CSV',
      toastStorageError: 'خطأ في التخزين: تعذر حفظ التعديلات',
      toastLoginSuccess: 'مرحباً بك',
      toastLoginError: 'اسم المستخدم أو كلمة المرور غير صحيحة',
      toastPasswordChanged: 'تم تحديث كلمة المرور بنجاح',
      toastUserCreated: 'تم إنشاء المستخدم بنجاح',
      toastUserDeleted: 'تم حذف المستخدم بنجاح',
      toastDeptAdded: 'تمت إضافة القسم الجديد بنجاح',
      toastDeptExists: 'هذا القسم موجود مسبقاً'
    }
  };

  // Sample Data matching Franchise Ready Executive Portfolio (Bilingual)
  const DEFAULT_SAMPLE_PROJECTS = [
    {
      id: 'PRJ-101',
      code: 'PRJ-101',
      name_en: 'Catering & Hospitality Division Launch',
      name_ar: 'إطلاق قطاع الضيافة وخدمات الإعاشة والتموين',
      department: 'Business Development',
      manager_en: 'Khalid Al-Otaibi',
      manager_ar: 'خالد العتيبي',
      status: 'In Progress',
      progress: 85,
      dueDate: '2026-12-05',
      latestUpdates_en: 'Corporate profile and buffet menus finalized; finalizing tableware supplier contracts.',
      latestUpdates_ar: 'تم اعتماد الملف التعريفي وقوائم البوفيه؛ جاري إنهاء عقود موردي أدوات الضيافة الفاخرة.',
      updatedAt_en: '2 hours ago',
      updatedAt_ar: 'منذ ساعتين',
      lastModified: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: 'PRJ-102',
      code: 'PRJ-102',
      name_en: 'Specialty Coffee Bar & Expo Setup',
      name_ar: 'تجهيز ركن القهوة المختصة وجناح المعرض الدولي',
      department: 'Events & Exhibitions',
      manager_en: 'Sarah Al-Mansoor',
      manager_ar: 'سارة المنصور',
      status: 'Delayed / Urgent',
      progress: 60,
      dueDate: '2026-11-28',
      latestUpdates_en: 'Specialty coffee bar equipment shipment delayed at customs; backup local vendor sourced.',
      latestUpdates_ar: 'تأخرت شحنة معدات البار في الجمارك؛ تم توفير مورد محلي بديل للتركيب الفوري.',
      updatedAt_en: 'Today, 10:30 AM',
      updatedAt_ar: 'اليوم، 10:30 صباحاً',
      lastModified: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    },
    {
      id: 'PRJ-103',
      code: 'PRJ-103',
      name_en: 'Hospitality Operations & Logistics Contract',
      name_ar: 'عقد العمليات التشغيلية وسلاسل الإمداد اللوجستية',
      department: 'Operations & Logistics',
      manager_en: 'Tariq Al-Dossary',
      manager_ar: 'طارق الدوسري',
      status: 'Completed',
      progress: 100,
      dueDate: '2026-11-20',
      latestUpdates_en: 'Annual contract signed and full daily hospitality operations commenced with zero issues.',
      latestUpdates_ar: 'تم توقيع العقد السنوي وبدء عمليات الضيافة اليومية المتكاملة بنجاح تام وبدون أي معوقات.',
      updatedAt_en: 'Yesterday',
      updatedAt_ar: 'أمس',
      lastModified: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'PRJ-104',
      code: 'PRJ-104',
      name_en: 'Brand Identity & Omni-Channel Campaign',
      name_ar: 'الهوية البصرية والحملة التسويقية متعددة القنوات',
      department: 'Marketing & Brand',
      manager_en: 'Noura Al-Ghamdi',
      manager_ar: 'نورة الغامدي',
      status: 'In Progress',
      progress: 45,
      dueDate: '2026-12-15',
      latestUpdates_en: 'Brand identity assets completed; social media campaign launched across regional platforms.',
      latestUpdates_ar: 'تم استكمال أصول الهوية البصرية وإطلاق الحملة الإعلانية عبر المنصات الإقليمية المستهدفة.',
      updatedAt_en: 'Nov 21, 2026',
      updatedAt_ar: '21 نوفمبر 2026',
      lastModified: new Date('2026-11-21T09:00:00').toISOString()
    },
    {
      id: 'PRJ-105',
      code: 'PRJ-105',
      name_en: 'Food Safety & Hygiene Compliance Audit',
      name_ar: 'تدقيق السلامة الغذائية ومعايير الامتثال والرقابة',
      department: 'Quality & Compliance',
      manager_en: 'Dr. Faisal Al-Harbi',
      manager_ar: 'د. فيصل الحربي',
      status: 'In Progress',
      progress: 70,
      dueDate: '2026-12-01',
      latestUpdates_en: 'Internal hygiene audit conducted; final ISO certification assessment scheduled for next week.',
      latestUpdates_ar: 'تم تنفيذ التدقيق الداخلي للنظافة والسلامة؛ والتقييم النهائي لشهادة الآيزو مجدول للأسبوع القادم.',
      updatedAt_en: 'Nov 18, 2026',
      updatedAt_ar: '18 نوفمبر 2026',
      lastModified: new Date('2026-11-18T14:30:00').toISOString()
    }
  ];

  // Application State
  let currentLang = 'en';
  let currentUser = null; // { id, username, fullName, role }
  let usersList = [];
  let departmentsList = [];
  let projects = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let sortColumn = 'dueDate';
  let sortDirection = 'asc'; // 'asc' | 'desc'
  let deleteTargetId = null;

  // DOM Elements Cache
  const el = {
    htmlRoot: document.getElementById('htmlRoot'),
    btnLangToggle: document.getElementById('btnLangToggle'),
    langText: document.getElementById('langText'),
    dateText: document.getElementById('dateText'),
    btnPrint: document.getElementById('btnPrint'),
    btnExportCSV: document.getElementById('btnExportCSV'),
    btnOpenNewModal: document.getElementById('btnOpenNewModal'),
    fabNewProject: document.getElementById('fabNewProject'),
    printDateStamp: document.getElementById('printDateStamp'),

    // User Session
    btnUserMenu: document.getElementById('btnUserMenu'),
    userDropdownMenu: document.getElementById('userDropdownMenu'),
    userMiniAvatar: document.getElementById('userMiniAvatar'),
    userNameLabel: document.getElementById('userNameLabel'),
    userRoleBadge: document.getElementById('userRoleBadge'),
    dropdownUserFullName: document.getElementById('dropdownUserFullName'),
    dropdownUserRole: document.getElementById('dropdownUserRole'),
    btnOpenUserManagement: document.getElementById('btnOpenUserManagement'),
    btnOpenChangePassword: document.getElementById('btnOpenChangePassword'),
    btnLogout: document.getElementById('btnLogout'),

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
    clientDepartmentSelect: document.getElementById('clientDepartmentSelect'),
    btnToggleAddDept: document.getElementById('btnToggleAddDept'),
    inlineAddDeptBox: document.getElementById('inlineAddDeptBox'),
    newDeptInput: document.getElementById('newDeptInput'),
    btnConfirmAddDept: document.getElementById('btnConfirmAddDept'),
    btnCancelAddDept: document.getElementById('btnCancelAddDept'),
    projectManager: document.getElementById('projectManager'),
    projectStatus: document.getElementById('projectStatus'),
    dueDate: document.getElementById('dueDate'),
    progressRange: document.getElementById('progressRange'),
    progressValBadge: document.getElementById('progressValBadge'),
    latestUpdates: document.getElementById('latestUpdates'),

    // Inline Update Modal
    inlineEditModal: document.getElementById('inlineEditModal'),
    inlineModalTitle: document.getElementById('inlineModalTitle'),
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

    // Login Modal
    loginModal: document.getElementById('loginModal'),
    loginForm: document.getElementById('loginForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    loginErrorAlert: document.getElementById('loginErrorAlert'),
    btnCloseLoginModal: document.getElementById('btnCloseLoginModal'),
    btnGuestLogin: document.getElementById('btnGuestLogin'),

    // Change Password Modal
    changePasswordModal: document.getElementById('changePasswordModal'),
    changePasswordForm: document.getElementById('changePasswordForm'),
    profileUsername: document.getElementById('profileUsername'),
    profileFullName: document.getElementById('profileFullName'),
    currentPassword: document.getElementById('currentPassword'),
    newPassword: document.getElementById('newPassword'),
    confirmNewPassword: document.getElementById('confirmNewPassword'),
    btnCloseChangePassModal: document.getElementById('btnCloseChangePassModal'),
    btnCancelChangePass: document.getElementById('btnCancelChangePass'),

    // User Management Modal
    userManagementModal: document.getElementById('userManagementModal'),
    btnCloseUserMgmtModal: document.getElementById('btnCloseUserMgmtModal'),
    btnCloseUserMgmtBottom: document.getElementById('btnCloseUserMgmtBottom'),
    btnToggleAddUserForm: document.getElementById('btnToggleAddUserForm'),
    addUserCard: document.getElementById('addUserCard'),
    addUserForm: document.getElementById('addUserForm'),
    newUsername: document.getElementById('newUsername'),
    newUserFullName: document.getElementById('newUserFullName'),
    newUserPassword: document.getElementById('newUserPassword'),
    newUserRole: document.getElementById('newUserRole'),
    btnCancelAddUser: document.getElementById('btnCancelAddUser'),
    usersTableBody: document.getElementById('usersTableBody'),

    // Toasts
    toastContainer: document.getElementById('toastContainer')
  };

  /**
   * Initialize Application
   */
  function init() {
    initLanguage();
    initUsersAndAuth();
    initDepartments();
    loadProjects();
    updateHeaderDate();
    bindEvents();
    applyTranslations();
    render();
    syncWithBackend();
  }

  function mapDbProjectToModel(row) {
    return {
      id: row.project_code || ('PRJ-' + row.id),
      dbId: row.id,
      code: row.project_code,
      name_en: row.project_name,
      name_ar: row.project_name,
      department: row.client_department,
      manager_en: row.project_manager,
      manager_ar: row.project_manager,
      status: row.status,
      progress: parseInt(row.progress, 10) || 0,
      dueDate: row.due_date,
      latestUpdates_en: row.latest_updates,
      latestUpdates_ar: row.latest_updates,
      updatedAt_en: row.updated_at ? row.updated_at.substring(0, 10) : 'Recent',
      updatedAt_ar: row.updated_at ? row.updated_at.substring(0, 10) : 'مؤخراً',
      lastModified: row.updated_at || new Date().toISOString()
    };
  }

  async function syncWithBackend() {
    if (typeof TrackerAPI === 'undefined' || !TrackerAPI.isHttpServer) {
      updateDbStatusUI(false, 'LocalStorage Mode');
      return;
    }

    try {
      // 1. Verify session with PHP backend
      const authRes = await TrackerAPI.checkSession();
      if (authRes.ok && authRes.success && authRes.data) {
        currentUser = authRes.data;
        saveSession();
        updateUserUI();
      }

      // 2. Fetch live projects from MySQL
      const projRes = await TrackerAPI.getProjects();
      if (projRes.ok && projRes.success && projRes.data && Array.isArray(projRes.data.projects)) {
        if (projRes.data.projects.length > 0) {
          projects = projRes.data.projects.map(mapDbProjectToModel);
          saveProjects();
          render();
        }
        updateDbStatusUI(true, 'MySQL Connected');
      } else {
        updateDbStatusUI(false, 'MySQL Pending');
      }

      // 3. Fetch departments from MySQL
      const deptRes = await TrackerAPI.getDepartments();
      if (deptRes.ok && deptRes.success && Array.isArray(deptRes.data) && deptRes.data.length > 0) {
        departmentsList = deptRes.data.map(d => d.name);
        saveDepartments();
        populateDepartmentDropdown();
      }

      // 4. Fetch users from MySQL if Admin
      if (currentUser && currentUser.role === 'admin') {
        const usersRes = await TrackerAPI.getUsers();
        if (usersRes.ok && usersRes.success && Array.isArray(usersRes.data) && usersRes.data.length > 0) {
          usersList = usersRes.data.map(u => ({
            id: u.id,
            username: u.username,
            fullName: u.full_name,
            role: u.role,
            createdAt: u.created_at
          }));
          saveUsers();
          if (el.userManagementModal && el.userManagementModal.classList.contains('show')) {
            renderUsersTable();
          }
        }
      }
    } catch (err) {
      console.warn('Backend sync fallback to LocalStorage:', err);
      updateDbStatusUI(false, 'Offline Mode');
    }
  }

  function updateDbStatusUI(isConnected, text) {
    const badge = document.getElementById('headerDbBadge');
    const dot = document.getElementById('headerDbDot');
    const label = document.getElementById('headerDbText');
    if (!badge || !dot || !label) return;

    badge.style.display = 'inline-flex';
    if (isConnected) {
      dot.style.background = '#10b981';
      label.textContent = currentLang === 'ar' ? 'قاعدة بيانات MySQL متصلة' : text || 'MySQL Connected';
    } else {
      dot.style.background = '#f59e0b';
      label.textContent = currentLang === 'ar' ? 'وضع محلي (تخزين المتصفح)' : text || 'LocalStorage Mode';
    }
  }

  /**
   * Language Configuration
   */
  function initLanguage() {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') {
      currentLang = saved;
    } else {
      const browserLang = (navigator.language || '').toLowerCase();
      currentLang = browserLang.startsWith('ar') ? 'ar' : 'en';
    }
    setLanguage(currentLang, false);
  }

  function setLanguage(lang, reRender = true) {
    currentLang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);

    if (el.htmlRoot) {
      el.htmlRoot.setAttribute('lang', lang);
      el.htmlRoot.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }

    if (el.langText) {
      el.langText.textContent = i18n[lang].langToggleText;
    }

    applyTranslations();
    updateHeaderDate();
    updateDepartmentsDropdown();

    if (reRender) {
      render();
    }
  }

  function applyTranslations() {
    const t = i18n[currentLang];

    // Static Elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(elem => {
      const key = elem.getAttribute('data-i18n');
      if (t[key]) {
        elem.textContent = t[key];
      }
    });

    // Placeholders
    if (el.searchInput) el.searchInput.placeholder = t.searchPlaceholder;
    if (el.projectName) el.projectName.placeholder = t.phProjectName;
    if (el.projectManager) el.projectManager.placeholder = t.phManager;
    if (el.latestUpdates) el.latestUpdates.placeholder = t.phUpdates;
    if (el.inlineUpdateText) el.inlineUpdateText.placeholder = t.phInlineUpdate;
    if (el.newDeptInput) el.newDeptInput.placeholder = currentLang === 'ar' ? 'اكتب اسم القسم الجديد...' : 'Type new department name...';

    updateUserUI();
  }

  /**
   * Initialize Users & Auth System
   */
  function initUsersAndAuth() {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        usersList = JSON.parse(storedUsers);
      } else {
        usersList = JSON.parse(JSON.stringify(DEFAULT_USERS));
        saveUsers();
      }
    } catch (e) {
      usersList = JSON.parse(JSON.stringify(DEFAULT_USERS));
    }

    // Load active session or default to admin (ibraheem01)
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      if (session) {
        currentUser = JSON.parse(session);
        // Sync with usersList in case updated
        const match = usersList.find(u => u.username === currentUser.username);
        if (match) {
          currentUser = {
            id: match.id,
            username: match.username,
            fullName: match.fullName,
            role: match.role
          };
        }
      } else {
        // Auto sign-in with default admin account
        const defaultAdmin = usersList[0];
        currentUser = {
          id: defaultAdmin.id,
          username: defaultAdmin.username,
          fullName: defaultAdmin.fullName,
          role: defaultAdmin.role
        };
        saveSession();
      }
    } catch (e) {
      currentUser = usersList[0];
    }

    updateUserUI();
  }

  function saveUsers() {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersList));
    } catch (e) {
      console.error('Error saving users:', e);
    }
  }

  function saveSession() {
    try {
      if (currentUser) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error saving session:', e);
    }
  }

  function updateUserUI() {
    if (!currentUser) {
      if (el.userNameLabel) el.userNameLabel.textContent = currentLang === 'ar' ? 'دخول' : 'Sign In';
      if (el.userRoleBadge) el.userRoleBadge.textContent = 'Guest';
      if (el.userMiniAvatar) el.userMiniAvatar.textContent = '?';
      if (el.btnOpenUserManagement) el.btnOpenUserManagement.style.display = 'none';
      if (el.btnOpenChangePassword) el.btnOpenChangePassword.style.display = 'none';
      return;
    }

    const initial = currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U';
    if (el.userMiniAvatar) el.userMiniAvatar.textContent = initial;
    if (el.userNameLabel) el.userNameLabel.textContent = currentUser.username;

    const roleName = currentUser.role === 'admin'
      ? (currentLang === 'ar' ? 'مسؤول' : 'Admin')
      : (currentLang === 'ar' ? 'مستخدم' : 'User');

    if (el.userRoleBadge) el.userRoleBadge.textContent = roleName;
    if (el.dropdownUserFullName) el.dropdownUserFullName.textContent = currentUser.fullName;
    if (el.dropdownUserRole) el.dropdownUserRole.textContent = currentUser.role === 'admin'
      ? (currentLang === 'ar' ? 'مسؤول النظام (تحكم كامل)' : 'System Administrator')
      : (currentLang === 'ar' ? 'مستخدم عادي' : 'Standard User');

    // Only Admin can view User Management
    if (el.btnOpenUserManagement) {
      el.btnOpenUserManagement.style.display = currentUser.role === 'admin' ? 'flex' : 'none';
    }
    if (el.btnOpenChangePassword) {
      el.btnOpenChangePassword.style.display = 'flex';
    }
  }

  /**
   * Initialize Client / Department Management
   */
  function initDepartments() {
    try {
      const stored = localStorage.getItem(DEPTS_STORAGE_KEY);
      if (stored) {
        departmentsList = JSON.parse(stored);
      } else {
        departmentsList = [...DEFAULT_DEPARTMENTS];
        saveDepartments();
      }
    } catch (e) {
      departmentsList = [...DEFAULT_DEPARTMENTS];
    }
    updateDepartmentsDropdown();
  }

  function saveDepartments() {
    try {
      localStorage.setItem(DEPTS_STORAGE_KEY, JSON.stringify(departmentsList));
    } catch (e) {
      console.error('Error saving departments:', e);
    }
  }

  function updateDepartmentsDropdown(selectedDept = null) {
    if (!el.clientDepartmentSelect) return;
    el.clientDepartmentSelect.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = currentLang === 'ar' ? '-- اختر القسم أو العميل --' : '-- Select Client / Department --';
    defaultOption.disabled = true;
    if (!selectedDept) defaultOption.selected = true;
    el.clientDepartmentSelect.appendChild(defaultOption);

    departmentsList.forEach(dept => {
      const opt = document.createElement('option');
      opt.value = dept;
      opt.textContent = dept;
      if (selectedDept && selectedDept.toLowerCase() === dept.toLowerCase()) {
        opt.selected = true;
      }
      el.clientDepartmentSelect.appendChild(opt);
    });
  }

  /**
   * Helper to get localized field from project
   */
  function getProjectField(project, field) {
    if (field === 'department') {
      return project.department || '';
    }
    if (currentLang === 'ar') {
      return project[`${field}_ar`] || project[`${field}_en`] || project[field] || '';
    }
    return project[`${field}_en`] || project[`${field}_ar`] || project[field] || '';
  }

  /**
   * Localized Status Label
   */
  function getLocalizedStatus(status) {
    if (currentLang === 'ar') {
      if (status === 'In Progress') return 'قيد التنفيذ';
      if (status === 'Delayed / Urgent') return 'متأخر / عاجل';
      if (status === 'Completed') return 'مكتمل';
    }
    return status;
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
      console.error('Error loading projects:', err);
      projects = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_PROJECTS));
    }
  }

  function saveProjects() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      updateLastSync();
    } catch (err) {
      console.error('Failed to save to storage:', err);
      showToast(i18n[currentLang].toastStorageError, 'error');
    }
  }

  function updateHeaderDate() {
    const now = new Date();
    const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const dateStr = now.toLocaleDateString(locale, options);
    if (el.dateText) el.dateText.textContent = dateStr;
    if (el.printDateStamp) el.printDateStamp.textContent = `${dateStr} ${now.toLocaleTimeString(locale)}`;
  }

  function updateLastSync() {
    if (el.lastSyncTime) {
      const now = new Date();
      const locale = currentLang === 'ar' ? 'ar-SA' : 'en-US';
      const label = i18n[currentLang].updatedPrefix;
      el.lastSyncTime.textContent = `${label}: ${now.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  }

  /**
   * Bind DOM Event Listeners
   */
  function bindEvents() {
    // Language Switcher Toggle
    if (el.btnLangToggle) {
      el.btnLangToggle.addEventListener('click', () => {
        const nextLang = currentLang === 'en' ? 'ar' : 'en';
        setLanguage(nextLang, true);
        showToast(nextLang === 'ar' ? 'تم تحويل اللغة إلى العربية' : 'Switched to English', 'info');
      });
    }

    // User Profile Dropdown Toggle
    if (el.btnUserMenu) {
      el.btnUserMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!currentUser) {
          openLoginModal();
          return;
        }
        const isOpen = el.userDropdownMenu.style.display === 'block';
        el.userDropdownMenu.style.display = isOpen ? 'none' : 'block';
      });
    }

    // Close user dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (el.userDropdownMenu && !e.target.closest('#userSessionWrap')) {
        el.userDropdownMenu.style.display = 'none';
      }
    });

    // Logout
    if (el.btnLogout) {
      el.btnLogout.addEventListener('click', () => {
        currentUser = null;
        saveSession();
        updateUserUI();
        el.userDropdownMenu.style.display = 'none';
        showToast(currentLang === 'ar' ? 'تم تسجيل الخروج بنجاح... جاري التحويل' : 'Signed out successfully... Redirecting to login', 'info');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 500);
      });
    }

    // Open User Management Modal (Admin)
    if (el.btnOpenUserManagement) {
      el.btnOpenUserManagement.addEventListener('click', () => {
        el.userDropdownMenu.style.display = 'none';
        openUserManagementModal();
      });
    }

    // Open Change Password Modal
    if (el.btnOpenChangePassword) {
      el.btnOpenChangePassword.addEventListener('click', () => {
        el.userDropdownMenu.style.display = 'none';
        openChangePasswordModal();
      });
    }

    // Login Modal Events
    if (el.btnCloseLoginModal) el.btnCloseLoginModal.addEventListener('click', closeLoginModal);
    if (el.btnGuestLogin) {
      el.btnGuestLogin.addEventListener('click', () => {
        currentUser = null;
        saveSession();
        updateUserUI();
        closeLoginModal();
        showToast(currentLang === 'ar' ? 'تصفح بوضع الزائر' : 'Browsing in guest mode', 'info');
      });
    }
    if (el.loginForm) el.loginForm.addEventListener('submit', handleLoginSubmit);

    // Change Password Form
    if (el.btnCloseChangePassModal) el.btnCloseChangePassModal.addEventListener('click', closeChangePasswordModal);
    if (el.btnCancelChangePass) el.btnCancelChangePass.addEventListener('click', closeChangePasswordModal);
    if (el.changePasswordForm) el.changePasswordForm.addEventListener('submit', handleChangePasswordSubmit);

    // User Management Modal Events
    if (el.btnCloseUserMgmtModal) el.btnCloseUserMgmtModal.addEventListener('click', closeUserManagementModal);
    if (el.btnCloseUserMgmtBottom) el.btnCloseUserMgmtBottom.addEventListener('click', closeUserManagementModal);
    if (el.btnToggleAddUserForm) {
      el.btnToggleAddUserForm.addEventListener('click', () => {
        const isHidden = el.addUserCard.style.display === 'none';
        el.addUserCard.style.display = isHidden ? 'block' : 'none';
        if (isHidden) el.newUsername.focus();
      });
    }
    if (el.btnCancelAddUser) {
      el.btnCancelAddUser.addEventListener('click', () => {
        el.addUserCard.style.display = 'none';
      });
    }
    if (el.addUserForm) el.addUserForm.addEventListener('submit', handleAddUserSubmit);

    // Department Quick Add Events
    if (el.btnToggleAddDept) {
      el.btnToggleAddDept.addEventListener('click', () => {
        const isHidden = el.inlineAddDeptBox.style.display === 'none';
        el.inlineAddDeptBox.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) {
          el.newDeptInput.value = '';
          el.newDeptInput.focus();
        }
      });
    }
    if (el.btnCancelAddDept) {
      el.btnCancelAddDept.addEventListener('click', () => {
        el.inlineAddDeptBox.style.display = 'none';
      });
    }
    if (el.btnConfirmAddDept) {
      el.btnConfirmAddDept.addEventListener('click', handleAddNewDepartment);
    }
    if (el.newDeptInput) {
      el.newDeptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddNewDepartment();
        }
      });
    }

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
        const confirmMsg = currentLang === 'ar'
          ? 'هل تريد استعادة مشاريع فرنشايز ريدي التجريبية الافتراضية؟'
          : 'Reset tracker to default Franchise Ready sample projects?';

        if (confirm(confirmMsg)) {
          projects = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_PROJECTS));
          saveProjects();
          render();
          showToast(i18n[currentLang].toastSampleRestored, 'info');
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
        closeLoginModal();
        closeChangePasswordModal();
        closeUserManagementModal();
      }
    });
  }

  /**
   * Handle Dynamic Addition of Client / Department
   */
  function handleAddNewDepartment() {
    const val = el.newDeptInput.value.trim();
    if (!val) return;

    // Check duplicate
    const exists = departmentsList.some(d => d.toLowerCase() === val.toLowerCase());
    if (exists) {
      showToast(i18n[currentLang].toastDeptExists, 'error');
      updateDepartmentsDropdown(val);
      el.inlineAddDeptBox.style.display = 'none';
      return;
    }

    departmentsList.push(val);
    saveDepartments();
    updateDepartmentsDropdown(val);
    el.newDeptInput.value = '';
    el.inlineAddDeptBox.style.display = 'none';
    showToast(`${i18n[currentLang].toastDeptAdded}: ${val}`, 'success');

    if (typeof TrackerAPI !== 'undefined' && TrackerAPI.isHttpServer) {
      TrackerAPI.addDepartment(val).catch(e => console.warn('API addDept err:', e));
    }
  }

  /**
   * Authentication Handlers
   */
  function openLoginModal() {
    el.loginUsername.value = '';
    el.loginPassword.value = '';
    el.loginErrorAlert.style.display = 'none';
    el.loginModal.classList.add('show');
    el.loginUsername.focus();
  }

  function closeLoginModal() {
    el.loginModal.classList.remove('show');
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const username = el.loginUsername.value.trim();
    const password = el.loginPassword.value;

    if (!username || !password) {
      el.loginErrorAlert.textContent = i18n[currentLang].toastLoginError;
      el.loginErrorAlert.style.display = 'block';
      return;
    }

    if (typeof TrackerAPI !== 'undefined' && TrackerAPI.isHttpServer) {
      try {
        const res = await TrackerAPI.login(username, password);
        if (res.success && res.data) {
          currentUser = {
            id: res.data.id,
            username: res.data.username,
            fullName: res.data.fullName,
            role: res.data.role
          };
          saveSession();
          updateUserUI();
          closeLoginModal();
          showToast(`${i18n[currentLang].toastLoginSuccess}, ${currentUser.fullName}!`, 'success');
          syncWithBackend();
          return;
        } else if (!res.networkError) {
          el.loginErrorAlert.textContent = res.message || i18n[currentLang].toastLoginError;
          el.loginErrorAlert.style.display = 'block';
          return;
        }
      } catch (err) {
        console.warn('API login fallback:', err);
      }
    }

    const matchedUser = usersList.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

    if (matchedUser) {
      currentUser = {
        id: matchedUser.id,
        username: matchedUser.username,
        fullName: matchedUser.fullName,
        role: matchedUser.role
      };
      saveSession();
      updateUserUI();
      closeLoginModal();
      showToast(`${i18n[currentLang].toastLoginSuccess}, ${currentUser.fullName}!`, 'success');
    } else {
      el.loginErrorAlert.textContent = i18n[currentLang].toastLoginError;
      el.loginErrorAlert.style.display = 'block';
    }
  }

  /**
   * Change Password / Profile Handlers
   */
  function openChangePasswordModal() {
    if (!currentUser) return;
    clearErrors();

    const userRecord = usersList.find(u => u.username === currentUser.username);
    el.profileUsername.value = currentUser.username;
    el.profileFullName.value = currentUser.fullName;
    el.currentPassword.value = '';
    el.newPassword.value = '';
    el.confirmNewPassword.value = '';

    el.changePasswordModal.classList.add('show');
    el.currentPassword.focus();
  }

  function closeChangePasswordModal() {
    el.changePasswordModal.classList.remove('show');
  }

  async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    clearErrors();

    const newUsername = el.profileUsername.value.trim();
    const newFullName = el.profileFullName.value.trim();
    const currentPass = el.currentPassword.value;
    const newPass = el.newPassword.value;
    const confirmPass = el.confirmNewPassword.value;

    if (!currentPass) {
      showFieldError('errCurrentPassword', currentLang === 'ar' ? 'كلمة المرور الحالية مطلوبة' : 'Current password is required');
      return;
    }

    if (newPass.length < 6) {
      showFieldError('errNewPassword', currentLang === 'ar' ? 'يجب أن لا تقل كلمة المرور عن 6 خانات' : 'Password must be at least 6 characters');
      return;
    }

    if (newPass !== confirmPass) {
      showFieldError('errConfirmNewPassword', currentLang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    // If HTTP / PHP backend available, submit directly to API
    if (typeof TrackerAPI !== 'undefined' && TrackerAPI.isHttpServer) {
      try {
        const res = await TrackerAPI.changePassword(currentPass, newPass, newUsername, newFullName, currentUser.username);
        if (!res.success) {
          if (res.message && (res.message.includes('password') || res.message.includes('Password') || res.message.includes('مرور'))) {
            showFieldError('errCurrentPassword', res.message);
          } else {
            showFieldError('errProfileUsername', res.message || 'Update failed');
          }
          return;
        }

        // Successfully updated on MySQL backend
        const oldUname = currentUser.username;
        currentUser.username = newUsername;
        currentUser.fullName = newFullName;
        saveSession();
        updateUserUI();

        // Update local usersList cache
        const userIdx = usersList.findIndex(u => u.username === oldUname || u.username === newUsername);
        if (userIdx !== -1) {
          usersList[userIdx].username = newUsername;
          usersList[userIdx].fullName = newFullName;
          usersList[userIdx].password = newPass;
          saveUsers();
        }

        closeChangePasswordModal();
        showToast(currentLang === 'ar' ? 'تم تحديث كلمة المرور وبيانات الدخول بنجاح! كلمة المرور القديمة أصبحت ملغاة.' : 'Password updated successfully! Old password is now disabled.', 'success');
        return;
      } catch (err) {
        console.warn('API password change fallback to local:', err);
      }
    }

    // LocalStorage fallback for offline mode
    const userIdx = usersList.findIndex(u => u.username === currentUser.username);
    if (userIdx !== -1 && usersList[userIdx].password && usersList[userIdx].password !== currentPass) {
      showFieldError('errCurrentPassword', currentLang === 'ar' ? 'كلمة المرور الحالية غير صحيحة' : 'Current password incorrect');
      return;
    }

    if (userIdx !== -1) {
      usersList[userIdx].username = newUsername;
      usersList[userIdx].fullName = newFullName;
      usersList[userIdx].password = newPass;
      saveUsers();
    }

    currentUser.username = newUsername;
    currentUser.fullName = newFullName;
    saveSession();
    updateUserUI();

    closeChangePasswordModal();
    showToast(i18n[currentLang].toastPasswordChanged, 'success');
  }

  /**
   * User Management Modal Handlers (Admin)
   */
  function openUserManagementModal() {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Admin privilege required', 'error');
      return;
    }
    el.addUserCard.style.display = 'none';
    renderUsersTable();
    el.userManagementModal.classList.add('show');
  }

  function closeUserManagementModal() {
    el.userManagementModal.classList.remove('show');
  }

  function renderUsersTable() {
    if (!el.usersTableBody) return;
    el.usersTableBody.innerHTML = '';

    usersList.forEach(u => {
      const tr = document.createElement('tr');
      const isSelf = currentUser && u.username === currentUser.username;
      const roleBadgeClass = u.role === 'admin' ? 'role-admin' : 'role-user';
      const roleLabel = u.role === 'admin' ? (currentLang === 'ar' ? 'مسؤول' : 'Admin') : (currentLang === 'ar' ? 'مستخدم' : 'User');

      tr.innerHTML = `
        <td>
          <strong>${escapeHTML(u.fullName)}</strong><br>
          <small class="text-muted">@${escapeHTML(u.username)}</small>
        </td>
        <td>
          <span class="role-badge ${roleBadgeClass}">${escapeHTML(roleLabel)}</span>
        </td>
        <td class="text-muted text-sm">${escapeHTML(u.createdAt || '2026-11-20')}</td>
        <td class="text-center">
          ${isSelf ? `<small class="text-muted">(${currentLang === 'ar' ? 'حسابك الحالي' : 'Active Account'})</small>` : `
            <button type="button" class="btn-action-icon btn-action-delete" data-del-user="${u.id}" title="Delete User">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          `}
        </td>
      `;

      const btnDel = tr.querySelector('[data-del-user]');
      if (btnDel) {
        btnDel.addEventListener('click', () => {
          if (confirm(`${currentLang === 'ar' ? 'هل أنت متأكد من حذف المستخدم' : 'Are you sure you want to delete user'} ${u.username}?`)) {
            if (typeof TrackerAPI !== 'undefined' && TrackerAPI.isHttpServer) {
              TrackerAPI.deleteUser(u.id).catch(e => console.warn('API deleteUser err:', e));
            }
            usersList = usersList.filter(item => item.id !== u.id);
            saveUsers();
            renderUsersTable();
            showToast(i18n[currentLang].toastUserDeleted, 'info');
          }
        });
      }

      el.usersTableBody.appendChild(tr);
    });
  }

  async function handleAddUserSubmit(e) {
    e.preventDefault();
    clearErrors();

    const username = el.newUsername.value.trim();
    const fullName = el.newUserFullName.value.trim();
    const password = el.newUserPassword.value;
    const role = el.newUserRole.value || 'user';

    if (!username) {
      showFieldError('errNewUsername', currentLang === 'ar' ? 'اسم المستخدم مطلوب' : 'Username is required');
      return;
    }

    if (!fullName) {
      showFieldError('errNewUserFullName', currentLang === 'ar' ? 'الاسم الكامل مطلوب' : 'Full name is required');
      return;
    }

    if (password.length < 6) {
      showFieldError('errNewUserPassword', currentLang === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 6 خانات' : 'Password must be at least 6 characters');
      return;
    }

    // Call API to create user in MySQL
    if (typeof TrackerAPI !== 'undefined' && TrackerAPI.isHttpServer) {
      try {
        const res = await TrackerAPI.createUser({
          username,
          password,
          fullName,
          role
        });

        if (!res.success) {
          showFieldError('errNewUsername', res.message || 'Failed to create user in database');
          return;
        }

        const newUser = {
          id: res.data ? res.data.id : `u_${Date.now()}`,
          username: res.data ? res.data.username : username,
          fullName: res.data ? res.data.fullName : fullName,
          password: password,
          role: res.data ? res.data.role : role,
          createdAt: new Date().toISOString().split('T')[0]
        };

        usersList.push(newUser);
        saveUsers();
        renderUsersTable();

        el.newUsername.value = '';
        el.newUserFullName.value = '';
        el.newUserPassword.value = '';
        el.addUserCard.style.display = 'none';

        showToast(currentLang === 'ar' ? `تم إنشاء المستخدم "${username}" بنجاح! يمكنه تسجيل الدخول الآن.` : `User "${username}" created successfully! They can log in now.`, 'success');
        return;
      } catch (err) {
        console.warn('API createUser fallback to local:', err);
      }
    }

    // LocalStorage fallback for offline mode
    const exists = usersList.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      showFieldError('errNewUsername', currentLang === 'ar' ? 'اسم المستخدم مسجل مسبقاً' : 'Username already exists');
      return;
    }

    const newUser = {
      id: `u_${Date.now()}`,
      username,
      fullName,
      password,
      role,
      createdAt: new Date().toISOString().split('T')[0]
    };

    usersList.push(newUser);
    saveUsers();
    renderUsersTable();

    el.newUsername.value = '';
    el.newUserFullName.value = '';
    el.newUserPassword.value = '';
    el.addUserCard.style.display = 'none';

    showToast(i18n[currentLang].toastUserCreated, 'success');
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
        const code = (p.code || '').toLowerCase();
        const nameEn = (p.name_en || p.name || '').toLowerCase();
        const nameAr = (p.name_ar || '').toLowerCase();
        const dept = (p.department || '').toLowerCase();
        const mgrEn = (p.manager_en || p.manager || '').toLowerCase();
        const mgrAr = (p.manager_ar || '').toLowerCase();
        const upEn = (p.latestUpdates_en || p.latestUpdates || '').toLowerCase();
        const upAr = (p.latestUpdates_ar || '').toLowerCase();
        const status = (p.status || '').toLowerCase();

        return (
          code.includes(searchQuery) ||
          nameEn.includes(searchQuery) ||
          nameAr.includes(searchQuery) ||
          dept.includes(searchQuery) ||
          mgrEn.includes(searchQuery) ||
          mgrAr.includes(searchQuery) ||
          upEn.includes(searchQuery) ||
          upAr.includes(searchQuery) ||
          status.includes(searchQuery)
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      let valA, valB;

      if (sortColumn === 'progress') {
        valA = Number(a.progress) || 0;
        valB = Number(b.progress) || 0;
      } else if (sortColumn === 'department') {
        valA = getProjectField(a, 'department').toLowerCase();
        valB = getProjectField(b, 'department').toLowerCase();
      } else if (sortColumn === 'manager') {
        valA = getProjectField(a, 'manager').toLowerCase();
        valB = getProjectField(b, 'manager').toLowerCase();
      } else {
        valA = (a[sortColumn] || '').toString().toLowerCase();
        valB = (b[sortColumn] || '').toString().toLowerCase();
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
    const t = i18n[currentLang];

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

      const pName = getProjectField(project, 'name');
      const pDept = getProjectField(project, 'department');
      const pManager = getProjectField(project, 'manager');
      const pUpdates = getProjectField(project, 'latestUpdates');
      const pUpdatedTime = getProjectField(project, 'updatedAt') || (currentLang === 'ar' ? 'مؤخراً' : 'Recently');
      const pStatusLabel = getLocalizedStatus(project.status);

      // Initial for Avatar
      const initial = pManager ? pManager.trim().charAt(0).toUpperCase() : 'M';
      let avatarClass = 'avatar-k';
      if (['S', 'س'].includes(initial)) avatarClass = 'avatar-s';
      else if (['T', 'ط'].includes(initial)) avatarClass = 'avatar-t';
      else if (['N', 'ن'].includes(initial)) avatarClass = 'avatar-n';
      else if (['D', 'F', 'ف'].includes(initial)) avatarClass = 'avatar-s';

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
        <td class="td-dept" data-label="${t.colDept}">
          <div class="dept-cell">
            <div class="dept-icon-box" title="${escapeHTML(pDept)}">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
              </svg>
            </div>
            <div class="dept-info">
              <span class="dept-name">${escapeHTML(pDept || (currentLang === 'ar' ? 'عام' : 'General'))}</span>
              <span class="dept-project-code">${escapeHTML(project.code || '')} &bull; ${escapeHTML(pName || '')}</span>
            </div>
          </div>
        </td>

        <!-- Project Manager -->
        <td data-label="${t.colManager}">
          <div class="manager-cell">
            <div class="manager-avatar ${avatarClass}" title="${escapeHTML(pManager)}">
              ${escapeHTML(initial)}
            </div>
            <span class="manager-name">${escapeHTML(pManager || (currentLang === 'ar' ? 'غير محدد' : 'Unassigned'))}</span>
          </div>
        </td>

        <!-- Status -->
        <td data-label="${t.colStatus}">
          <span class="status-pill ${statusClass}">
            <span class="status-dot"></span>
            ${escapeHTML(pStatusLabel)}
          </span>
        </td>

        <!-- Progress -->
        <td data-label="${t.colProgress}">
          <div class="progress-cell">
            <div class="progress-header">
              <span>${t.progressText} ${project.progress || 0}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill ${fillClass}" style="width: ${Math.min(100, Math.max(0, project.progress || 0))}%;"></div>
            </div>
          </div>
        </td>

        <!-- Latest Updates (Click directly to edit inline) -->
        <td data-label="${t.colUpdates}">
          <div class="update-cell" data-id="${project.id}" title="${t.inlineEditHint}">
            <div class="update-text">${escapeHTML(pUpdates || (currentLang === 'ar' ? 'لم يتم تسجيل أي تحديث بعد.' : 'No operational update logged yet.'))}</div>
            <div class="update-meta">
              <span>🕒 ${t.updatedPrefix}: ${escapeHTML(pUpdatedTime)}</span>
              <span class="update-edit-hint">${t.quickEditHint}</span>
            </div>
          </div>
        </td>

        <!-- Due Date -->
        <td data-label="${t.colDate}">
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
        <td class="td-actions" data-label="${t.colActions}">
          <div class="actions-cell">
            <button type="button" class="btn-action-icon btn-action-edit" data-id="${project.id}" title="${t.modalEditPrefix}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button type="button" class="btn-action-icon btn-action-delete" data-id="${project.id}" title="${t.deleteModalTitle}">
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
    const t = i18n[currentLang];
    el.editProjectId.value = '';
    el.modalTitle.textContent = t.modalAddTitle;
    el.projectCode.value = generateNextCode();
    el.projectName.value = '';

    // Reset departments dropdown and hide quick-add box
    updateDepartmentsDropdown();
    el.inlineAddDeptBox.style.display = 'none';

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
    const t = i18n[currentLang];
    el.editProjectId.value = project.id;
    el.modalTitle.textContent = `${t.modalEditPrefix}: ${project.code}`;
    el.projectCode.value = project.code || '';
    el.projectName.value = getProjectField(project, 'name');

    // Update departments dropdown with existing project department
    const dept = project.department || '';
    if (dept && !departmentsList.includes(dept)) {
      departmentsList.push(dept);
      saveDepartments();
    }
    updateDepartmentsDropdown(dept);
    el.inlineAddDeptBox.style.display = 'none';

    el.projectManager.value = getProjectField(project, 'manager');
    el.projectStatus.value = project.status || 'In Progress';
    el.dueDate.value = project.dueDate || '';
    el.progressRange.value = project.progress || 0;
    el.progressValBadge.textContent = `${project.progress || 0}%`;
    el.latestUpdates.value = getProjectField(project, 'latestUpdates');

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
    const t = i18n[currentLang];

    const code = el.projectCode.value.trim();
    const name = el.projectName.value.trim();
    const department = el.clientDepartmentSelect.value.trim();
    const manager = el.projectManager.value.trim();
    const status = el.projectStatus.value;
    const dueDate = el.dueDate.value;
    const progress = parseInt(el.progressRange.value, 10) || 0;
    const updates = el.latestUpdates.value.trim();

    let hasError = false;

    if (!code) {
      showFieldError('errProjectCode', currentLang === 'ar' ? 'كود المشروع مطلوب' : 'Project code is required');
      hasError = true;
    }
    if (!name) {
      showFieldError('errProjectName', currentLang === 'ar' ? 'اسم المشروع مطلوب' : 'Project name is required');
      hasError = true;
    }
    if (!department) {
      showFieldError('errClientDepartment', currentLang === 'ar' ? 'يرجى اختيار أو إضافة القسم' : 'Please select or add a department');
      hasError = true;
    }
    if (!manager) {
      showFieldError('errProjectManager', currentLang === 'ar' ? 'اسم المدير مطلوب' : 'Project manager is required');
      hasError = true;
    }
    if (!dueDate) {
      showFieldError('errDueDate', currentLang === 'ar' ? 'تاريخ التسليم مطلوب' : 'Due date is required');
      hasError = true;
    }
    if (!updates) {
      showFieldError('errLatestUpdates', currentLang === 'ar' ? 'ملخص التحديث مطلوب' : 'Latest updates summary is required');
      hasError = true;
    }

    if (hasError) return;

    const editId = el.editProjectId.value;

    if (editId) {
      // Update existing
      const idx = projects.findIndex(p => p.id === editId);
      if (idx !== -1) {
        const existing = projects[idx];
        const updatePayload = {
          ...existing,
          code,
          department,
          status,
          dueDate,
          progress,
          lastModified: new Date().toISOString()
        };

        if (currentLang === 'ar') {
          updatePayload.name_ar = name;
          updatePayload.manager_ar = manager;
          updatePayload.latestUpdates_ar = updates;
          updatePayload.updatedAt_ar = 'الآن';
          if (!updatePayload.name_en) updatePayload.name_en = name;
        } else {
          updatePayload.name_en = name;
          updatePayload.manager_en = manager;
          updatePayload.latestUpdates_en = updates;
          updatePayload.updatedAt_en = 'Just now';
          if (!updatePayload.name_ar) updatePayload.name_ar = name;
        }

        projects[idx] = updatePayload;
        showToast(`${t.toastProjectUpdated} (${code})`, 'success');
      }
    } else {
      // Create new
      const newProject = {
        id: code,
        code,
        name_en: name,
        name_ar: name,
        department,
        manager_en: manager,
        manager_ar: manager,
        status,
        dueDate,
        progress,
        latestUpdates_en: updates,
        latestUpdates_ar: updates,
        updatedAt_en: 'Just now',
        updatedAt_ar: 'الآن',
        lastModified: new Date().toISOString()
      };
      projects.unshift(newProject);
      showToast(`${t.toastProjectAdded} (${code})`, 'success');
    }

    saveProjects();
    closeProjectModal();
    render();

    if (typeof TrackerAPI !== 'undefined' && TrackerAPI.isHttpServer) {
      const apiData = {
        project_code: code,
        project_name: name,
        client_department: department,
        project_manager: manager,
        status: status,
        progress: progress,
        due_date: dueDate,
        latest_updates: updates
      };
      if (editId) {
        const existing = projects.find(p => p.id === editId);
        if (existing && existing.dbId) apiData.id = existing.dbId;
        TrackerAPI.updateProject(apiData).catch(e => console.warn('API update err:', e));
      } else {
        TrackerAPI.createProject(apiData).then(res => {
          if (res && res.data && res.data.id) {
            const found = projects.find(p => p.code === code);
            if (found) {
              found.dbId = res.data.id;
              saveProjects();
            }
          }
        }).catch(e => console.warn('API create err:', e));
      }
    }
  }

  function showFieldError(elementId, message) {
    const errEl = document.getElementById(elementId);
    if (errEl) errEl.textContent = message;
  }

  function clearErrors() {
    const errorEls = document.querySelectorAll('.field-error');
    errorEls.forEach(elem => elem.textContent = '');
  }

  /**
   * Inline Edit Modal for Quick Updates
   */
  function openInlineModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const pName = getProjectField(project, 'name');
    const pDept = getProjectField(project, 'department');
    const pMgr = getProjectField(project, 'manager');
    const pUpdates = getProjectField(project, 'latestUpdates');

    el.inlineProjectId.value = project.id;
    el.inlineProjectInfo.innerHTML = `
      <strong>${escapeHTML(project.code)}</strong>: ${escapeHTML(pName)}<br>
      <span class="text-muted" style="font-size: 0.8rem;">${escapeHTML(pDept)} &bull; ${escapeHTML(pMgr)}</span>
    `;
    el.inlineUpdateText.value = pUpdates || '';
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
      if (currentLang === 'ar') {
        project.latestUpdates_ar = text;
        project.updatedAt_ar = 'الآن';
      } else {
        project.latestUpdates_en = text;
        project.updatedAt_en = 'Just now';
      }
      project.lastModified = new Date().toISOString();
      saveProjects();
      render();
      showToast(i18n[currentLang].toastUpdateSaved, 'success');

      if (typeof TrackerAPI !== 'undefined' && TrackerAPI.isHttpServer) {
        TrackerAPI.quickUpdate(project.dbId || project.id, {
          latest_updates: text,
          status: project.status,
          progress: project.progress
        }).catch(e => console.warn('API quickUpdate err:', e));
      }
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
    const pName = getProjectField(project, 'name');
    el.deleteProjectName.textContent = `${project.code} (${pName})`;
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

    if (target && typeof TrackerAPI !== 'undefined' && TrackerAPI.isHttpServer) {
      TrackerAPI.deleteProject(target.dbId || target.id).catch(e => console.warn('API delete err:', e));
    }

    projects = projects.filter(p => p.id !== deleteTargetId);
    saveProjects();
    render();
    closeDeleteModal();
    showToast(`${code} ${i18n[currentLang].toastProjectDeleted}`, 'info');
  }

  /**
   * Export to CSV (Bilingual Support)
   */
  function exportToCSV() {
    if (projects.length === 0) {
      showToast(currentLang === 'ar' ? 'لا توجد بيانات للتصدير' : 'No project data to export', 'error');
      return;
    }

    const t = i18n[currentLang];
    const headers = [
      t.lblProjectCode,
      t.lblProjectName,
      t.lblDepartment,
      t.lblManager,
      t.lblStatus,
      `${t.lblProgress} %`,
      t.lblDueDate,
      t.lblUpdates,
      t.updatedPrefix
    ];

    const rows = projects.map(p => [
      `"${(p.code || '').replace(/"/g, '""')}"`,
      `"${getProjectField(p, 'name').replace(/"/g, '""')}"`,
      `"${getProjectField(p, 'department').replace(/"/g, '""')}"`,
      `"${getProjectField(p, 'manager').replace(/"/g, '""')}"`,
      `"${getLocalizedStatus(p.status).replace(/"/g, '""')}"`,
      p.progress || 0,
      `"${p.dueDate || ''}"`,
      `"${getProjectField(p, 'latestUpdates').replace(/"/g, '""')}"`,
      `"${getProjectField(p, 'updatedAt') || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Franchise_Ready_Projects_${currentLang}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(t.toastCsvExported, 'success');
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
