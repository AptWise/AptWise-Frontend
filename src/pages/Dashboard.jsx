import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api.js';
import Icon from '../assets/icon.svg';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMode, setEditMode] = useState('profile'); // 'profile', 'password', 'skills'
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user information and skills
    const fetchUserData = async () => {
      try {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
        
        // Fetch user skills
        try {
          const skillsResponse = await apiService.getUserSkills();
          setUserSkills(skillsResponse.skills || []);
        } catch (skillsError) {
          console.error('Failed to fetch user skills:', skillsError);
          setUserSkills([]);
        }
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

    fetchUserData();
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

  const handleEditProfile = (mode) => {
    setEditMode(mode);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
  };

  const refetchUserData = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      
      // Refetch skills if we're in skills mode
      if (editMode === 'skills') {
        try {
          const skillsResponse = await apiService.getUserSkills();
          setUserSkills(skillsResponse.skills || []);
        } catch (skillsError) {
          console.error('Failed to refetch user skills:', skillsError);
        }
      }
    } catch (error) {
      console.error('Failed to refetch user data:', error);
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
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/8 to-pink-500/4 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-green-500/6 to-emerald-500/3 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s', animationDelay: '4s'}}></div>
        
        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
        
        {/* Geometric Shapes */}
        <div className="absolute top-20 right-20 w-16 h-16 border border-cyan-400/20 rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 border border-purple-400/20 rotate-12 animate-ping" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full animate-bounce" style={{animationDuration: '2s', animationDelay: '1s'}}></div>
      </div>

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
          {/* Animated Welcome Hero Section */}
          <div className="relative mb-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-purple-500/20 rounded-3xl blur-3xl opacity-60 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 backdrop-blur-xl rounded-3xl border border-cyan-500/30 p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-transform duration-500">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent mb-2">
                        Welcome back{user?.name ? `, ${user.name}` : ''}
                      </h1>
                      <p className="text-xl text-gray-300">Elevate your career with intelligent interview preparation</p>
                    </div>
                  </div>
                  
                  {/* Progress Ring */}
                  <div className="flex items-center space-x-6 mt-6">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-700" />
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" 
                                className="text-cyan-400" strokeDasharray="251.2" strokeDashoffset="188.4" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">25%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Profile Completion</p>
                      <p className="text-gray-400 text-sm">Complete your profile to unlock more features</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="hidden lg:block relative w-64 h-64">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full animate-bounce"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full animate-pulse delay-75"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Profile Overview */}
          {user && (
            <div className="relative mb-12 group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-blue-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="relative bg-gray-900/80 backdrop-blur-2xl rounded-2xl border border-gray-700/50 overflow-hidden">
                {/* Animated Header */}
                <div className="relative bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 p-6">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-white">Profile Command Center</h2>
                    </div>
                    <button
                      onClick={() => handleEditProfile('profile')}
                      className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400/50 rounded-xl transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      <span className="relative flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Configure Profile</span>
                      </span>
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Personal Information Card */}
                    <div className="lg:col-span-4">
                      <div className="relative group/card">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl blur opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Personal Data</h3>
                          </div>
                          <div className="space-y-4">
                            <div className="group/item">
                              <label className="block text-cyan-400 text-sm font-medium mb-1">Full Name</label>
                              <p className="text-white group-hover/item:text-cyan-100 transition-colors duration-200">{user.name || 'Not provided'}</p>
                            </div>
                            <div className="group/item">
                              <label className="block text-cyan-400 text-sm font-medium mb-1">Email Address</label>
                              <p className="text-gray-300 group-hover/item:text-white transition-colors duration-200 break-all">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills Matrix */}
                    <div className="lg:col-span-4">
                      <div className="relative group/card">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl blur opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-white">Skills Matrix</h3>
                            </div>
                            <button
                              onClick={() => handleEditProfile('skills')}
                              className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-white border border-purple-500/30 hover:border-purple-400/50 rounded-lg text-sm transition-all duration-300"
                            >
                              Manage
                            </button>
                          </div>
                          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                            {userSkills.length > 0 ? (
                              userSkills.map((skillData, index) => (
                                <div key={index} className="group/skill flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-900/70 rounded-lg border border-gray-600/50 hover:border-purple-500/30 transition-all duration-200">
                                  <span className="text-white text-sm group-hover/skill:text-purple-200 transition-colors duration-200">{skillData.skill}</span>
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </div>
                                <p className="text-gray-400 text-sm">No skills added yet</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connection Hub */}
                    <div className="lg:col-span-4">
                      <div className="relative group/card">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl blur opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Connection Hub</h3>
                          </div>
                          <div className="space-y-3">
                            {/* LinkedIn */}
                            <div className="group/connection flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-900/70 rounded-lg border border-gray-600/50 hover:border-blue-500/30 transition-all duration-200">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                                  </svg>
                                </div>
                                <span className="text-white text-sm group-hover/connection:text-blue-200 transition-colors duration-200">LinkedIn</span>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_linkedin_connected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                                {user.is_linkedin_connected ? '● Connected' : '○ Not connected'}
                              </div>
                            </div>

                            {/* GitHub */}
                            <div className="group/connection flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-900/70 rounded-lg border border-gray-600/50 hover:border-purple-500/30 transition-all duration-200">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                  </svg>
                                </div>
                                <span className="text-white text-sm group-hover/connection:text-purple-200 transition-colors duration-200">GitHub</span>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_github_connected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                                {user.is_github_connected ? '● Connected' : '○ Not connected'}
                              </div>
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

          {/* Creative Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Practice Sessions - Animated */}
            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl border border-blue-500/20 p-8 hover:border-blue-400/40 transition-all duration-500 transform hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-4 transform group-hover:rotate-12 transition-transform duration-500">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full animate-bounce">
                        <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Practice Sessions</h3>
                      <p className="text-blue-300 text-sm font-medium">Interactive Learning</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm">Completion Rate</span>
                      <span className="text-blue-400 font-semibold">0%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full" style={{width: '0%'}}></div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    Sharpen your skills with our comprehensive question database covering various technical topics.
                  </p>
                  
                  <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25">
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M7 7h.01M17 7h.01M7 17h.01M17 17h.01" />
                      </svg>
                      <span>Launch Practice Mode</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Career-Focused - Animated */}
            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 hover:border-purple-400/40 transition-all duration-500 transform hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4 transform group-hover:rotate-12 transition-transform duration-500">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H6a2 2 0 00-2-2V6m16 0v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2z" />
                        </svg>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}>
                        <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Career-Focused</h3>
                      <p className="text-purple-300 text-sm font-medium">Role-Specific Prep</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm">Career Paths</span>
                      <span className="text-purple-400 font-semibold">12+</span>
                    </div>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex-1 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    Targeted interview preparation based on specific job roles and requirements.
                  </p>
                  
                  <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25">
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <span>Explore Career Paths</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Analytics - Animated */}
            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-green-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl border border-green-500/20 p-8 hover:border-green-400/40 transition-all duration-500 transform hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4 transform group-hover:rotate-12 transition-transform duration-500">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.7s'}}>
                        <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Progress Analytics</h3>
                      <p className="text-green-300 text-sm font-medium">Performance Insights</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm">Growth Rate</span>
                      <span className="text-green-400 font-semibold">+0%</span>
                    </div>
                    <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-400/20 rounded-full animate-pulse"></div>
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000" style={{width: '0%'}}></div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                    Detailed insights into your performance and areas for improvement.
                  </p>
                  
                  <button className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25">
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>View Analytics</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Activity & Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Interactive Activity Timeline */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-2xl rounded-2xl border border-gray-700/50 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-6 border-b border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">Activity Timeline</h3>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="relative space-y-6">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-blue-400 to-purple-400 opacity-30"></div>
                    
                    {/* Timeline Items */}
                    <div className="relative flex items-start space-x-4 group/item">
                      <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center border-4 border-gray-900 group-hover/item:scale-110 transition-transform duration-300">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-semibold">Account Created</h4>
                          <span className="text-green-400 text-sm font-medium">3 days ago</span>
                        </div>
                        <p className="text-gray-400 text-sm">Welcome to AptWise! Your journey begins here.</p>
                        <div className="mt-3 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-400 text-xs font-medium">MILESTONE</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start space-x-4 group/item">
                      <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center border-4 border-gray-900 group-hover/item:scale-110 transition-transform duration-300">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-semibold">Profile Updated</h4>
                          <span className="text-blue-400 text-sm font-medium">1 day ago</span>
                        </div>
                        <p className="text-gray-400 text-sm">Added new skills and updated profile information.</p>
                        <div className="mt-3 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <span className="text-blue-400 text-xs font-medium">PROFILE</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start space-x-4 group/item">
                      <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center border-4 border-gray-900 group-hover/item:scale-110 transition-transform duration-300">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-semibold">React Practice Session</h4>
                          <span className="text-purple-400 text-sm font-medium">2 hours ago</span>
                        </div>
                        <p className="text-gray-400 text-sm">Completed advanced React interview questions.</p>
                        <div className="mt-3 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                          <span className="text-purple-400 text-xs font-medium">PRACTICE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Analytics Dashboard */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-cyan-500/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-2xl rounded-2xl border border-gray-700/50 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 border-b border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white">Performance Analytics</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs font-medium">LIVE</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Animated Stat Card 1 */}
                    <div className="group/stat relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/20 rounded-full blur-xl opacity-50 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <span className="text-blue-400 text-xs font-medium">+0%</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">0</div>
                        <div className="text-blue-300 text-sm">Sessions</div>
                        <div className="mt-2 w-full bg-gray-700/50 rounded-full h-1">
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1 rounded-full transition-all duration-1000" style={{width: '0%'}}></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Animated Stat Card 2 */}
                    <div className="group/stat relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/20 rounded-full blur-xl opacity-50 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <span className="text-purple-400 text-xs font-medium">+{userSkills.length > 0 ? userSkills.length : 0}</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{userSkills.length}</div>
                        <div className="text-purple-300 text-sm">Skills</div>
                        <div className="mt-2 w-full bg-gray-700/50 rounded-full h-1">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-400 h-1 rounded-full transition-all duration-1000" style={{width: `${Math.min(userSkills.length * 10, 100)}%`}}></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Animated Stat Card 3 */}
                    <div className="group/stat relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20 hover:border-green-400/40 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/20 rounded-full blur-xl opacity-50 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-green-400 text-xs font-medium">+0h</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">0</div>
                        <div className="text-green-300 text-sm">Hours</div>
                        <div className="mt-2 w-full bg-gray-700/50 rounded-full h-1">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-1 rounded-full transition-all duration-1000" style={{width: '0%'}}></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Animated Stat Card 4 */}
                    <div className="group/stat relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/20 rounded-full blur-xl opacity-50 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <span className="text-yellow-400 text-xs font-medium">NEW</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">-</div>
                        <div className="text-yellow-300 text-sm">Avg Score</div>
                        <div className="mt-2 w-full bg-gray-700/50 rounded-full h-1">
                          <div className="bg-gradient-to-r from-yellow-500 to-orange-400 h-1 rounded-full transition-all duration-1000" style={{width: '0%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini Chart Visualization */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold text-sm">Weekly Progress</h4>
                      <span className="text-gray-400 text-xs">Last 7 days</span>
                    </div>
                    <div className="flex items-end space-x-2 h-16">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex-1 bg-gray-700/50 rounded-t-sm relative overflow-hidden">
                          <div 
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-blue-400 rounded-t-sm transition-all duration-1000"
                            style={{
                              height: `${Math.random() * 20 + 10}%`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          userSkills={userSkills}
          editMode={editMode}
          setEditMode={setEditMode}
          onClose={handleCloseModal}
          onSuccess={refetchUserData}
        />
      )}
    </div>
  );
};

// Edit Profile Modal Component
const EditProfileModal = ({ user, userSkills, editMode, setEditMode, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    linkedin_url: user?.linkedin_url || '',
    github_url: user?.github_url || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
    new_skill: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await apiService.updateProfile({
        name: formData.name,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url
      });
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      await apiService.updatePassword({
        current_password: formData.current_password,
        new_password: formData.new_password
      });
      
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!formData.new_skill.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await apiService.addSkill({ skill: formData.new_skill.trim() });
      setFormData({ ...formData, new_skill: '' });
      setSuccess('Skill added successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      setError(error.message || 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSkill = async (skill) => {
    setLoading(true);
    setError('');
    
    try {
      await apiService.removeSkill({ skill });
      setSuccess('Skill removed successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      setError(error.message || 'Failed to remove skill');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileForm = () => (
    <form onSubmit={handleProfileUpdate} className="space-y-4">
      <div>
        <label className="block text-cyan-400 font-mono text-xs mb-2">NAME</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-cyan-400 font-mono text-xs mb-2">LINKEDIN URL</label>
        <input
          type="url"
          name="linkedin_url"
          value={formData.linkedin_url}
          onChange={handleInputChange}
          placeholder="https://linkedin.com/in/username"
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-cyan-400 font-mono text-xs mb-2">GITHUB URL</label>
        <input
          type="url"
          name="github_url"
          value={formData.github_url}
          onChange={handleInputChange}
          placeholder="https://github.com/username"
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold rounded-lg transition-all duration-300"
      >
        {loading ? 'UPDATING...' : 'UPDATE PROFILE'}
      </button>
    </form>
  );

  const renderPasswordForm = () => (
    <form onSubmit={handlePasswordUpdate} className="space-y-4">
      <div>
        <label className="block text-cyan-400 font-mono text-xs mb-2">CURRENT PASSWORD</label>
        <input
          type="password"
          name="current_password"
          value={formData.current_password}
          onChange={handleInputChange}
          required
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-cyan-400 font-mono text-xs mb-2">NEW PASSWORD</label>
        <input
          type="password"
          name="new_password"
          value={formData.new_password}
          onChange={handleInputChange}
          required
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
        />
      </div>
      
      <div>
        <label className="block text-cyan-400 font-mono text-xs mb-2">CONFIRM NEW PASSWORD</label>
        <input
          type="password"
          name="confirm_password"
          value={formData.confirm_password}
          onChange={handleInputChange}
          required
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold rounded-lg transition-all duration-300"
      >
        {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
      </button>
    </form>
  );

  const renderSkillsForm = () => (
    <div className="space-y-4">
      <form onSubmit={handleAddSkill} className="flex space-x-2">
        <input
          type="text"
          name="new_skill"
          value={formData.new_skill}
          onChange={handleInputChange}
          placeholder="Enter new skill..."
          className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !formData.new_skill.trim()}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold rounded-lg transition-all duration-300"
        >
          ADD
        </button>
      </form>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <h4 className="text-cyan-400 font-mono text-xs tracking-wider mb-2">CURRENT SKILLS</h4>
        {userSkills.length > 0 ? (
          userSkills.map((skillData, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-800/50 rounded border border-gray-600">
              <span className="text-white font-mono text-sm">{skillData.skill}</span>
              <button
                onClick={() => handleRemoveSkill(skillData.skill)}
                disabled={loading}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 rounded font-mono text-xs transition-all duration-300 disabled:opacity-50"
              >
                REMOVE
              </button>
            </div>
          ))
        ) : (
          <div className="text-gray-500 font-mono text-xs text-center py-8">
            NO SKILLS FOUND
          </div>
        )}
      </div>
    </div>
  );

  const getModalTitle = () => {
    switch (editMode) {
      case 'profile': return 'EDIT PROFILE';
      case 'password': return 'CHANGE PASSWORD';
      case 'skills': return 'MANAGE SKILLS';
      default: return 'EDIT';
    }
  };

  const getModalContent = () => {
    switch (editMode) {
      case 'profile': return renderProfileForm();
      case 'password': return renderPasswordForm();
      case 'skills': return renderSkillsForm();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"></div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white font-orbitron flex items-center">
              <div className="w-6 h-6 bg-cyan-400 rounded mr-3 animate-pulse"></div>
              {getModalTitle()}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-700 hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded-lg flex items-center justify-center transition-all duration-300"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-400 font-mono text-sm">{success}</p>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {getModalContent()}
          </div>

          <div className="flex space-x-2 mt-6">
            <button
              onClick={() => setEditMode('profile')}
              className={`flex-1 py-2 px-4 rounded-lg font-mono text-xs transition-all duration-300 ${
                editMode === 'profile' 
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50' 
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600 hover:border-cyan-400/30'
              }`}
            >
              PROFILE
            </button>
            <button
              onClick={() => setEditMode('password')}
              className={`flex-1 py-2 px-4 rounded-lg font-mono text-xs transition-all duration-300 ${
                editMode === 'password' 
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50' 
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600 hover:border-purple-400/30'
              }`}
            >
              PASSWORD
            </button>
            <button
              onClick={() => setEditMode('skills')}
              className={`flex-1 py-2 px-4 rounded-lg font-mono text-xs transition-all duration-300 ${
                editMode === 'skills' 
                  ? 'bg-green-500/30 text-green-300 border border-green-400/50' 
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600 hover:border-green-400/30'
              }`}
            >
              SKILLS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
