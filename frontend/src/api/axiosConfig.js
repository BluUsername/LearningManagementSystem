import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

/**
 * Helper to extract results from paginated or non-paginated API responses.
 * DRF pagination wraps results in { count, next, previous, results }.
 * This helper returns the array regardless of format.
 */
export function getResults(responseData) {
  if (Array.isArray(responseData)) {
    return responseData;
  }
  if (responseData && Array.isArray(responseData.results)) {
    return responseData.results;
  }
  return [];
}

export default api;
