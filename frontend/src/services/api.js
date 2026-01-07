const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/login';
      throw new Error('認証エラー');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'エラーが発生しました');
    }

    return response.json();
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Auth
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'ログインに失敗しました');
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  logout() {
    this.setToken(null);
  }

  async getMe() {
    return this.get('/auth/me');
  }

  // Quotes
  getQuotes(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/quotes${query ? `?${query}` : ''}`);
  }

  getQuote(id) {
    return this.get(`/quotes/${id}`);
  }

  createQuote(data) {
    return this.post('/quotes', data);
  }

  updateQuote(id, data) {
    return this.put(`/quotes/${id}`, data);
  }

  // Projects
  getProjects(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/projects${query ? `?${query}` : ''}`);
  }

  getProject(id) {
    return this.get(`/projects/${id}`);
  }

  // Employees
  getEmployees(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/employees${query ? `?${query}` : ''}`);
  }

  // Clients
  getClients(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/clients${query ? `?${query}` : ''}`);
  }

  // Partners
  getPartners(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/partners${query ? `?${query}` : ''}`);
  }

  // Dashboard
  getDashboardSummary() {
    return this.get('/dashboard/summary');
  }

  getMonthlyReport(year, month) {
    return this.get(`/dashboard/monthly-report?year=${year}&month=${month}`);
  }

  // Daily Reports
  getDailyReports(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/daily-reports${query ? `?${query}` : ''}`);
  }

  createDailyReport(data) {
    return this.post('/daily-reports', data);
  }

  // Expenses
  getExpenses(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/expenses${query ? `?${query}` : ''}`);
  }

  createExpense(data) {
    return this.post('/expenses', data);
  }

  // Schedules
  getSchedules(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/schedules${query ? `?${query}` : ''}`);
  }

  createSchedule(data) {
    return this.post('/schedules', data);
  }

  // Leave Requests
  getLeaveRequests(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/leave-requests${query ? `?${query}` : ''}`);
  }

  createLeaveRequest(data) {
    return this.post('/leave-requests', data);
  }

  // Approvals
  getPendingApprovals() {
    return this.get('/approvals/pending');
  }
}

export const api = new ApiService();
export default api;
