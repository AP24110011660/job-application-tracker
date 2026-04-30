import axios from 'axios';

// In dev: baseURL='/api' is proxied to VITE_API_BASE_URL by Vite.
// In production: requests go directly to the backend via VITE_API_BASE_URL/api.
const isProd = import.meta.env.PROD;
const baseURL = isProd
  ? `${import.meta.env.VITE_API_BASE_URL || ''}/api`
  : '/api';

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15s global timeout — prevents hanging requests in production
});

// Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jobflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — auto-logout and redirect to login on token expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('jobflow_token');
      localStorage.removeItem('jobflow_user');

      // Dynamically import toast to avoid circular dependency issues
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error('Your session has expired. Please log in again.', {
          id: 'session-expired',
          duration: 4000,
        });
      });

      setTimeout(() => {
        window.location.href = '/login';
      }, 1000); // Small delay so the toast is visible before redirect
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Jobs API calls
export const jobsAPI = {
  getAll: (params) => API.get('/jobs', { params }),
  create: (data) => API.post('/jobs', data),
  update: (id, data) => API.put(`/jobs/${id}`, data),
  remove: (id) => API.delete(`/jobs/${id}`),
};

export default API;
