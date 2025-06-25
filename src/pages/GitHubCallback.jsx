import React, { useEffect } from 'react';

const GitHubCallback = () => {
  useEffect(() => {
    const handleCallback = () => {
      console.log('GitHub callback page loaded');
      console.log('Current URL:', window.location.href);
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      console.log('GitHub callback params:', { code, state, error, errorDescription });

      if (error) {
        console.log('GitHub auth error:', error, errorDescription);
        // Send error to parent window
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'GITHUB_AUTH_ERROR',
            error: errorDescription || error
          }, window.location.origin);
        }
      } else if (code && state) {
        console.log('GitHub auth success, sending to parent');
        // Send success data to parent window
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'GITHUB_AUTH_SUCCESS',
            code,
            state
          }, window.location.origin);
        }
      } else {
        console.log('GitHub auth - invalid parameters');
        // Send generic error
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'GITHUB_AUTH_ERROR',
            error: 'Invalid callback parameters'
          }, window.location.origin);
        }
      }

      // Close the popup window
      setTimeout(() => {
        console.log('Closing GitHub popup window');
        window.close();
      }, 1500);
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Processing GitHub authentication...</p>
      </div>
    </div>
  );
};

export default GitHubCallback;
