import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    const customerToken = useAuthStore.getState().token;
    const token = adminToken || customerToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      
      if (isAdminRoute && window.location.pathname !== '/admin/login') {
        // Admin: always redirect to admin login
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else if (!isAdminRoute) {
        // Customer: only redirect to login if they truly have no token
        // (don't kick them out if they're mid-page and a background request fails)
        const customerToken = useAuthStore.getState().token;
        const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
        if (!customerToken && !isAuthPage) {
          window.location.href = '/login';
        }
        // If they have a token but got a 401, let the component handle it gracefully
      }
    }
    return Promise.reject(error);
  }
);

export default api;
