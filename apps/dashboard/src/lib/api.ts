import axios from 'axios';
import { getSession } from 'next-auth/react';

import type { ExportData } from './types';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth and server headers
api.interceptors.request.use(async (config) => {
  // Get server ID from localStorage
  const serverId = typeof window !== 'undefined'
    ? localStorage.getItem('selectedServerId')
    : null;

  if (serverId) {
    config.headers['X-Server-Id'] = serverId;
  }

  // Get session token for authentication
  if (typeof window !== 'undefined') {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
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

// API functions
export const articlesApi = {
  getAll: (params?: { categoryId?: string; published?: boolean; page?: number; limit?: number }) =>
    api.get('/api/v1/articles', { params }),
  getBySlug: (slug: string) => api.get(`/api/v1/articles/${slug}`),
  create: (data: { title: string; content: string; categorySlug?: string }) =>
    api.post('/api/v1/articles', data),
  update: (slug: string, data: { title?: string; content?: string; published?: boolean }) =>
    api.put(`/api/v1/articles/${slug}`, data),
  delete: (slug: string) => api.delete(`/api/v1/articles/${slug}`),
};

export const categoriesApi = {
  getAll: () => api.get('/api/v1/categories'),
  create: (data: { name: string; slug: string; description?: string; emoji?: string }) =>
    api.post('/api/v1/categories', data),
  update: (slug: string, data: { name?: string; description?: string; emoji?: string }) =>
    api.put(`/api/v1/categories/${slug}`, data),
  delete: (slug: string) => api.delete(`/api/v1/categories/${slug}`),
};

export const analyticsApi = {
  getOverview: () => api.get('/api/v1/analytics/overview'),
  getTopArticles: (limit?: number) =>
    api.get('/api/v1/analytics/top-articles', { params: { limit } }),
  getTopSearches: (limit?: number) =>
    api.get('/api/v1/analytics/top-searches', { params: { limit } }),
  getActivity: (days?: number) =>
    api.get('/api/v1/analytics/activity', { params: { days } }),
};

export const searchApi = {
  search: (query: string, type: 'fulltext' | 'semantic' = 'fulltext') =>
    api.get('/api/v1/search', { params: { q: query, type } }),
};

export const subscriptionsApi = {
  getStatus: () => api.get('/api/v1/subscriptions/status'),
  getUsage: () => api.get('/api/v1/subscriptions/usage'),
  getPlans: () => api.get('/api/v1/subscriptions/plans'),
  createCheckout: (data: {
    tier: 'premium' | 'pro';
    successUrl: string;
    cancelUrl: string;
    email?: string;
  }) => api.post('/api/v1/subscriptions/checkout', data),
  createPortal: (data: { returnUrl: string }) =>
    api.post('/api/v1/subscriptions/portal', data),
  cancel: (immediate?: boolean) =>
    api.post('/api/v1/subscriptions/cancel', { immediate }),
};

export const settingsApi = {
  get: () => api.get('/api/v1/settings'),
  update: (data: {
    brandColor?: string;
    logoUrl?: string | null;
    publicWebview?: boolean;
    aiSearchEnabled?: boolean;
    analyticsEnabled?: boolean;
    searchLoggingEnabled?: boolean;
    moderationEnabled?: boolean;
    fastIndexingEnabled?: boolean;
  }) => api.put('/api/v1/settings', data),
  getLogoUploadUrl: (filename: string, contentType: string) =>
    api.post('/api/v1/settings/logo/upload-url', { filename, contentType }),
  deleteLogo: () => api.delete('/api/v1/settings/logo'),
};

export const exportApi = {
  exportJson: () => api.get('/api/v1/export/json'),
  exportMarkdown: () => api.get('/api/v1/export/markdown', { responseType: 'blob' }),
  importJson: (data: ExportData, options?: { overwriteExisting?: boolean; importCategories?: boolean }) =>
    api.post('/api/v1/export/import', { data, ...options }),
  validate: (data: ExportData) => api.post('/api/v1/export/validate', { data }),
};

export const membersApi = {
  getAll: () => api.get('/api/v1/members'),
  getMe: () => api.get('/api/v1/members/me'),
  getById: (userId: string) => api.get(`/api/v1/members/${userId}`),
  add: (data: {
    userId: string;
    role?: 'admin' | 'editor' | 'viewer';
    username?: string;
    discriminator?: string;
    avatar?: string;
  }) => api.post('/api/v1/members', data),
  updateRole: (userId: string, role: 'admin' | 'editor' | 'viewer') =>
    api.put(`/api/v1/members/${userId}/role`, { role }),
  remove: (userId: string) => api.delete(`/api/v1/members/${userId}`),
  transferOwnership: (newOwnerId: string) =>
    api.post('/api/v1/members/transfer-ownership', { newOwnerId }),
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
  }) => api.get('/api/v1/audit-logs', { params }),
  getById: (logId: string) => api.get(`/api/v1/audit-logs/${logId}`),
};
