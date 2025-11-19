import axios from 'axios';

// Base URL của API Gateway
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Tự động thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Xử lý lỗi chung
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Token hết hạn
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(errorMessage));
  }
);

// ===========================
// AUTH APIs
// ===========================
export const authAPI = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  getProfile: () => api.get('/users/profile'),
};

// ===========================
// USER APIs
// ===========================
export const userAPI = {
  getBalance: () => api.get('/users/balance'),
  getBalanceHistory: () => api.get('/users/balance/history'),
};

// ===========================
// MARKET APIs
// ===========================
export const marketAPI = {
  getPrices: () => api.get('/market/prices'),
  getCoinPrice: (coinId) => api.get(`/market/price/${coinId}`),
  getChartData: (coinId, days = 7) => api.get(`/market/chart/${coinId}`, { params: { days } }),
  getSupportedCoins: () => api.get('/market/coins'),
  getMarketStats: () => api.get('/market/stats'),
};

// ===========================
// PORTFOLIO APIs
// ===========================
export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio'),
  getHolding: (symbol) => api.get(`/portfolio/holding/${symbol}`),
  getPerformance: () => api.get('/portfolio/performance'),
};

// ===========================
// TRADE APIs
// ===========================
export const tradeAPI = {
  buy: (data) => api.post('/trade/buy', data),
  sell: (data) => api.post('/trade/sell', data),
  getHistory: (params) => api.get('/trade/history', { params }),
  getTradeById: (id) => api.get(`/trade/${id}`),
  getStats: () => api.get('/trade/stats'),
};

// ===========================
// NOTIFICATION APIs
// ===========================
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  
  // Price alerts
  createPriceAlert: (data) => api.post('/notifications/alert', data),
  getPriceAlerts: () => api.get('/notifications/alerts'),
  deletePriceAlert: (id) => api.delete(`/notifications/alert/${id}`),
};

export default api;
