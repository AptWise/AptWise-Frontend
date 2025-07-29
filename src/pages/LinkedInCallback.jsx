import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';

const LinkedInCallback = () => {  useEffect(() => {
    const handleCallback = () => {
      console.log('LinkedIn callback page loaded');
      console.log('Current URL:', window.location.href);
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      console.log('LinkedIn callback params:', { code, state, error, errorDescription });

      if (error) {
        console.log('LinkedIn auth error:', error, errorDescription);
        // Send error to parent window
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'LINKEDIN_AUTH_ERROR',
            error: errorDescription || error
          }, window.location.origin);
        }
      } else if (code && state) {
        console.log('LinkedIn auth success, sending to parent');
        // Send success data to parent window
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'LINKEDIN_AUTH_SUCCESS',
            code,
            state
          }, window.location.origin);
        }
      } else {
        console.log('LinkedIn auth - invalid parameters');
        // Send generic error
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'LINKEDIN_AUTH_ERROR',
            error: 'Invalid callback parameters'
          }, window.location.origin);
        }
      }

      // Close the popup window
      setTimeout(() => {
        console.log('Closing LinkedIn popup window');
        window.close();
      }, 1500);
    };

    handleCallback();
  }, []);

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh' }}>
      <Navbar />
      <div className="min-h-screen bg-gray-900 flex items-center justify-center" style={{ paddingTop: '0', minHeight: 'calc(100vh - 80px)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Processing LinkedIn authentication...</p>
        </div>
      </div>
    </div>
  );
};

export default LinkedInCallback;
