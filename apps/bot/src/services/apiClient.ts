import axios from 'axios';

// Validate BOT_API_SECRET in production
const BOT_API_SECRET = process.env.BOT_API_SECRET;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'production' && !BOT_API_SECRET) {
  console.error('❌ FATAL: BOT_API_SECRET is required in production mode');
  console.error('   Please set the BOT_API_SECRET environment variable');
  process.exit(1);
}

if (!BOT_API_SECRET) {
  console.warn('⚠️  BOT_API_SECRET not set - using default "bot" token (development only)');
}

export const apiClient = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:4000',
  timeout: 10000, // 10s timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header for bot-to-API authentication
apiClient.interceptors.request.use(config => {
  // Use secret if configured, fallback to 'bot' only in development
  config.headers['X-Bot-Token'] = BOT_API_SECRET || 'bot';
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
