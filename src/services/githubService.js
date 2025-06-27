/**
 * GitHub OAuth service for handling authentication flow
 */
import apiService from './api.js';

class GitHubService {
  constructor() {
    this.authWindow = null;
  }

  /**
   * Initiate GitHub OAuth flow
   * @param {boolean} isRegistration - Whether this is for registration or login
   * @returns {Promise} - Resolves with user data on success
   */
  async authenticate(isRegistration = false) {
    try {
      // Get authorization URL from backend
      const authData = await apiService.getGitHubAuthUrl();
      
      return new Promise((resolve, reject) => {
        // Track if message was received to prevent window close error
        let messageReceived = false;
        
        // Open GitHub auth window
        this.authWindow = window.open(
          authData.authorization_url,
          'github_auth',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for the callback
        const messageListener = async (event) => {
          // Verify origin for security
          if (event.origin !== window.location.origin) {
            return;
          }

          if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
            messageReceived = true;
            window.removeEventListener('message', messageListener);
            
            try {
              // For registration, use profile endpoint that doesn't create user
              // For login, use callback endpoint that creates/logs in user
              let result;
              if (isRegistration) {
                result = await apiService.getGitHubProfileForRegistration(
                  event.data.code,
                  event.data.state
                );
                result.isNewUser = true;
                result.isLinkedAccount = false;
              } else {
                result = await apiService.handleGitHubCallback(
                  event.data.code,
                  event.data.state
                );
                result.isNewUser = !result.user?.id;
                result.isLinkedAccount = !!result.user?.id;
              }
              
              this.authWindow?.close();
              resolve(result);
            } catch (error) {
              this.authWindow?.close();
              reject(error);
            }
          } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
            messageReceived = true;
            window.removeEventListener('message', messageListener);
            this.authWindow?.close();
            reject(new Error(event.data.error || 'GitHub authentication failed'));
          }
        };

        window.addEventListener('message', messageListener);

        // Handle window closed manually
        const checkClosed = setInterval(() => {
          if (this.authWindow?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            // Only reject if no message was received
            if (!messageReceived) {
              reject(new Error('Authentication window was closed'));
            }
          }
        }, 1000);
      });
    } catch (error) {
      console.error('GitHub authentication error:', error);
      throw error;
    }
  }

  /**
   * Connect GitHub to existing account
   * @returns {Promise} - Resolves with connection status
   */
  async connect() {
    try {
      // Get authorization URL from backend
      const authData = await apiService.getGitHubAuthUrl();
      
      return new Promise((resolve, reject) => {
        // Track if message was received to prevent window close error
        let messageReceived = false;
        
        // Open GitHub auth window
        this.authWindow = window.open(
          authData.authorization_url,
          'github_connect',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for the callback
        const messageListener = async (event) => {
          // Verify origin for security
          if (event.origin !== window.location.origin) {
            return;
          }

          if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
            messageReceived = true;
            window.removeEventListener('message', messageListener);
            
            try {
              // Connect GitHub to existing account
              const result = await apiService.connectGitHub(
                event.data.code,
                event.data.state
              );
              
              this.authWindow?.close();
              resolve(result);
            } catch (error) {
              this.authWindow?.close();
              reject(error);
            }
          } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
            messageReceived = true;
            window.removeEventListener('message', messageListener);
            this.authWindow?.close();
            reject(new Error(event.data.error || 'GitHub authentication failed'));
          }
        };

        window.addEventListener('message', messageListener);

        // Handle window closed manually
        const checkClosed = setInterval(() => {
          if (this.authWindow?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            // Only reject if no message was received
            if (!messageReceived) {
              reject(new Error('Connection window was closed'));
            }
          }
        }, 1000);
      });
    } catch (error) {
      console.error('GitHub connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect GitHub from account
   * @returns {Promise} - Resolves with disconnection status
   */
  async disconnect() {
    try {
      const result = await apiService.disconnectGitHub();
      return result;
    } catch (error) {
      console.error('GitHub disconnection error:', error);
      throw error;
    }
  }
}

export default new GitHubService();
