import axios from "axios";

const url = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (userData) => api.put("/auth/profile", userData),
  changePassword: (passwordData) =>
    api.put("/auth/change-password", passwordData),
  googleSignIn: (idToken) => api.post('/auth/google', { idToken })
};

// Users API
export const usersAPI = {
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
  addFriend: (userId) => api.post(`/users/friends/${userId}`),
  removeFriend: (userId) => api.delete(`/users/friends/${userId}`),
  getFriends: () => api.get("/users/friends"),
  getBalance: () => api.get("/users/balance"),
  getDashboard: () => api.get("/users/dashboard"),
};

// Groups API
export const groupsAPI = {
  createGroup: (groupData) => api.post("/groups", groupData),
  getGroups: () => api.get("/groups"),
  getGroup: (groupId) => api.get(`/groups/${groupId}`),
  updateGroup: (groupId, groupData) => api.put(`/groups/${groupId}`, groupData),
  deleteGroup: (groupId) => api.delete(`/groups/${groupId}`),
  addMember: (groupId, userId) =>
    api.post(`/groups/${groupId}/members`, { userId }),
  leaveGroup: (groupId) => api.delete(`/groups/${groupId}/leave`),
};

// Expenses API
export const expensesAPI = {
  createExpense: (expenseData) => api.post("/expenses", expenseData),
  getGroupExpenses: (groupId, page = 1, limit = 20) =>
    api.get(`/expenses/group/${groupId}?page=${page}&limit=${limit}`),
  getExpense: (expenseId) => api.get(`/expenses/${expenseId}`),
  updateExpense: (expenseId, expenseData) =>
    api.put(`/expenses/${expenseId}`, expenseData),
  deleteExpense: (expenseId) => api.delete(`/expenses/${expenseId}`),
  markSplitPaid: (expenseId, userId) =>
    api.put(`/expenses/${expenseId}/splits/${userId}/paid`),
  getGroupBalances: (groupId) => api.get(`/expenses/group/${groupId}/balances`),
};

// Settlements API
export const settlementsAPI = {
  createSettlement: (settlementData) =>
    api.post("/settlements", settlementData),
  confirmSettlement: (settlementId) =>
    api.put(`/settlements/${settlementId}/confirm`),
  getGroupSettlements: (groupId, status = null) =>
    api.get(
      `/settlements/group/${groupId}${status ? `?status=${status}` : ""}`
    ),
  cancelSettlement: (settlementId) =>
    api.delete(`/settlements/${settlementId}`),
};

// Analytics API
export const analyticsAPI = {
  getMonthlySummary: (month, year) =>
    api.get(`/analytics/monthly/summary?month=${month}&year=${year}`),
  getMonthlyAnalytics: (month, year) =>
    api.get(`/analytics/monthly/analytics?month=${month}&year=${year}`),
  getYearlyReport: (year) =>
    api.get(`/analytics/yearly/report?year=${year}`),
  getInsights: (month, year) =>
    api.get(`/analytics/insights?month=${month}&year=${year}`),
  getUserExpenses: (month, year, category, paymentMethod) => {
    let url = `/analytics/user-expenses`;
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    if (category) params.append('category', category);
    if (paymentMethod) params.append('paymentMethod', paymentMethod);
    if (params.toString()) url += `?${params.toString()}`;
    return api.get(url);
  }
};

export default api;
