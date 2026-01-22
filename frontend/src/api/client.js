import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const translationAPI = {
  /**
   * Start a new naming session
   */
  startSession: async (chineseName, customPrompt = null) => {
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
    const response = await apiClient.post(`/sessions/${sessionId}/messages`, {
      message,
    });
    return response.data.data;
  },

  /**
   * Get session details
   */
  getSession: async (sessionId) => {
    const response = await apiClient.get(`/sessions/${sessionId}`);
    return response.data.data;
  },

  /**
   * Clear a session
   */
  clearSession: async (sessionId) => {
    await apiClient.delete(`/sessions/${sessionId}`);
  },

  /**
   * Get current default prompt
   */
  getPrompt: async () => {
    const response = await apiClient.get('/prompt');
    return response.data.data.prompt;
  },

  /**
   * Update default prompt
   */
  updatePrompt: async (newPrompt) => {
    const response = await apiClient.post('/prompt', {
      prompt: newPrompt,
    });
    return response.data.data.prompt;
  },
};

export default apiClient;
