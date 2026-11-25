/**
 * Franchise Ready (فرنشايز ريدي السعودية) - Standalone Login Controller
 * Shared authentication engine, LocalStorage persistence, Bilingual (EN/AR RTL),
 * and automatic redirection to the dashboard upon successful verification.
 */

(function () {
  'use strict';

  // Storage Keys (Shared with app.js)
  const USERS_STORAGE_KEY = 'franchise_ready_users_v2';
  const SESSION_STORAGE_KEY = 'franchise_ready_auth_session';
  const LANG_STORAGE_KEY = 'franchise_ready_lang';

  // Default Users
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

  // Translation Dictionaries
  const i18n = {
    en: {
      langToggleText: 'العربية',
      liveStatus: 'Live Status',
      appSubtitle: 'Franchise Ready Saudi Arabia • فرنشايز ريدي',
      loginPageTitle: 'Executive Portal Sign In',
      loginPageDesc: 'Enter your administrative or staff credentials to access the Project & Updates Tracker.',
      lblUsername: 'Username',
      lblPassword: 'Password',
      hintDefaultCreds: 'Default Admin Login:',
      btnAutoFill: 'Auto Fill',
      btnSignIn: 'Sign In to Portal',
      btnContinueGuest: 'Continue as Guest (View Only)',
      loginRights: 'All rights reserved.',
      toastLoginSuccess: 'Welcome back',
      toastLoginError: 'Invalid username or password. Please try again.',
      toastAutoFilled: 'Demo admin credentials loaded'
    },
    ar: {
      langToggleText: 'English',
      liveStatus: 'حالة مباشرة',
      appSubtitle: 'فرنشايز ريدي السعودية • المتابعة التنفيذية',
      loginPageTitle: 'تسجيل الدخول إلى البوابة التنفيذية',
      loginPageDesc: 'أدخل بيانات تسجيل الدخول الإدارية أو الوظيفية للوصول إلى نظام متابعة المشاريع والتحديثات.',
      lblUsername: 'اسم المستخدم',
      lblPassword: 'كلمة المرور',
      hintDefaultCreds: 'بيانات تسجيل الدخول الافتراضية:',
      btnAutoFill: 'تعبئة تلقائية',
      btnSignIn: 'تسجيل الدخول إلى البوابة',
      btnContinueGuest: 'المتابعة كزائر (عرض فقط)',
      loginRights: 'جميع الحقوق محفوظة.',
      toastLoginSuccess: 'مرحباً بعودتك',
      toastLoginError: 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.',
      toastAutoFilled: 'تم إدراج بيانات المسؤول الافتراضية'
    }
  };

  // State
  let currentLang = 'en';
  let usersList = [];

  // DOM Elements
  const el = {
    htmlRoot: document.getElementById('htmlRoot'),
    btnLangToggle: document.getElementById('btnLangToggle'),
    langText: document.getElementById('langText'),
    loginForm: document.getElementById('standaloneLoginForm'),
    inputUsername: document.getElementById('inputUsername'),
    inputPassword: document.getElementById('inputPassword'),
    btnTogglePassword: document.getElementById('btnTogglePassword'),
    btnFillDemo: document.getElementById('btnFillDemo'),
    loginAlert: document.getElementById('loginAlert'),
    btnSubmitLogin: document.getElementById('btnSubmitLogin'),
    toastContainer: document.getElementById('toastContainer')
  };

  /**
   * Initialize Login Page
   */
  function init() {
    initLanguage();
    initUsers();
    bindEvents();
    applyTranslations();
  }

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

  function setLanguage(lang, refresh = true) {
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
  }

  function applyTranslations() {
    const t = i18n[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(elem => {
      const key = elem.getAttribute('data-i18n');
      if (t[key]) {
        elem.textContent = t[key];
      }
    });

    if (el.inputUsername) el.inputUsername.placeholder = currentLang === 'ar' ? 'مثال: ibraheem01' : 'e.g., ibraheem01';
  }

  function initUsers() {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        usersList = JSON.parse(stored);
      } else {
        usersList = JSON.parse(JSON.stringify(DEFAULT_USERS));
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersList));
      }
    } catch (e) {
      usersList = JSON.parse(JSON.stringify(DEFAULT_USERS));
    }
  }

  function bindEvents() {
    // Language Toggle
    if (el.btnLangToggle) {
      el.btnLangToggle.addEventListener('click', () => {
        const next = currentLang === 'en' ? 'ar' : 'en';
        setLanguage(next, true);
        showToast(next === 'ar' ? 'تم تحويل اللغة إلى العربية' : 'Switched to English', 'info');
      });
    }

    // Toggle Password Visibility
    if (el.btnTogglePassword && el.inputPassword) {
      el.btnTogglePassword.addEventListener('click', () => {
        const isPassword = el.inputPassword.type === 'password';
        el.inputPassword.type = isPassword ? 'text' : 'password';
        el.btnTogglePassword.textContent = isPassword ? '🙈' : '👁';
      });
    }

    // Auto Fill Demo Credentials
    if (el.btnFillDemo) {
      el.btnFillDemo.addEventListener('click', () => {
        el.inputUsername.value = 'ibraheem01';
        el.inputPassword.value = '123456789';
        if (el.loginAlert) el.loginAlert.style.display = 'none';
        showToast(i18n[currentLang].toastAutoFilled, 'info');
      });
    }

    // Form Submit
    if (el.loginForm) {
      el.loginForm.addEventListener('submit', handleLogin);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    const t = i18n[currentLang];
    const username = el.inputUsername.value.trim();
    const password = el.inputPassword.value;

    if (!username || !password) {
      showError(t.toastLoginError);
      return;
    }

    const matched = usersList.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

    if (matched) {
      const session = {
        id: matched.id,
        username: matched.username,
        fullName: matched.fullName,
        role: matched.role
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

      if (el.loginAlert) el.loginAlert.style.display = 'none';
      showToast(`${t.toastLoginSuccess}, ${matched.fullName}!`, 'success');

      // Smooth redirection to dashboard
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 700);
    } else {
      showError(t.toastLoginError);
    }
  }

  function showError(msg) {
    if (el.loginAlert) {
      el.loginAlert.textContent = msg;
      el.loginAlert.style.display = 'block';
    }
  }

  function showToast(message, type = 'info') {
    if (!el.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    else if (type === 'error') icon = '✕';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    el.toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
