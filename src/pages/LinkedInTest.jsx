import React, { useState } from 'react';
import apiService from '../services/api.js';
import linkedinService from '../services/linkedinService.js';

const LinkedInTest = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const testBackendConnection = async () => {
    setLoading(true);
    setStatus('Testing backend connection...');
    
    try {
      const response = await fetch('http://localhost:8000/auth/debug/linkedin');
      const data = await response.json();
      setDebugInfo(data);
      setStatus('Backend connection successful');
    } catch (error) {
      setStatus(`Backend connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLinkedInAuth = async () => {
    setLoading(true);
    setStatus('Testing LinkedIn authentication...');
    
    try {
      const result = await linkedinService.authenticate(true);
      setStatus(`LinkedIn authentication successful: ${JSON.stringify(result)}`);
    } catch (error) {
      setStatus(`LinkedIn authentication failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetAuthUrl = async () => {
    setLoading(true);
    setStatus('Getting LinkedIn auth URL...');
    
    try {
      const result = await apiService.getLinkedInAuthUrl();
      setStatus(`Auth URL generated: ${result.authorization_url}`);
    } catch (error) {
      setStatus(`Failed to get auth URL: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">LinkedIn OAuth Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <button
              onClick={testBackendConnection}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Test Backend Connection
            </button>
            
            <button
              onClick={testGetAuthUrl}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 ml-4"
            >
              Test Get Auth URL
            </button>
            
            <button
              onClick={testLinkedInAuth}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 ml-4"
            >
              Test Full LinkedIn Auth
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Status</h2>
          <p className={`text-sm ${status.includes('successful') ? 'text-green-400' : status.includes('failed') ? 'text-red-400' : 'text-gray-300'}`}>
            {status || 'No tests run yet'}
          </p>
          {loading && (
            <div className="mt-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div>
            </div>
          )}
        </div>

        {debugInfo && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>
            <pre className="text-sm text-gray-300 overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Setup Checklist</h2>
          <div className="space-y-2 text-sm text-gray-300">
            <div>✓ Frontend running on http://localhost:5173</div>
            <div>✓ Backend running on http://localhost:8000</div>
            <div>? LinkedIn Client ID configured in backend .env</div>
            <div>? LinkedIn Client Secret configured in backend .env</div>
            <div>? LinkedIn App redirect URI set to http://localhost:5173/auth/linkedin/callback</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInTest;
