import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:4000',
  timeout: 10000, // 10s timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header for bot-to-API authentication
apiClient.interceptors.request.use(config => {
  // Always send bot token header (use secret if configured, otherwise 'bot')
  config.headers['X-Bot-Token'] = process.env.BOT_API_SECRET || 'bot';
  return config;
});

// Handle response errors globally
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ API server is not reachable');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('❌ API request timed out');
    }
    return Promise.reject(error);
  }
);
