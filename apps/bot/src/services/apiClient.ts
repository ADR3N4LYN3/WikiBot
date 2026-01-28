import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header if needed
apiClient.interceptors.request.use(config => {
  // TODO: Add bot authentication token
  return config;
});
