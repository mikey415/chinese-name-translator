import axios from 'axios';

// Detect if user is accessing from mainland China
async function isMainlandChina() {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    const data = await response.json();
    return data.country_code === 'CN';
  } catch (error) {
    console.log('Could not determine location, using default backend');
    return false;
  }
}

// Get appropriate API URL based on user location
async function getApiUrl() {
  // Check environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const isChina = await isMainlandChina();

  if (isChina) {
    // Mainland China: use Alibaba Cloud backend
    return 'https://172.17.9.217:5000/api'; // TODO: Replace with your Alibaba domain
  } else {
    // International: use Railway/Vercel backend
    return 'https://chinese-name-translator-production.up.railway.app/api';
  }
}

// Create axios instance with dynamic baseURL
let apiClient = axios.create({
  timeout: 30000,
});

// Initialize baseURL on first use
let baseUrlPromise = getApiUrl().then((url) => {
  apiClient.defaults.baseURL = url;
  console.log('API Base URL:', url);
  return url;
});

export const translationAPI = {
  /**
   * Start a new naming session
   */
  startSession: async (chineseName, customPrompt = null) => {
    await baseUrlPromise;
    const response = await apiClient.post('/sessions', {
      chineseName,
      customPrompt,
    });
    return response.data.data;
  },

  /**
   * Continue a conversation in a session
   */
  continueSession: async (sessionId, message) => {
    await baseUrlPromise;
    const response = await apiClient.post(`/sessions/${sessionId}/messages`, {
      message,
    });
    return response.data.data;
  },

  /**
   * Get session details
   */
  getSession: async (sessionId) => {
    await baseUrlPromise;
    const response = await apiClient.get(`/sessions/${sessionId}`);
    return response.data.data;
  },

  /**
   * Clear a session
   */
  clearSession: async (sessionId) => {
    await baseUrlPromise;
    await apiClient.delete(`/sessions/${sessionId}`);
  },

  /**
   * Get current default prompt
   */
  getPrompt: async () => {
    await baseUrlPromise;
    const response = await apiClient.get('/prompt');
    return response.data.data.prompt;
  },

  /**
   * Update default prompt
   */
  updatePrompt: async (newPrompt) => {
    await baseUrlPromise;
    const response = await apiClient.post('/prompt', {
      prompt: newPrompt,
    });
    return response.data.data.prompt;
  },
};

export default apiClient;
