import React, { useState } from 'react';
import githubService from '../services/githubService.js';
import apiService from '../services/api.js';
import Navbar from '../components/Navbar';

const GitHubTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGitHubAuth = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Starting GitHub authentication test...');
      const authResult = await githubService.authenticate();
      console.log('GitHub authentication result:', authResult);
      setResult(authResult);
    } catch (err) {
      console.error('GitHub authentication error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubConnect = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Starting GitHub connection test...');
      const connectResult = await githubService.connect();
      console.log('GitHub connection result:', connectResult);
      setResult(connectResult);
    } catch (err) {
      console.error('GitHub connection error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testBackendConfig = async () => {
    try {
      const response = await apiService.request('/auth/debug/github');
      console.log('Backend GitHub config:', response);
      setResult(response);
    } catch (err) {
      console.error('Backend config test error:', err);
      setError(err.message);
    }
  };

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh' }}>
      <Navbar />
      <div className="min-h-screen bg-gray-900 p-8" style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">GitHub OAuth Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={handleGitHubAuth}
            disabled={loading}
            className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test GitHub Authentication'}
          </button>

          <button
            onClick={handleGitHubConnect}
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test GitHub Connection'}
          </button>

          <button
            onClick={testBackendConfig}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-300"
          >
            Test Backend Config
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-green-900/50 border border-green-500 rounded-lg">
            <h3 className="text-green-400 font-semibold mb-2">Success Result:</h3>
            <pre className="text-green-300 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <h3 className="text-red-400 font-semibold mb-2">Error:</h3>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
    </div>
  );
};

export default GitHubTest;
