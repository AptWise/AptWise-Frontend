import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api.js';
import Icon from '../assets/icon.svg';

// Define a global style that will be injected once
const GlobalStyle = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap');
    
    .dashboard-container {
      font-family: 'Space Grotesk', 'Poppins', sans-serif;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #1A1A1A;
      border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #00F0FF;
      border-radius: 10px;
    }
  `}</style>
);

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
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0FF] mx-auto mb-4"></div>
          <p className="text-[#A0A0A0] font-['Space_Grotesk']">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden dashboard-container">
      <GlobalStyle />

      {/* Header */}
      <header className="relative z-10 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-[#A0A0A0]/10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center group">
              <div className="relative">
                <img 
                  src={Icon} 
                  alt="AptWise Logo" 
                  className="h-9 mr-3 transition-transform duration-300 hover:scale-105 filter drop-shadow-[0_0_5px_#00F0FF]" 
                />
              </div>
              <span className="text-2xl font-bold text-white font-['Orbitron']">
                AptWise
              </span>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3 bg-[#1A1A1A] rounded-lg px-4 py-2 border border-[#A0A0A0]/10 hover:border-[#00F0FF] transition-all duration-300">
                  <div className="relative">
                    {user.profile_picture_url ? (
                      <img
                        src={user.profile_picture_url}
                        alt="Profile"
                        className="w-8 h-8 rounded-full ring-2 ring-[#A0A0A0]/30 hover:ring-[#00F0FF] transition-all duration-300"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-[#00F0FF] rounded-full flex items-center justify-center ring-2 ring-[#A0A0A0]/30 hover:ring-[#00F0FF] transition-all duration-300">
                        <span className="text-sm font-bold text-[#0D0D0D]">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#00F0FF] rounded-full border border-[#0D0D0D] shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-white font-medium font-['Space_Grotesk'] text-sm">{user.name || 'User'}</p>
                    <p className="text-[#A0A0A0] text-xs">{user.email}</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-transparent hover:bg-[#00F0FF]/10 text-[#A0A0A0] hover:text-white border-2 border-[#00F0FF] rounded-lg font-medium transition-all duration-300 btn-glow text-sm"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-2 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8 pt-4">
            <div className="mb-3">
              <div>
                <h1 className="text-3xl font-bold mb-2 font-['Orbitron'] text-[#00F0FF]">
                  Welcome back{user?.name ? `, ${user.name}` : ''}
                </h1>
                <p className="text-lg text-[#A0A0A0]">Elevate your career with intelligent interview preparation</p>
              </div>
            </div>
          </div>

          {/* Enhanced Profile Overview */}
          {user && (
            <div className="mb-8">
              <div className="bg-[#1A1A1A] rounded-lg border-2 border-[#00F0FF]/20 shadow-[0_0_30px_rgba(0,240,255,0.15)] overflow-hidden">
                {/* Header */}
                <div className="bg-[#0D0D0D] p-4 border-b-2 border-[#00F0FF]/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-[#00F0FF] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#0D0D0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-white font-['Orbitron']">Profile Command Center</h2>
                    </div>
                    <button
                      onClick={() => handleEditProfile('profile')}
                      className="px-4 py-2 bg-[#00F0FF] hover:bg-[#00F0FF] text-[#0D0D0D] border-2 border-[#00F0FF]/30 rounded-lg transition-all duration-300 flex items-center space-x-2 hover:transform hover:-translate-y-1 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="font-bold">Configure Profile</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-[#1A1A1A] bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D]">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Personal Information Card */}
                    <div className="lg:col-span-4">
                      <div>
                        <div className="bg-[#0D0D0D] rounded-lg p-4 border-2 border-[#00F0FF]/20 hover:border-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-8 h-8 bg-[#00F0FF] rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-[#0D0D0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h3 className="text-base font-semibold text-white font-['Space_Grotesk']">Personal Data</h3>
                          </div>
                          <div className="space-y-3 bg-[#1A1A1A]/40 p-3 rounded-lg border border-[#00F0FF]/10">
                            <div>
                              <label className="block text-[#00F0FF] text-xs font-medium mb-1">Full Name</label>
                              <p className="text-white text-sm">{user.name || 'Not provided'}</p>
                            </div>
                            <div>
                              <label className="block text-[#00F0FF] text-xs font-medium mb-1">Email Address</label>
                              <p className="text-[#A0A0A0] break-all text-sm">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills Matrix */}
                    <div className="lg:col-span-4">
                      <div>
                        <div className="bg-[#0D0D0D] rounded-lg p-4 border-2 border-[#00F0FF]/20 hover:border-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-[#00F0FF] rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#0D0D0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                              </div>
                              <h3 className="text-base font-semibold text-white font-['Space_Grotesk']">Skills Matrix</h3>
                            </div>
                            <button
                              onClick={() => handleEditProfile('skills')}
                              className="px-2 py-1 bg-transparent hover:bg-[#00F0FF]/10 text-[#00F0FF] border-2 border-[#00F0FF] rounded-lg text-xs transition-all duration-300"
                            >
                              Manage
                            </button>
                          </div>
                          <div className="bg-[#1A1A1A]/40 p-3 rounded-lg border border-[#00F0FF]/10">
                            <div className="space-y-2 max-h-24 overflow-y-auto custom-scrollbar">
                              {userSkills.length > 0 ? (
                                userSkills.map((skillData, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-[#1A1A1A] hover:bg-[#1A1A1A]/80 rounded-lg border border-[#00F0FF]/20 hover:border-[#00F0FF] transition-all duration-200">
                                    <span className="text-white text-xs">{skillData.skill}</span>
                                    <div className="w-2 h-2 bg-[#00F0FF] rounded-full shadow-[0_0_5px_#00F0FF]"></div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-4">
                                  <div 
                                    className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-2 cursor-pointer hover:bg-[#00F0FF]/10 border-2 border-[#00F0FF] transition-colors duration-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                                    onClick={() => handleEditProfile('skills')}
                                  >
                                    <svg className="w-6 h-6 text-[#00F0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  </div>
                                  <p className="text-[#A0A0A0] text-xs">No skills added yet</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connection Hub */}
                    <div className="lg:col-span-4">
                      <div>
                        <div className="bg-[#0D0D0D] rounded-lg p-4 border-2 border-[#00F0FF]/20 hover:border-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-8 h-8 bg-[#00F0FF] rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-[#0D0D0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            </div>
                            <h3 className="text-base font-semibold text-white font-['Space_Grotesk']">Connection Hub</h3>
                          </div>
                          <div className="space-y-2 bg-[#1A1A1A]/40 p-3 rounded-lg border border-[#00F0FF]/10">
                            {/* LinkedIn */}
                            <div className="flex items-center justify-between p-2 bg-[#1A1A1A] hover:bg-[#1A1A1A]/80 rounded-lg border border-[#00F0FF]/20 hover:border-[#00F0FF] transition-all duration-200">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-[#1A1A1A] rounded-lg flex items-center justify-center border border-[#00F0FF]/30 shadow-[0_0_5px_rgba(0,240,255,0.2)]">
                                  <svg className="w-3 h-3 text-[#00F0FF]" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                                  </svg>
                                </div>
                                <span className="text-white text-xs">LinkedIn</span>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_linkedin_connected ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_5px_rgba(0,240,255,0.2)]' : 'bg-[#1A1A1A] text-[#A0A0A0] border border-[#A0A0A0]/20'}`}>
                                {user.is_linkedin_connected ? '● Connected' : '○ Not connected'}
                              </div>
                            </div>

                            {/* GitHub */}
                            <div className="flex items-center justify-between p-2 bg-[#1A1A1A] hover:bg-[#1A1A1A]/80 rounded-lg border border-[#00F0FF]/20 hover:border-[#00F0FF] transition-all duration-200">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-[#1A1A1A] rounded-lg flex items-center justify-center border border-[#00F0FF]/30 shadow-[0_0_5px_rgba(0,240,255,0.2)]">
                                  <svg className="w-3 h-3 text-[#00F0FF]" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                  </svg>
                                </div>
                                <span className="text-white text-xs">GitHub</span>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_github_connected ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_5px_rgba(0,240,255,0.2)]' : 'bg-[#1A1A1A] text-[#A0A0A0] border border-[#A0A0A0]/20'}`}>
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

          {/* Practice Sessions */}
          <div className="mb-8">
            <div className="bg-[#1A1A1A] rounded-lg border-2 border-[#00F0FF]/20 shadow-[0_0_30px_rgba(0,240,255,0.15)] overflow-hidden">
              {/* Header */}
              <div className="bg-[#0D0D0D] p-4 border-b-2 border-[#00F0FF]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-9 h-9 bg-[#00F0FF] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#0D0D0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white font-['Orbitron']">Mock Interview</h2>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-[#1A1A1A] bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D]">
                <div className="bg-[#1A1A1A]/40 p-4 rounded-lg border border-[#00F0FF]/10 shadow-[0_0_10px_rgba(0,240,255,0.1)] mb-4">
                  <p className="text-[#FFFFFF] text-xs leading-relaxed">
                    Create custom interview presets with your skills and practice with our comprehensive question database covering various technical topics.
                  </p>
                </div>
                
                <button 
                  onClick={() => navigate('/interview-dashboard')}
                  className="w-full py-3 bg-[#00F0FF] hover:bg-[#00F0FF] text-[#0D0D0D] font-bold rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 flex items-center justify-center space-x-2 text-base mb-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M7 7h.01M17 7h.01M7 17h.01M17 17h.01" />
                  </svg>
                  <span className="font-['Orbitron']">LAUNCH INTERVIEW PREP</span>
                </button>

                <button 
                  onClick={() => navigate('/interview-history')}
                  className="w-full py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#00F0FF] font-semibold rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 flex items-center justify-center space-x-2 border border-[#00F0FF]/20 hover:border-[#00F0FF]/40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-['Poppins']">VIEW INTERVIEW HISTORY</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Activity & Analytics Dashboard removed */}
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
        <label className="block text-[#00F0FF] font-medium text-xs mb-2 font-['Space_Grotesk']">NAME</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full p-3 bg-[#1A1A1A] border border-[#A0A0A0]/20 focus:border-[#00F0FF] rounded-lg text-white text-sm focus:outline-none transition-all duration-300"
        />
      </div>
      
      <div>
        <label className="block text-[#00F0FF] font-medium text-xs mb-2 font-['Space_Grotesk']">LINKEDIN URL</label>
        <input
          type="url"
          name="linkedin_url"
          value={formData.linkedin_url}
          onChange={handleInputChange}
          placeholder="https://linkedin.com/in/username"
          className="w-full p-3 bg-[#1A1A1A] border border-[#A0A0A0]/20 focus:border-[#00F0FF] rounded-lg text-white text-sm focus:outline-none transition-all duration-300"
        />
      </div>
      
      <div>
        <label className="block text-[#00F0FF] font-medium text-xs mb-2 font-['Space_Grotesk']">GITHUB URL</label>
        <input
          type="url"
          name="github_url"
          value={formData.github_url}
          onChange={handleInputChange}
          placeholder="https://github.com/username"
          className="w-full p-3 bg-[#1A1A1A] border border-[#A0A0A0]/20 focus:border-[#00F0FF] rounded-lg text-white text-sm focus:outline-none transition-all duration-300"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#00F0FF] hover:bg-[#00F0FF] disabled:bg-[#1A1A1A] text-[#0D0D0D] font-bold rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] disabled:text-[#A0A0A0] hover:transform hover:-translate-y-1"
      >
        {loading ? 'UPDATING...' : 'UPDATE PROFILE'}
      </button>
    </form>
  );

  const renderPasswordForm = () => (
    <form onSubmit={handlePasswordUpdate} className="space-y-4">
      <div>
        <label className="block text-[#00F0FF] font-medium text-xs mb-2 font-['Space_Grotesk']">CURRENT PASSWORD</label>
        <input
          type="password"
          name="current_password"
          value={formData.current_password}
          onChange={handleInputChange}
          required
          className="w-full p-3 bg-[#1A1A1A] border border-[#A0A0A0]/20 focus:border-[#00F0FF] rounded-lg text-white text-sm focus:outline-none transition-all duration-300"
        />
      </div>
      
      <div>
        <label className="block text-[#00F0FF] font-medium text-xs mb-2 font-['Space_Grotesk']">NEW PASSWORD</label>
        <input
          type="password"
          name="new_password"
          value={formData.new_password}
          onChange={handleInputChange}
          required
          className="w-full p-3 bg-[#1A1A1A] border border-[#A0A0A0]/20 focus:border-[#00F0FF] rounded-lg text-white text-sm focus:outline-none transition-all duration-300"
        />
      </div>
      
      <div>
        <label className="block text-[#00F0FF] font-medium text-xs mb-2 font-['Space_Grotesk']">CONFIRM NEW PASSWORD</label>
        <input
          type="password"
          name="confirm_password"
          value={formData.confirm_password}
          onChange={handleInputChange}
          required
          className="w-full p-3 bg-[#1A1A1A] border border-[#A0A0A0]/20 focus:border-[#00F0FF] rounded-lg text-white text-sm focus:outline-none transition-all duration-300"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#00F0FF] hover:bg-[#00F0FF] disabled:bg-[#1A1A1A] text-[#0D0D0D] font-bold rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] disabled:text-[#A0A0A0] hover:transform hover:-translate-y-1"
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
          className="flex-1 p-3 bg-[#1A1A1A] border border-[#A0A0A0]/20 focus:border-[#00F0FF] rounded-lg text-white text-sm focus:outline-none transition-all duration-300"
        />
        <button
          type="submit"
          disabled={loading || !formData.new_skill.trim()}
          className="px-6 py-3 bg-[#00F0FF] hover:bg-[#00F0FF] disabled:bg-[#1A1A1A] text-[#0D0D0D] font-bold rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] disabled:text-[#A0A0A0]"
        >
          ADD
        </button>
      </form>
      
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        <h4 className="text-[#00F0FF] font-medium text-xs tracking-wider mb-2 font-['Space_Grotesk']">CURRENT SKILLS</h4>
        {userSkills.length > 0 ? (
          userSkills.map((skillData, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-[#1A1A1A] rounded border border-[#A0A0A0]/10 hover:border-[#00F0FF] transition-all duration-200">
              <span className="text-white text-sm">{skillData.skill}</span>
              <button
                onClick={() => handleRemoveSkill(skillData.skill)}
                disabled={loading}
                className="px-3 py-1 bg-[#0D0D0D] hover:bg-[#1A1A1A] text-[#A0A0A0] hover:text-white border border-[#A0A0A0]/20 hover:border-[#00F0FF] rounded text-xs transition-all duration-300 disabled:opacity-50"
              >
                REMOVE
              </button>
            </div>
          ))
        ) : (
          <div className="text-[#A0A0A0] text-xs text-center py-8">
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
      <div className="relative bg-[#0D0D0D] rounded-lg border border-[#A0A0A0]/10 w-full max-w-md max-h-[90vh] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] font-['Space_Grotesk']">
        <div className="h-1 bg-[#00F0FF] w-full shadow-[0_0_10px_#00F0FF]"></div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center font-['Orbitron']">
              <div className="w-6 h-6 bg-[#00F0FF] rounded mr-3"></div>
              {getModalTitle()}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-[#1A1A1A] hover:bg-[#00F0FF]/10 text-[#A0A0A0] hover:text-white border border-[#00F0FF] rounded-lg flex items-center justify-center transition-all duration-300"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#1A1A1A] border border-[#A0A0A0]/20 rounded-lg">
              <p className="text-[#A0A0A0] text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-[#00F0FF]/5 border border-[#00F0FF]/30 rounded-lg">
              <p className="text-[#00F0FF] text-sm">{success}</p>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {getModalContent()}
          </div>

          <div className="flex space-x-2 mt-6">
            <button
              onClick={() => setEditMode('profile')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs transition-all duration-300 ${
                editMode === 'profile' 
                  ? 'bg-[#00F0FF] text-[#0D0D0D] border border-[#00F0FF] font-bold' 
                  : 'bg-[#1A1A1A] text-[#A0A0A0] border border-[#A0A0A0]/20 hover:border-[#00F0FF] hover:text-[#00F0FF]'
              }`}
            >
              PROFILE
            </button>
            <button
              onClick={() => setEditMode('password')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs transition-all duration-300 ${
                editMode === 'password' 
                  ? 'bg-[#00F0FF] text-[#0D0D0D] border border-[#00F0FF] font-bold' 
                  : 'bg-[#1A1A1A] text-[#A0A0A0] border border-[#A0A0A0]/20 hover:border-[#00F0FF] hover:text-[#00F0FF]'
              }`}
            >
              PASSWORD
            </button>
            <button
              onClick={() => setEditMode('skills')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs transition-all duration-300 ${
                editMode === 'skills' 
                  ? 'bg-[#00F0FF] text-[#0D0D0D] border border-[#00F0FF] font-bold' 
                  : 'bg-[#1A1A1A] text-[#A0A0A0] border border-[#A0A0A0]/20 hover:border-[#00F0FF] hover:text-[#00F0FF]'
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
