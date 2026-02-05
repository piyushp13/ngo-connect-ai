import axios from 'axios';

const normalizeBase = (value) => value.replace(/\/+$/, '');
const envApiUrl = process.env.REACT_APP_API_URL;
const LOCAL_API_URL = 'http://localhost:5001/api';
const API_URL = normalizeBase(envApiUrl || LOCAL_API_URL);

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    // Retry once if API base path is misconfigured (with/without /api or missing proxy)
    const { config, response } = error || {};
    if (response && response.status === 404 && config && !config.__retriedApiBase) {
      const currentBase = config.baseURL || api.defaults.baseURL || '';
      const candidates = [];
      if (currentBase.startsWith('/')) {
        candidates.push(LOCAL_API_URL);
      } else if (currentBase) {
        candidates.push('/api');
      }
      if (currentBase.endsWith('/api')) {
        candidates.push(currentBase.slice(0, -4));
      } else if (currentBase) {
        candidates.push(`${currentBase}/api`);
      }
      const nextBase = candidates.find(base => base && base !== currentBase);
      if (nextBase) {
        config.__retriedApiBase = true;
        config.baseURL = nextBase;
        return api.request(config);
      }
    }
    if (
      error.response &&
      (error.response.status === 401 ||
        (error.response.status === 404 &&
          error.response.data &&
          error.response.data.message === 'User not found'))
    ) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('authChange'));
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Volunteer opportunities
export const getVolunteerOpportunities = (params = {}) => api.get('/volunteering', { params });
export const getMyVolunteerOpportunities = () => api.get('/volunteering/my');
export const getNgoVolunteerOpportunities = (ngoId) => api.get(`/volunteering/ngo/${ngoId}`);
export const createVolunteerOpportunity = (data) => api.post('/volunteering', data);
export const applyToVolunteer = (id) => api.post(`/volunteering/${id}/apply`);
export const withdrawVolunteerApplication = (id) => api.delete(`/volunteering/${id}/withdraw`);
export const deleteVolunteerOpportunity = (id) => api.delete(`/volunteering/${id}`);

// User preferences for AI recommendations
export const getUserPreferences = () => api.get('/users/preferences');
export const updateUserPreferences = (data) => api.put('/users/preferences', data);

// AI Recommendations
export const getAIRecommendations = () => api.get('/ai/recommendations');

export default api;
