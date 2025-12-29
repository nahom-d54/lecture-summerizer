import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; data: { userId: string; email: string; token: string } }>(
      '/auth/login',
      {
        email,
        password,
      }
    ),
  register: (email: string, password: string) =>
    api.post<{ success: boolean; data: { userId: string; email: string; token: string } }>(
      '/auth/register',
      {
        email,
        password,
      }
    ),
  logout: () => api.post('/auth/logout'),
};

// Recordings API
export const recordingsApi = {
  list: (params?: { search?: string; status?: string }) => api.get('/recordings', { params }),
  get: (id: string) => api.get(`/recordings/${id}`),
  upload: (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/recordings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / (e.total || 1))),
    });
  },
  getStatus: (id: string) => api.get(`/recordings/${id}/status`),
  delete: (id: string) => api.delete(`/recordings/${id}`),
  export: (id: string, format: 'pdf' | 'txt' | 'docx') =>
    api.get(`/recordings/${id}/export`, { params: { format }, responseType: 'blob' }),
  updateActionItem: (recordingId: string, actionItemId: string, completed: boolean) =>
    api.patch(`/recordings/${recordingId}/action-items/${actionItemId}`, { completed }),
};

export default api;
