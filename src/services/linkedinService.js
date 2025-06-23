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
            window.removeEventListener('message', messageListener);
            
            try {              // Handle the callback with the authorization code
              const result = await apiService.handleLinkedInCallback(
                event.data.code,
                event.data.state
              );
              
              this.authWindow?.close();
              
              // For registration, check if this is a new user or existing linked account
              if (isRegistration) {
                resolve({
                  ...result,
                  isNewUser: !result.user?.id, // If no user ID, it's a new registration
                  isLinkedAccount: !!result.user?.id // If user ID exists, account is already linked
                });
              } else {
                resolve(result);
              }
            } catch (error) {
              this.authWindow?.close();
              reject(error);
            }
          } else if (event.data.type === 'LINKEDIN_AUTH_ERROR') {
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
            reject(new Error('Authentication window was closed'));
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
            reject(new Error('Connection window was closed'));
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
