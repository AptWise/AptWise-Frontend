/**
 * API service for handling backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for JWT
      ...options,
    };

    console.log(`Making API request: ${config.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, config);
      
      console.log(`API response status: ${response.status} for ${url}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`API error for ${url}:`, errorData);
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`API success for ${url}:`, data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async createAccount(userData) {
    return this.request('/auth/create-account', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    try {
      return await this.request('/auth/me');
    } catch (error) {
      // Handle authentication errors gracefully
      if (error.message.includes('Not authenticated') || 
          error.message.includes('401') ||
          error.message.includes('User not found')) {
        // User is not logged in, return null instead of throwing
        return null;
      }
      throw error;
    }
  }

  async getUserSkills() {
    return this.request('/auth/skills');
  }

  // User profile management
  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updatePassword(passwordData) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async addSkill(skillData) {
    return this.request('/auth/skills', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  async removeSkill(skillData) {
    return this.request('/auth/skills', {
      method: 'DELETE',
      body: JSON.stringify(skillData),
    });
  }

  // LinkedIn OAuth endpoints
  async getLinkedInAuthUrl() {
    return this.request('/auth/linkedin/authorize');
  }

  async handleLinkedInCallback(code, state) {
    return this.request('/auth/linkedin/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
  }

  async connectLinkedIn(code, state) {
    return this.request('/auth/linkedin/connect', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
  }

  async disconnectLinkedIn() {
    return this.request('/auth/linkedin/disconnect', {
      method: 'DELETE',
    });
  }

  // GitHub OAuth endpoints
  async getGitHubAuthUrl() {
    return this.request('/auth/github/authorize');
  }

  async handleGitHubCallback(code, state) {
    return this.request('/auth/github/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
  }

  async connectGitHub(code, state) {
    return this.request('/auth/github/connect', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
  }

  async disconnectGitHub() {
    return this.request('/auth/github/disconnect', {
      method: 'POST',
    });
  }

  // OAuth profile endpoints for registration (don't create users)
  async getLinkedInProfileForRegistration(code, state) {
    return this.request('/auth/linkedin/profile', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
  }

  async getGitHubProfileForRegistration(code, state) {
    return this.request('/auth/github/profile', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
  }

  // Interview presets endpoints
  async getUserInterviewPresets() {
    return this.request('/interview/presets', {
      method: 'GET',
    });
  }

  async createInterviewPreset(presetData) {
    return this.request('/interview/presets', {
      method: 'POST',
      body: JSON.stringify(presetData),
    });
  }

  async deleteInterviewPreset(presetId) {
    return this.request(`/interview/presets/${presetId}`, {
      method: 'DELETE',
    });
  }

  async generateInterviewQuestion(requestData) {
    return this.request('/interview/generate-question', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async generateInterviewPreset(requestData) {
    return this.request('/interview/generate-preset', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // Interview ending and evaluation endpoints
  async endInterview(chatData) {
    return this.request('/api/interview/end', {
      method: 'POST',
      body: JSON.stringify(chatData),
    });
  }

  async getChatHistory() {
    return this.request('/api/chats', {
      method: 'GET',
    });
  }

  async getChatTranscript(chatId) {
    return this.request(`/api/chats/${chatId}`, {
      method: 'GET',
    });
  }

  async getEvaluation(chatId) {
    return this.request(`/api/evaluation/${chatId}`, {
      method: 'GET',
    });
  }

  // Interview endpoints
  async saveInterview(interviewData) {
    return this.request('/auth/interviews', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    });
  }

  async getUserInterviews() {
    return this.request('/auth/interviews', {
      method: 'GET',
    });
  }

  async getInterviewById(interviewId) {
    return this.request(`/auth/interviews/${interviewId}`, {
      method: 'GET',
    });
  }

  async deleteInterview(interviewId) {
    return this.request(`/auth/interviews/${interviewId}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
