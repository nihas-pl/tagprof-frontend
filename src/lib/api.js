import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API methods
export const api = {
  // Auth
  auth: {
    login: (email, password) =>
      apiClient.post('/session', { email_address: email, password }),
    signup: (email, name, password) =>
      apiClient.post('/registration', { user: { email_address: email, name, password } }),
    logout: () => apiClient.delete('/session'),
    getCurrentUser: () => apiClient.get('/session'),
  },

  // Dashboard
  dashboard: {
    getMetrics: () => apiClient.get('/api/v1/dashboard'),
  },

  // Mentions
  mentions: {
    list: (params = {}) => apiClient.get('/api/v1/mentions', { params }),
    get: (id) => apiClient.get(`/api/v1/mentions/${id}`),
  },

  // Discounts (legacy - maps to discount_codes)
  discounts: {
    list: (params = {}) => apiClient.get('/api/v1/discount_codes', { params }),
    get: (id) => apiClient.get(`/api/v1/discount_codes/${id}`),
    create: (data) => apiClient.post('/api/v1/discount_codes', { code: data }),
    update: (id, data) => apiClient.patch(`/api/v1/discount_codes/${id}`, { code: data }),
    delete: (id) => apiClient.delete(`/api/v1/discount_codes/${id}`),
    bulkGenerate: (count) => apiClient.post('/api/v1/discounts/bulk_generate', { count }),
    toggleMode: (mode) => apiClient.post('/api/v1/discounts/toggle_mode', { mode }),
  },

  // Discount Campaigns
  campaigns: {
    list: (params = {}) => apiClient.get('/api/v1/discount_campaigns', { params }),
    get: (id) => apiClient.get(`/api/v1/discount_campaigns/${id}`),
    create: (data) => apiClient.post('/api/v1/discount_campaigns', { campaign: data }),
    update: (id, data) => apiClient.patch(`/api/v1/discount_campaigns/${id}`, { campaign: data }),
    delete: (id) => apiClient.delete(`/api/v1/discount_campaigns/${id}`),
    generateCodes: (id, count) => apiClient.post(`/api/v1/discount_campaigns/${id}/generate_codes`, { count }),
  },

  // Discount Codes
  discountCodes: {
    list: (params = {}) => apiClient.get('/api/v1/discount_codes', { params }),
    get: (id) => apiClient.get(`/api/v1/discount_codes/${id}`),
    update: (id, data) => apiClient.patch(`/api/v1/discount_codes/${id}`, { code: data }),
    delete: (id) => apiClient.delete(`/api/v1/discount_codes/${id}`),
  },

  // Discount Settings
  discountSettings: {
    get: () => apiClient.get('/api/v1/discount_settings'),
    update: (data) => apiClient.patch('/api/v1/discount_settings', { settings: data }),
  },

  // DM Templates
  dmTemplates: {
    list: () => apiClient.get('/api/v1/dm_templates'),
    get: (id) => apiClient.get(`/api/v1/dm_templates/${id}`),
    create: (data) => apiClient.post('/api/v1/dm_templates', { template: data }),
    update: (id, data) => apiClient.patch(`/api/v1/dm_templates/${id}`, { template: data }),
    delete: (id) => apiClient.delete(`/api/v1/dm_templates/${id}`),
    duplicate: (id) => apiClient.post(`/api/v1/dm_templates/${id}/duplicate`),
  },

  // Verification
  verification: {
    check: (code) => apiClient.get('/api/v1/verification/check', { params: { code } }),
    redeem: (code) => apiClient.post('/api/v1/verification/redeem', { code }),
  },

  // OAuth
  oauth: {
    getGoogleAuthUrl: () => `${API_BASE_URL}/auth/google_oauth2`,
    getInstagramAuthUrl: () => `${API_BASE_URL}/instagram/connect`, // Direct Instagram OAuth
  },

  // Social connections
  social: {
    getStatus: () => apiClient.get('/api/v1/social/status'),
    disconnect: (provider) => apiClient.delete(`/api/v1/social/${provider}`),
  },
}

export default apiClient
