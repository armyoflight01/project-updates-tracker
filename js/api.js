/**
 * Franchise Ready Saudi Arabia (فرنشايز ريدي السعودية)
 * Central API Client - Bridges Frontend to PHP / MySQL Enterprise Backend
 */

const TrackerAPI = (function () {
  'use strict';

  const BASE_URL = 'api/';

  // Detect whether running via HTTP/HTTPS server (e.g. XAMPP Apache)
  const isHttpServer = window.location.protocol.startsWith('http');
  let isBackendAvailable = null;

  async function request(endpoint, options = {}) {
    const url = BASE_URL + endpoint;
    const defaultHeaders = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const config = {
      ...options,
      credentials: 'same-origin',
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({
        success: false,
        message: 'Invalid server response'
      }));

      return {
        ok: response.ok,
        status: response.status,
        ...data
      };
    } catch (err) {
      console.warn('API fetch failed:', err);
      return {
        ok: false,
        success: false,
        message: 'Cannot connect to PHP backend. Verify Apache/MySQL are running in XAMPP.',
        networkError: true
      };
    }
  }

  return {
    isHttpServer,

    /**
     * Check if PHP API is responsive and MySQL is accessible
     */
    async ping() {
      if (!isHttpServer) {
        isBackendAvailable = false;
        return false;
      }
      try {
        const res = await request('auth.php?action=check', { method: 'GET' });
        isBackendAvailable = !res.networkError;
        return isBackendAvailable;
      } catch (e) {
        isBackendAvailable = false;
        return false;
      }
    },

    getBackendStatus() {
      return isBackendAvailable;
    },

    // ----------------------------------------------------
    // Authentication
    // ----------------------------------------------------
    async checkSession() {
      return request('auth.php?action=check', { method: 'GET' });
    },

    async login(username, password) {
      return request('auth.php?action=login', {
        method: 'POST',
        body: { username, password }
      });
    },

    async logout() {
      return request('auth.php?action=logout', { method: 'POST' });
    },

    async changePassword(oldPassword, newPassword, newUsername, newFullName, currentUsername = '') {
      return request('auth.php?action=change_password', {
        method: 'POST',
        body: { oldPassword, newPassword, newUsername, newFullName, currentUsername }
      });
    },

    // ----------------------------------------------------
    // Projects
    // ----------------------------------------------------
    async getProjects(filters = {}) {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      const query = params.toString() ? '?' + params.toString() : '';
      return request('projects.php' + query, { method: 'GET' });
    },

    async createProject(projectData) {
      return request('projects.php?action=create', {
        method: 'POST',
        body: projectData
      });
    },

    async updateProject(projectData) {
      return request('projects.php?action=update', {
        method: 'POST',
        body: projectData
      });
    },

    async quickUpdate(id, payload) {
      return request('projects.php?action=quick_update', {
        method: 'POST',
        body: { id, ...payload }
      });
    },

    async deleteProject(id) {
      return request('projects.php?action=delete', {
        method: 'POST',
        body: { id }
      });
    },

    // ----------------------------------------------------
    // Departments
    // ----------------------------------------------------
    async getDepartments() {
      return request('departments.php', { method: 'GET' });
    },

    async addDepartment(name, code = '', description = '') {
      return request('departments.php', {
        method: 'POST',
        body: { name, code, description }
      });
    },

    // ----------------------------------------------------
    // User Management (Admin Only)
    // ----------------------------------------------------
    async getUsers() {
      return request('users.php', { method: 'GET' });
    },

    async createUser(userData) {
      return request('users.php?action=create', {
        method: 'POST',
        body: userData
      });
    },

    async updateUser(userData) {
      return request('users.php?action=update', {
        method: 'POST',
        body: userData
      });
    },

    async deleteUser(idOrPayload) {
      const body = typeof idOrPayload === 'object' ? idOrPayload : { id: idOrPayload };
      return request('users.php?action=delete', {
        method: 'POST',
        body
      });
    }
  };
})();
