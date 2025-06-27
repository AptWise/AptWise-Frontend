/**
 * LinkedIn OAuth service for handling authentication flow
 */
import apiService from './api.js';

class LinkedInService {
  constructor() {
    this.authWindow = null;
  }

  /**
   * Initiate LinkedIn OAuth flow
   * @param {boolean} isRegistration - Whether this is for registration or login
   * @returns {Promise} - Resolves with user data on success
   */
  async authenticate(isRegistration = false) {
    try {
      // Get authorization URL from backend
      const authData = await apiService.getLinkedInAuthUrl();
      
      return new Promise((resolve, reject) => {
        // Track if message was received to prevent window close error
        let messageReceived = false;
        
        // Open LinkedIn auth window
        this.authWindow = window.open(
          authData.authorization_url,
          'linkedin_auth',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for the callback
        const messageListener = async (event) => {
          // Verify origin for security
          if (event.origin !== window.location.origin) {
            return;
          }

          if (event.data.type === 'LINKEDIN_AUTH_SUCCESS') {
            messageReceived = true;
            window.removeEventListener('message', messageListener);
            
            try {
              // For registration, use profile endpoint that doesn't create user
              // For login, use callback endpoint that creates/logs in user
              let result;
              if (isRegistration) {
                result = await apiService.getLinkedInProfileForRegistration(
                  event.data.code,
                  event.data.state
                );
                result.isNewUser = true;
                result.isLinkedAccount = false;
              } else {
                result = await apiService.handleLinkedInCallback(
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
          } else if (event.data.type === 'LINKEDIN_AUTH_ERROR') {
            messageReceived = true;
            window.removeEventListener('message', messageListener);
            this.authWindow?.close();
            reject(new Error(event.data.error || 'LinkedIn authentication failed'));
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
      console.error('LinkedIn authentication error:', error);
      throw error;
    }
  }

  /**
   * Connect LinkedIn to existing account
   * @returns {Promise} - Resolves with connection status
   */
  async connect() {
    try {
      const authData = await apiService.getLinkedInAuthUrl();
      
      return new Promise((resolve, reject) => {
        // Track if message was received to prevent window close error
        let messageReceived = false;
        
        this.authWindow = window.open(
          authData.authorization_url,
          'linkedin_connect',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );

        const messageListener = async (event) => {
          if (event.origin !== window.location.origin) {
            return;
          }

          if (event.data.type === 'LINKEDIN_AUTH_SUCCESS') {
            messageReceived = true;
            window.removeEventListener('message', messageListener);
            
            try {
              const result = await apiService.connectLinkedIn(
                event.data.code,
                event.data.state
              );
              
              this.authWindow?.close();
              resolve(result);
            } catch (error) {
              this.authWindow?.close();
              reject(error);
            }
          } else if (event.data.type === 'LINKEDIN_AUTH_ERROR') {
            messageReceived = true;
            window.removeEventListener('message', messageListener);
            this.authWindow?.close();
            reject(new Error(event.data.error || 'LinkedIn connection failed'));
          }
        };

        window.addEventListener('message', messageListener);

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
      console.error('LinkedIn connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect LinkedIn from account
   * @returns {Promise} - Resolves with disconnection status
   */
  async disconnect() {
    try {
      return await apiService.disconnectLinkedIn();
    } catch (error) {
      console.error('LinkedIn disconnection error:', error);
      throw error;
    }
  }
}

export default new LinkedInService();
