import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/admin/login')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('craftech_admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: any) => api.post('/admin/login', data),
  getMe: () => api.get('/admin/me'),
  getStats: () => api.get('/admin/stats'),
  changePassword: (data: any) => api.patch('/admin/change-password', data),
};

// ── Projects ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  getAll: (params?: any) => api.get('/projects', { params }),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addImages: (id: string, data: any) => api.post(`/projects/${id}/images`, data),
  removeImage: (id: string, imageIndex: number) => api.delete(`/projects/${id}/images/${imageIndex}`),
  addVideo: (id: string, data: any) => api.post(`/projects/${id}/videos`, data),
  removeVideo: (id: string, videoId: string) => api.delete(`/projects/${id}/videos/${videoId}`),
};

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadApi = {
  images: (slug: string, formData: FormData, onProgress?: any) =>
    api.post(`/upload/${slug}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  video: (slug: string, formData: FormData, onProgress?: any) =>
    api.post(`/upload/${slug}/video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  thumbnail: (slug: string, formData: FormData, onProgress?: any) =>
    api.post(`/upload/${slug}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  highlightVideo: (formData: FormData, onProgress?: any) =>
    api.post('/upload/highlights/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  logo: (formData: FormData, onProgress?: any) =>
    api.post('/upload/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  highlightThumbnail: (formData: FormData, onProgress?: any) =>
    api.post('/upload/highlights/thumbnail', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
};

// ── Content ───────────────────────────────────────────────────────────────────
export const contentApi = {
  getPillars: () => api.get('/content/pillars'),
  createPillar: (data: any) => api.post('/content/pillars', data),
  updatePillar: (id: string, data: any) => api.put(`/content/pillars/${id}`, data),
  deletePillar: (id: string) => api.delete(`/content/pillars/${id}`),

  getServices: () => api.get('/content/services'),
  createService: (data: any) => api.post('/content/services', data),
  updateService: (id: string, data: any) => api.put(`/content/services/${id}`, data),
  deleteService: (id: string) => api.delete(`/content/services/${id}`),

  getHighlightVideos: () => api.get('/content/highlight-videos'),
  createHighlightVideo: (data: any) => api.post('/content/highlight-videos', data),
  updateHighlightVideo: (id: string, data: any) => api.put(`/content/highlight-videos/${id}`, data),
  deleteHighlightVideo: (id: string) => api.delete(`/content/highlight-videos/${id}`),
};

// ── CMS ───────────────────────────────────────────────────────────────────────
export const cmsApi = {
  getHome: () => api.get('/cms/home'),
  updateHome: (data: any) => api.put('/cms/home', data),

  getSettings: () => api.get('/cms/settings'),
  updateSettings: (data: any) => api.put('/cms/settings', data),
  getThemeOptions: () => api.get('/cms/theme/options'),

  getTestimonials: () => api.get('/cms/testimonials'),
  createTestimonial: (data: any) => api.post('/cms/testimonials', data),
  updateTestimonial: (id: string, data: any) => api.put(`/cms/testimonials/${id}`, data),
  deleteTestimonial: (id: string) => api.delete(`/cms/testimonials/${id}`),

  getClients: () => api.get('/cms/clients'),
  createClient: (data: any) => api.post('/cms/clients', data),
  updateClient: (id: string, data: any) => api.put(`/cms/clients/${id}`, data),
  deleteClient: (id: string) => api.delete(`/cms/clients/${id}`),

  getLeads: () => api.get('/cms/leads'),
  getLeadsByStatus: () => api.get('/cms/leads/board/status'),
  createLead: (data: any) => api.post('/cms/leads', data),
  getProcessSteps: () => api.get('/cms/process-steps'),
  createProcessStep: (data: any) => api.post('/cms/process-steps', data),
  updateProcessStep: (id: string, data: any) => api.put(`/cms/process-steps/${id}`, data),
  deleteProcessStep: (id: string) => api.delete(`/cms/process-steps/${id}`),

  getWhyFeatures: () => api.get('/cms/why-features'),
  createWhyFeature: (data: any) => api.post('/cms/why-features', data),
  updateWhyFeature: (id: string, data: any) => api.put(`/cms/why-features/${id}`, data),
  deleteWhyFeature: (id: string) => api.delete(`/cms/why-features/${id}`),
  updateLead: (id: string, data: any) => api.put(`/cms/leads/${id}`, data),
  deleteLead: (id: string) => api.delete(`/cms/leads/${id}`),

  getCTAs: () => api.get('/cms/ctas'),
  getCTABySection: (section: string) => api.get(`/cms/ctas/${section}`),
  createCTA: (data: any) => api.post('/cms/ctas', data),
  updateCTA: (id: string, data: any) => api.put(`/cms/ctas/${id}`, data),
  deleteCTA: (id: string) => api.delete(`/cms/ctas/${id}`),
};

// ── Appearance (Layout & Appearance domain — separate from General Settings) ──
export const appearanceApi = {
  get: () => api.get('/cms/appearance'),
  update: (data: any) => api.put('/cms/appearance', data),
};

// ── Blog ────────────────────────────────────────────────────────────────────
export const blogApi = {
  list: (params?: any) => api.get('/cms/blog', { params }),                 // page, limit, category, search
  getBySlug: (slug: string) => api.get(`/cms/blog/${slug}`),
  getRelated: (id: string) => api.get(`/cms/blog/related/${id}`),
  getByCategory: (cat: string, params?: any) => api.get(`/cms/blog/category/${cat}`, { params }),
  adminList: () => api.get('/cms/blog/admin/list'),
  adminGetById: (id: string) => api.get(`/cms/blog/admin/${id}`),
  create: (data: any) => api.post('/cms/blog', data),
  update: (id: string, data: any) => api.put(`/cms/blog/${id}`, data),
  remove: (id: string) => api.delete(`/cms/blog/${id}`),
};

// ── FAQ ─────────────────────────────────────────────────────────────────────
export const faqApi = {
  list: (params?: any) => api.get('/cms/faq', { params }),                  // category, search, featured
  getById: (id: string) => api.get(`/cms/faq/${id}`),
  getByCategory: (cat: string) => api.get(`/cms/faq/category/${cat}`),
  adminList: () => api.get('/cms/faq/admin/list'),
  create: (data: any) => api.post('/cms/faq', data),
  update: (id: string, data: any) => api.put(`/cms/faq/${id}`, data),
  remove: (id: string) => api.delete(`/cms/faq/${id}`),
  vote: (id: string, v: 'yes' | 'no') => api.post(`/cms/faq/${id}/helpful/${v}`),
};

// ── Team ────────────────────────────────────────────────────────────────────
export const teamApi = {
  list: (params?: any) => api.get('/cms/team', { params }),                 // department, featured
  getById: (id: string) => api.get(`/cms/team/${id}`),
  getByDepartment: (dep: string) => api.get(`/cms/team/department/${dep}`),
  adminList: () => api.get('/cms/team/admin/list'),
  create: (data: any) => api.post('/cms/team', data),
  update: (id: string, data: any) => api.put(`/cms/team/${id}`, data),
  remove: (id: string) => api.delete(`/cms/team/${id}`),
};

// ── Media Library ───────────────────────────────────────────────────────────
export const mediaApi = {
  list: (params?: any) => api.get('/cms/media', { params }),                // category, type, tags, search, featured, limit, page
  getById: (id: string) => api.get(`/cms/media/${id}`),
  getByCategory: (cat: string, params?: any) => api.get(`/cms/media/category/${cat}`, { params }),
  create: (data: any) => api.post('/cms/media', data),
  update: (id: string, data: any) => api.put(`/cms/media/${id}`, data),
  remove: (id: string) => api.delete(`/cms/media/${id}`),
  trackDownload: (id: string) => api.post(`/cms/media/${id}/download`),
};

// ── Analytics ───────────────────────────────────────────────────────────────
export const analyticsApi = {
  summary: () => api.get('/cms/analytics/summary'),
  funnel: (params?: any) => api.get('/cms/analytics/funnel', { params }),           // startDate, endDate
  sources: (params?: any) => api.get('/cms/analytics/sources', { params }),
  conversionBySource: (params?: any) => api.get('/cms/analytics/conversion-by-source', { params }),
  responseTime: (params?: any) => api.get('/cms/analytics/response-time', { params }),
  statusDistribution: (params?: any) => api.get('/cms/analytics/status-distribution', { params }),
  exportCsv: (params?: any) => api.get('/cms/analytics/export', { params, responseType: 'blob' }),
};
