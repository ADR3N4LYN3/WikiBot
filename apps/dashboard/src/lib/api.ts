import axios from 'axios';

import type { ExportData } from './types';

// Use internal proxy for all API requests (handles JWT auth)
export const api = axios.create({
  baseURL: '/api/proxy',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add server ID header
api.interceptors.request.use((config) => {
  // Get server ID from localStorage
  const serverId = typeof window !== 'undefined'
    ? localStorage.getItem('selectedServerId')
    : null;

  if (serverId) {
    config.headers['X-Server-Id'] = serverId;
  }

  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// API functions - all routes go through /api/proxy which handles JWT auth
export const articlesApi = {
  getAll: (params?: { categoryId?: string; published?: boolean; page?: number; limit?: number }) =>
    api.get('/articles', { params }),
  getBySlug: (slug: string) => api.get(`/articles/${slug}`),
  create: (data: { title: string; content: string; categorySlug?: string }) =>
    api.post('/articles', data),
  update: (slug: string, data: { title?: string; content?: string; published?: boolean }) =>
    api.put(`/articles/${slug}`, data),
  delete: (slug: string) => api.delete(`/articles/${slug}`),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data: { name: string; slug: string; description?: string; emoji?: string }) =>
    api.post('/categories', data),
  update: (slug: string, data: { name?: string; description?: string; emoji?: string }) =>
    api.put(`/categories/${slug}`, data),
  delete: (slug: string) => api.delete(`/categories/${slug}`),
};

export const analyticsApi = {
  getOverview: () => api.get('/analytics/overview'),
  getTopArticles: (limit?: number) =>
    api.get('/analytics/top-articles', { params: { limit } }),
  getTopSearches: (limit?: number) =>
    api.get('/analytics/top-searches', { params: { limit } }),
  getActivity: (days?: number) =>
    api.get('/analytics/activity', { params: { days } }),
};

export const searchApi = {
  search: (query: string, type: 'fulltext' | 'semantic' = 'fulltext') =>
    api.get('/search', { params: { q: query, type } }),
};

export const subscriptionsApi = {
  getStatus: () => api.get('/subscriptions/status'),
  getUsage: () => api.get('/subscriptions/usage'),
  getPlans: () => api.get('/subscriptions/plans'),
  createCheckout: (data: {
    tier: 'premium' | 'pro';
    successUrl: string;
    cancelUrl: string;
    email?: string;
  }) => api.post('/subscriptions/checkout', data),
  createPortal: (data: { returnUrl: string }) =>
    api.post('/subscriptions/portal', data),
  cancel: (immediate?: boolean) =>
    api.post('/subscriptions/cancel', { immediate }),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: {
    brandColor?: string;
    logoUrl?: string | null;
    publicWebview?: boolean;
    aiSearchEnabled?: boolean;
    analyticsEnabled?: boolean;
    searchLoggingEnabled?: boolean;
    moderationEnabled?: boolean;
    fastIndexingEnabled?: boolean;
  }) => api.put('/settings', data),
  getLogoUploadUrl: (filename: string, contentType: string) =>
    api.post('/settings/logo/upload-url', { filename, contentType }),
  deleteLogo: () => api.delete('/settings/logo'),
};

export const exportApi = {
  exportJson: () => api.get('/export/json'),
  exportMarkdown: () => api.get('/export/markdown', { responseType: 'blob' }),
  importJson: (data: ExportData, options?: { overwriteExisting?: boolean; importCategories?: boolean }) =>
    api.post('/export/import', { data, ...options }),
  validate: (data: ExportData) => api.post('/export/validate', { data }),
};

export const membersApi = {
  getAll: () => api.get('/members'),
  getMe: () => api.get('/members/me'),
  getById: (userId: string) => api.get(`/members/${userId}`),
  add: (data: {
    userId: string;
    role?: 'admin' | 'editor' | 'viewer';
    username?: string;
    discriminator?: string;
    avatar?: string;
  }) => api.post('/members', data),
  updateRole: (userId: string, role: 'admin' | 'editor' | 'viewer') =>
    api.put(`/members/${userId}/role`, { role }),
  remove: (userId: string) => api.delete(`/members/${userId}`),
  transferOwnership: (newOwnerId: string) =>
    api.post('/members/transfer-ownership', { newOwnerId }),
};

export const auditLogsApi = {
  getAll: (params?: {
    limit?: number;
    offset?: number;
    entityType?: 'article' | 'category' | 'settings' | 'member';
    action?: string;
    actorId?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/audit-logs', { params }),
  getById: (logId: string) => api.get(`/audit-logs/${logId}`),
};

export const permissionsApi = {
  getAll: () => api.get('/permissions'),
  getMe: () => api.get('/permissions/me'),
  getByUserId: (userId: string) => api.get(`/permissions/${userId}`),
  update: (userId: string, overrides: Record<string, boolean | null>) =>
    api.put(`/permissions/${userId}`, { overrides }),
  reset: (userId: string) => api.delete(`/permissions/${userId}`),
};
