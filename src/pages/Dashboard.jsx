import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api.js';
import Icon from '../assets/icon.svg';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user information
    const fetchUser = async () => {
      try {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // If unauthorized, redirect to login
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await apiService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state and redirect
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 bg-gray-900/80 backdrop-blur-xl border-b border-cyan-500/20 shadow-lg shadow-cyan-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center group">
              <div className="relative">
                <img src={Icon} alt="AptWise Logo" className="h-12 mr-4 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-3xl font-bold text-white font-orbitron bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                AptWise
              </span>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-6">
              {user && (
                <div className="flex items-center space-x-4 bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300">
                  <div className="relative">
                    {user.profile_picture_url ? (
                      <img
                        src={user.profile_picture_url}
                        alt="Profile"
                        className="w-10 h-10 rounded-full ring-2 ring-cyan-400/50 hover:ring-cyan-400 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-cyan-400/50 hover:ring-cyan-400 transition-all duration-300">
                        <span className="text-lg font-bold text-white">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-white font-medium">{user.name || 'User'}</p>
                    <p className="text-cyan-400 text-sm">{user.email}</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="group relative px-6 py-3 bg-gray-800/50 hover:bg-red-600/20 text-gray-300 hover:text-red-400 border border-gray-600 hover:border-red-500/50 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm"
              >
                <span className="relative z-10">Logout</span>
                <div className="absolute inset-0 bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-2 sm:px-0">

          {/* User Profile Matrix */}
          {user && (
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="relative bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"></div>

                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-white font-orbitron flex items-center">
                      <div className="w-8 h-8 bg-cyan-400 rounded mr-4 animate-pulse"></div>
                      USER PROFILE MATRIX
                    </h2>
                    <div className="text-cyan-400 font-mono text-sm">
                      ID: {user.email?.split('@')[0]?.toUpperCase() || 'UNKNOWN'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Personal Data */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
                        <h3 className="text-cyan-400 font-mono text-sm mb-4 tracking-wider">PERSONAL_DATA</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-400 text-xs font-mono mb-1">IDENTIFIER</label>
                            <p className="text-white font-medium text-lg">{user.name || 'CLASSIFIED'}</p>
                          </div>
                          <div>
                            <label className="block text-gray-400 text-xs font-mono mb-1">CONTACT_CHANNEL</label>
                            <p className="text-cyan-300 font-mono text-sm">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connection Status */}
                    <div className="lg:col-span-2">
                      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
                        <h3 className="text-cyan-400 font-mono text-sm mb-4 tracking-wider">EXTERNAL_CONNECTIONS</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* LinkedIn */}
                          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <svg className="w-6 h-6 text-blue-400 mr-3" viewBox="0 0 24 24">
                                  <path fill="currentColor" d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                                </svg>
                                <span className="text-white font-mono">LINKEDIN</span>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-mono ${user.is_linkedin_connected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                {user.is_linkedin_connected ? '⬢ LINKED' : '⬡ OFFLINE'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              URL: <span className="text-gray-300">{user.linkedin_url || 'NOT_SET'}</span>
                            </div>
                          </div>

                          {/* GitHub */}
                          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <svg className="w-6 h-6 text-purple-400 mr-3" viewBox="0 0 24 24">
                                  <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                                <span className="text-white font-mono">GITHUB</span>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-mono ${user.is_github_connected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                {user.is_github_connected ? '⬢ LINKED' : '⬡ OFFLINE'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              URL: <span className="text-gray-300">{user.github_url || 'NOT_SET'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mission Control Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Practice Mode */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-all duration-500"></div>
              <div className="relative bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-500 overflow-hidden cursor-pointer transform hover:scale-105">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400"></div>

                <div className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto transform group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-cyan-500/25">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 font-orbitron">PRACTICE MODE</h3>
                  <p className="text-gray-400 mb-6 font-mono text-sm">Initialize general training protocol</p>

                  <div className="space-y-2 text-xs font-mono text-cyan-400">
                    <div>⬢ DIFFICULTY: ADAPTIVE</div>
                    <div>⬢ QUESTIONS: UNLIMITED</div>
                    <div>⬢ STATUS: READY</div>
                  </div>

                  <button className="mt-6 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25">
                    ENGAGE
                  </button>
                </div>
              </div>
            </div>

            {/* Career Mode */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-all duration-500"></div>
              <div className="relative bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/30 hover:border-purple-400/60 transition-all duration-500 overflow-hidden cursor-pointer transform hover:scale-105">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>

                <div className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto transform group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-purple-500/25">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-purple-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 font-orbitron">CAREER MODE</h3>
                  <p className="text-gray-400 mb-6 font-mono text-sm">Targeted role-specific training</p>

                  <div className="space-y-2 text-xs font-mono text-purple-400">
                    <div>⬢ ANALYSIS: DEEP</div>
                    <div>⬢ PRECISION: MAXIMUM</div>
                    <div>⬢ STATUS: READY</div>
                  </div>

                  <button className="mt-6 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25">
                    ENGAGE
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Analytics */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-all duration-500"></div>
              <div className="relative bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-green-500/30 hover:border-green-400/60 transition-all duration-500 overflow-hidden cursor-pointer transform hover:scale-105">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-400"></div>

                <div className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto transform group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-green-500/25">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-green-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 font-orbitron">ANALYTICS</h3>
                  <p className="text-gray-400 mb-6 font-mono text-sm">Performance data matrix</p>

                  <div className="space-y-2 text-xs font-mono text-green-400">
                    <div>⬢ TRACKING: ACTIVE</div>
                    <div>⬢ INSIGHTS: REAL-TIME</div>
                    <div>⬢ STATUS: READY</div>
                  </div>

                  <button className="mt-6 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25">
                    ENGAGE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
