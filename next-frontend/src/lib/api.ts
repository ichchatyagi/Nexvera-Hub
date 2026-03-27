import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check for token in storage or cookie
    const token = getCookie('access_token') || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh / expired tokens
api.interceptors.response.use(
  (response) => {
    // If backend returns a {success: true, data: ...} wrapper, 
    // we want to return response.data.data for convenience in components
    // Note: We check if it's already unwrapped by seeing if success field exists
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      return {
        ...response,
        data: response.data.data
      };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getCookie('refresh_token') || (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null);
        if (refreshToken) {
          // Send as refreshToken (camelCase) as backend expects
          const resp = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken: refreshToken });
          
          // NestJS returns tokens under data envelope
          const { accessToken, refreshToken: newRefreshToken } = resp.data.data;
          
          setCookie('access_token', accessToken);
          setCookie('refresh_token', newRefreshToken);
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', newRefreshToken);
          }
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, clear everything and redirect to login
        deleteCookie('access_token');
        deleteCookie('refresh_token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
