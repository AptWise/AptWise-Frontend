import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api.js';
import Icon from '../assets/icon.svg';

// Define a global style that will be injected once
const GlobalStyle = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap');
    
    .interview-dashboard-container {
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
    
    .btn-glow {
      position: relative;
      overflow: hidden;
    }
    
    .btn-glow::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0,240,255,0.2), transparent);
      transition: left 0.5s;
    }
    
    .btn-glow:hover::before {
      left: 100%;
    }
    
    .modal-backdrop {
      backdrop-filter: blur(10px);
      background-color: rgba(0, 0, 0, 0.8);
    }
    
    .card-hover-effect {
      transition: all 0.3s ease;
    }
    
    .card-hover-effect:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 240, 255, 0.1);
    }
  `}</style>
);

const InterviewDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState([]);
  const [interviewPresets, setInterviewPresets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);
  const [newPreset, setNewPreset] = useState({
    name: '',
    description: '',
    company: '',
    role: '',
    selectedSkills: [],
    customSkills: []
  });
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [isGeneratingPreset, setIsGeneratingPreset] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const navigate = useNavigate();

  // Function to generate a random 20-digit ID
  const generateRandomId = () => {
    return Math.random().toString().slice(2, 22).padEnd(20, '0');
  };


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setError(null);
        const userData = await apiService.getCurrentUser();
        setUser(userData);
        
        // Fetch user skills
        try {
          const skillsResponse = await apiService.getUserSkills();
          console.log('Skills response:', skillsResponse); // Debug log
          // Handle both string arrays and object arrays with skill/proficiency structure
          const skills = skillsResponse.skills || [];
          const processedSkills = skills.map(skill => 
            typeof skill === 'string' ? skill : skill.skill || skill.name || skill
          ).filter(skill => skill && skill.trim()); // Filter out empty/null skills
          console.log('Processed skills:', processedSkills); // Debug log
          setUserSkills(processedSkills);
        } catch (skillsError) {
          console.error('Failed to fetch user skills:', skillsError);
          setUserSkills([]);
        }

        // Fetch user interview presets
        try {
          const presetsResponse = await apiService.getUserInterviewPresets();
          // Transform the data to match the expected format
          const transformedPresets = (presetsResponse.presets || []).map(preset => ({
            id: preset.id,
            name: preset.preset_name,
            description: preset.description,
            company: preset.company,
            role: preset.role,
            skills: preset.skills,
            createdAt: preset.created_at ? new Date(preset.created_at) : new Date()
          }));
          setInterviewPresets(transformedPresets);
        } catch (presetsError) {
          console.error('Failed to fetch interview presets:', presetsError);
          setInterviewPresets([]);
        }
        
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setError('Failed to load user data');
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
      navigate('/login');
    }
  };

  const handleCreatePreset = () => {
    try {
      setShowCreateModal(true);
    } catch (error) {
      console.error('Error opening create preset modal:', error);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewPreset({
      name: '',
      description: '',
      company: '',
      role: '',
      selectedSkills: [],
      customSkills: []
    });
    setCustomSkillInput('');
    setAiDescription('');
    setIsGeneratingPreset(false);
  };

  const handleGenerateWithAI = async () => {
    if (!aiDescription.trim()) {
      alert('Please enter a description for the AI to generate the preset.');
      return;
    }

    setIsGeneratingPreset(true);
    try {
      const response = await apiService.generateInterviewPreset({
        description: aiDescription,
        user_skills: userSkills
      });

      if (response.success) {
        // Auto-fill the form with AI-generated data
        setNewPreset(prev => ({
          ...prev,
          name: response.preset_name || '',
          description: response.description || '',
          company: response.company || '',
          role: response.role || '',
          selectedSkills: [], // Will be populated by the skill matching logic
          customSkills: []    // Will be populated by the skill matching logic
        }));

        // Handle skill matching - separate user skills from new skills
        const generatedSkills = response.skills || [];
        const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
        
        const matchingSkills = [];
        const newSkills = [];
        
        generatedSkills.forEach(skill => {
          if (userSkillsLower.includes(skill.toLowerCase())) {
            matchingSkills.push(skill);
          } else {
            newSkills.push(skill);
          }
        });

        // Update selected skills (from user's profile)
        setNewPreset(prev => ({
          ...prev,
          selectedSkills: matchingSkills,
          customSkills: newSkills
        }));

      } else {
        alert(`Failed to generate preset: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to generate preset with AI:', error);
      alert('Failed to generate preset with AI. Please try again.');
    } finally {
      setIsGeneratingPreset(false);
    }
  };

  const handleSkillToggle = (skill) => {
    setNewPreset(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill]
    }));
  };

  const handleAddCustomSkill = () => {
    if (customSkillInput.trim() && !newPreset.customSkills.includes(customSkillInput.trim())) {
      setNewPreset(prev => ({
        ...prev,
        customSkills: [...prev.customSkills, customSkillInput.trim()]
      }));
      setCustomSkillInput('');
    }
  };

  const handleRemoveCustomSkill = (skillToRemove) => {
    setNewPreset(prev => ({
      ...prev,
      customSkills: prev.customSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSavePreset = async () => {
    if (newPreset.name.trim() && newPreset.description.trim()) {
      try {
        // Generate a unique 20-digit ID
        let uniqueId;
        let idExists = true;
        while (idExists) {
          uniqueId = generateRandomId();
          // Check if ID already exists in current presets
          idExists = interviewPresets.some(preset => preset.id === uniqueId);
        }

        const presetData = {
          id: uniqueId,
          email: user.email,
          preset_name: newPreset.name,
          description: newPreset.description,
          company: newPreset.company || null,
          role: newPreset.role || null,
          skills: [...newPreset.selectedSkills, ...newPreset.customSkills]
        };
        
        // Save to database
        const savedPreset = await apiService.createInterviewPreset(presetData);
        
        // Update local state with the saved preset
        setInterviewPresets(prev => [...prev, {
          id: savedPreset.id,
          name: savedPreset.preset_name,
          description: savedPreset.description,
          company: savedPreset.company,
          role: savedPreset.role,
          skills: savedPreset.skills,
          createdAt: savedPreset.created_at ? new Date(savedPreset.created_at) : new Date()
        }]);
        
        handleCloseModal();
        
      } catch (error) {
        console.error('Failed to create interview preset:', error);
        // You might want to show an error message to the user here
        alert('Failed to save interview preset. Please try again.');
      }
    }
  };

  const handleLaunchInterview = (preset) => {
    // Create interview object with all details
    const interviewObject = {
      userName: user?.name || 'Unknown User',
      userEmail: user?.email || 'Unknown Email',
      interviewName: preset.name,
      description: preset.description,
      company: preset.company,
      role: preset.role,
      skills: preset.skills,
      createdAt: preset.createdAt
    };
    
    // Store the preset data in localStorage or context for the interview page
    localStorage.setItem('currentInterviewPreset', JSON.stringify(preset));
    localStorage.setItem('currentInterviewData', JSON.stringify(interviewObject));
    
    // Navigate to interview page with state
    navigate('/interview', { 
      state: { 
        interviewData: interviewObject 
      } 
    });
  };

  const handleDeletePreset = async (presetId) => {
    try {
      await apiService.deleteInterviewPreset(presetId);
      setInterviewPresets(prev => prev.filter(preset => preset.id !== presetId));
    } catch (error) {
      console.error('Failed to delete interview preset:', error);
      alert('Failed to delete interview preset. Please try again.');
    }
  };

  const handleShowPresetDialog = (preset) => {
    setSelectedPreset(preset);
    setShowPresetDialog(true);
  };

  const handleClosePresetDialog = () => {
    setSelectedPreset(null);
    setShowPresetDialog(false);
  };

  const renderSkillsPreview = (skills) => {
    if (!skills || skills.length === 0) return null;
    
    if (skills.length <= 3) {
      return skills.map((skill, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-[#00F0FF]/10 text-[#00F0FF] text-xs rounded-full border border-[#00F0FF]/30"
        >
          {skill}
        </span>
      ));
    }
    
    const visibleSkills = skills.slice(0, 3);
    const remainingCount = skills.length - 3;
    
    return (
      <>
        {visibleSkills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-[#00F0FF]/10 text-[#00F0FF] text-xs rounded-full border border-[#00F0FF]/30"
          >
            {skill}
          </span>
        ))}
        <span className="px-3 py-1 bg-[#A0A0A0]/10 text-[#A0A0A0] text-xs rounded-full border border-[#A0A0A0]/30">
          +{remainingCount} more
        </span>
      </>
    );
  };

  const truncateDescription = (description, maxLength = 80) => {
    if (!description || description.length <= maxLength) {
      return description;
    }
    
    // Find the last space before the maxLength to avoid cutting words
    const truncated = description.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.7) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0FF] mx-auto mb-4"></div>
          <p className="text-[#A0A0A0] font-['Space_Grotesk']">Loading interview dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-500 font-['Space_Grotesk'] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#00F0FF] text-[#0D0D0D] rounded-lg font-medium transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden interview-dashboard-container">
      <GlobalStyle />

      {/* Header */}
      <header className="relative z-10 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-[#A0A0A0]/10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center group cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="relative">
                <img 
                  src={Icon} 
                  alt="AptWise Logo" 
                  className="h-12 mr-4 transition-transform duration-300 hover:scale-105 filter drop-shadow-[0_0_5px_#00F0FF]" 
                />
              </div>
              <span className="text-3xl font-bold text-white font-['Orbitron']">
                AptWise
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-[#A0A0A0] hover:text-[#00F0FF] transition-colors duration-300 font-['Space_Grotesk']"
              >
                Dashboard
              </button>
              <span className="text-[#00F0FF] font-['Space_Grotesk'] font-medium">
                Interview Prep
              </span>
            </nav>

            {/* User menu */}
            <div className="flex items-center space-x-6">
              {user && (
                <div className="flex items-center space-x-4 bg-[#1A1A1A] rounded-lg px-6 py-3 border border-[#A0A0A0]/10 hover:border-[#00F0FF] transition-all duration-300">
                  <div className="relative">
                    {user.profile_picture_url ? (
                      <img
                        src={user.profile_picture_url}
                        alt="Profile"
                        className="w-10 h-10 rounded-full ring-2 ring-[#A0A0A0]/30 hover:ring-[#00F0FF] transition-all duration-300"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#00F0FF] rounded-full flex items-center justify-center ring-2 ring-[#A0A0A0]/30 hover:ring-[#00F0FF] transition-all duration-300">
                        <span className="text-lg font-bold text-[#0D0D0D]">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00F0FF] rounded-full border border-[#0D0D0D] shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-white font-medium font-['Space_Grotesk']">{user.name || 'User'}</p>
                    <p className="text-[#A0A0A0] text-sm">{user.email}</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-transparent hover:bg-[#00F0FF]/10 text-[#A0A0A0] hover:text-white border-2 border-[#00F0FF] rounded-lg font-medium transition-all duration-300 btn-glow"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-2 sm:px-0">
          {/* Page Header */}
          <div className="mb-12 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold mb-2 font-['Orbitron'] text-[#00F0FF]">
                  Interview Prep
                </h1>
                <p className="text-xl text-[#A0A0A0]">Create and manage your interview preparation sessions</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/interview-history')}
                  className="px-8 py-4 bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-[#0D0D0D] rounded-lg font-bold transition-all duration-300 btn-glow flex items-center space-x-2 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Past Interview & Evaluation</span>
                </button>
                <button
                  onClick={handleCreatePreset}
                  className="px-8 py-4 bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-[#0D0D0D] rounded-lg font-bold transition-all duration-300 btn-glow flex items-center space-x-2 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Interview Preset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interview Presets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviewPresets.length === 0 ? (
              <div className="col-span-full">
                <div className="text-center py-20 bg-[#1A1A1A] rounded-lg border-2 border-dashed border-[#A0A0A0]/30">
                  <div className="w-16 h-16 bg-[#00F0FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#00F0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">No Interview Presets</h3>
                  <p className="text-[#A0A0A0] mb-6">Create your first interview preset to get started</p>
                  <button
                    onClick={handleCreatePreset}
                    className="px-6 py-3 bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-[#0D0D0D] rounded-lg font-bold transition-all duration-300 btn-glow"
                  >
                    Create Preset
                  </button>
                </div>
              </div>
            ) : (
              interviewPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="bg-[#1A1A1A] rounded-lg border-2 border-[#A0A0A0]/20 hover:border-[#00F0FF]/50 shadow-[0_0_20px_rgba(0,240,255,0.1)] card-hover-effect cursor-pointer transition-all duration-300"
                  onClick={() => handleShowPresetDialog(preset)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">
                          {preset.name}
                        </h3>
                        <p className="text-[#A0A0A0] text-sm mb-3">
                          {truncateDescription(preset.description)}
                          {preset.description && preset.description.length > 80 && (
                            <span className="text-[#00F0FF] text-xs ml-1 font-medium">
                              Click to read more
                            </span>
                          )}
                        </p>
                        {preset.company && (
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-[#00F0FF] text-sm font-medium">Company:</span>
                            <span className="text-white text-sm">{preset.company}</span>
                          </div>
                        )}
                        {preset.role && (
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-[#00F0FF] text-sm font-medium">Role:</span>
                            <span className="text-white text-sm">{preset.role}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePreset(preset.id);
                        }}
                        className="text-[#A0A0A0] hover:text-red-500 transition-colors duration-300 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Skills Preview */}
                    <div className="mb-4">
                      <p className="text-[#00F0FF] text-sm font-medium mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {renderSkillsPreview(preset.skills)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchInterview(preset);
                        }}
                        className="flex-1 px-4 py-2 bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-[#0D0D0D] rounded-lg font-bold transition-all duration-300 btn-glow flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 000-5H8.5a2.5 2.5 0 000 5H10z" />
                        </svg>
                        <span>Launch Interview</span>
                      </button>
                    </div>

                    {/* Created date */}
                    <div className="mt-4 pt-4 border-t border-[#A0A0A0]/20">
                      <p className="text-[#A0A0A0] text-xs">
                        Created: {preset.createdAt && preset.createdAt instanceof Date ? preset.createdAt.toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Create Interview Preset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
          <div className="bg-[#1A1A1A] rounded-lg border-2 border-[#00F0FF]/30 shadow-[0_0_40px_rgba(0,240,255,0.3)] max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white font-['Orbitron']">
                  Create Interview Preset
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-[#A0A0A0] hover:text-white transition-colors duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSavePreset(); }} className="space-y-6">
                {/* Side by Side Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                  {/* Left Section - Fill with AI */}
                  <div className="bg-[#0D0D0D]/50 border border-[#00F0FF]/20 rounded-lg p-6">
                    <div className="mb-6">
                      <h3 className="text-[#00F0FF] text-xl font-medium mb-2">Fill with AI</h3>
                      <p className="text-[#A0A0A0] text-sm">Let AI generate your interview preset details</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[#00F0FF] text-sm font-medium mb-2">
                          Describe your interview preset *
                        </label>
                        <textarea
                          value={aiDescription}
                          onChange={(e) => setAiDescription(e.target.value)}
                          className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#A0A0A0]/30 rounded-lg text-white placeholder-[#A0A0A0] focus:border-[#00F0FF] focus:outline-none transition-colors duration-300 h-32 resize-none"
                          placeholder="e.g., Frontend developer position at Google focusing on React and JavaScript"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateWithAI}
                        disabled={isGeneratingPreset || !aiDescription.trim()}
                        className="w-full px-4 py-3 bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-[#0D0D0D] rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isGeneratingPreset ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0D0D0D]"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span>Generate Details</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2 hidden lg:flex flex-col items-center justify-center z-10">
                    <div className="w-px bg-[#A0A0A0]/30 flex-1"></div>
                    <div className="bg-[#1A1A1A] px-4 py-2 rounded-full border border-[#A0A0A0]/30 shadow-lg">
                      <span className="text-[#A0A0A0] text-sm font-medium">or</span>
                    </div>
                    <div className="w-px bg-[#A0A0A0]/30 flex-1"></div>
                  </div>

                  {/* Mobile Divider */}
                  <div className="lg:hidden flex items-center justify-center py-4">
                    <div className="h-px bg-[#A0A0A0]/30 flex-1"></div>
                    <div className="bg-[#1A1A1A] px-4 py-2 rounded-full border border-[#A0A0A0]/30 shadow-lg mx-4">
                      <span className="text-[#A0A0A0] text-sm font-medium">or</span>
                    </div>
                    <div className="h-px bg-[#A0A0A0]/30 flex-1"></div>
                  </div>

                  {/* Right Section - Fill it manually */}
                  <div className="bg-[#0D0D0D]/50 border border-[#A0A0A0]/20 rounded-lg p-6">
                    <div className="mb-6">
                      <h3 className="text-white text-xl font-medium mb-2">Fill it manually</h3>
                      <p className="text-[#A0A0A0] text-sm">Manually enter your interview preset details</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[#00F0FF] text-sm font-medium mb-2">
                          Preset Name *
                        </label>
                        <input
                          type="text"
                          value={newPreset.name}
                          onChange={(e) => setNewPreset(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#A0A0A0]/30 rounded-lg text-white placeholder-[#A0A0A0] focus:border-[#00F0FF] focus:outline-none transition-colors duration-300"
                          placeholder="e.g., Frontend Developer at Google"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[#00F0FF] text-sm font-medium mb-2">
                          Description *
                        </label>
                        <textarea
                          value={newPreset.description}
                          onChange={(e) => setNewPreset(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#A0A0A0]/30 rounded-lg text-white placeholder-[#A0A0A0] focus:border-[#00F0FF] focus:outline-none transition-colors duration-300 h-24 resize-none"
                          placeholder="Describe what this interview preset is for..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-[#00F0FF] text-sm font-medium mb-2">
                            Company
                          </label>
                          <input
                            type="text"
                            value={newPreset.company}
                            onChange={(e) => setNewPreset(prev => ({ ...prev, company: e.target.value }))}
                            className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#A0A0A0]/30 rounded-lg text-white placeholder-[#A0A0A0] focus:border-[#00F0FF] focus:outline-none transition-colors duration-300"
                            placeholder="e.g., Google"
                          />
                        </div>
                        <div>
                          <label className="block text-[#00F0FF] text-sm font-medium mb-2">
                            Role
                          </label>
                          <input
                            type="text"
                            value={newPreset.role}
                            onChange={(e) => setNewPreset(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#A0A0A0]/30 rounded-lg text-white placeholder-[#A0A0A0] focus:border-[#00F0FF] focus:outline-none transition-colors duration-300"
                            placeholder="e.g., Senior Frontend Developer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Section - Full Width */}
                <div className="bg-[#0D0D0D]/50 border border-[#A0A0A0]/20 rounded-lg p-6">
                  <h3 className="text-white text-xl font-medium mb-6">Skills</h3>
                  
                  {/* Skills Selection */}
                  <div className="mb-6">
                    <label className="block text-[#00F0FF] text-sm font-medium mb-4">
                      Select Skills from Your Profile
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                      {userSkills && userSkills.length > 0 ? userSkills.map((skill, index) => {
                        const skillName = typeof skill === 'string' ? skill : skill.skill || skill.name || String(skill);
                        return (
                          <button
                            key={`${skillName}-${index}`}
                            type="button"
                            onClick={() => handleSkillToggle(skillName)}
                            className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                              newPreset.selectedSkills.includes(skillName)
                                ? 'bg-[#00F0FF] text-[#0D0D0D] font-medium'
                                : 'bg-[#0D0D0D] text-[#A0A0A0] border border-[#A0A0A0]/30 hover:border-[#00F0FF] hover:text-white'
                            }`}
                          >
                            {skillName}
                          </button>
                        );
                      }) : null}
                    </div>
                    {(!userSkills || userSkills.length === 0) && (
                      <p className="text-[#A0A0A0] text-sm italic">
                        No skills found in your profile. Add skills to your profile or use custom skills below.
                      </p>
                    )}
                  </div>

                  {/* Custom Skills */}
                  <div>
                    <label className="block text-[#00F0FF] text-sm font-medium mb-2">
                      Add Custom Skills
                    </label>
                    <div className="flex space-x-2 mb-4">
                      <input
                        type="text"
                        value={customSkillInput}
                        onChange={(e) => setCustomSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSkill())}
                        className="flex-1 px-4 py-3 bg-[#0D0D0D] border border-[#A0A0A0]/30 rounded-lg text-white placeholder-[#A0A0A0] focus:border-[#00F0FF] focus:outline-none transition-colors duration-300"
                        placeholder="Enter a skill and press Add"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSkill}
                        className="px-6 py-3 bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-[#0D0D0D] rounded-lg font-medium transition-all duration-300"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newPreset.customSkills && newPreset.customSkills.length > 0 ? newPreset.customSkills.map((skill, index) => (
                        <span
                          key={`custom-${skill}-${index}`}
                          className="px-3 py-1 bg-[#00F0FF]/10 text-[#00F0FF] text-sm rounded-full border border-[#00F0FF]/30 flex items-center space-x-2"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomSkill(skill)}
                            className="text-[#00F0FF] hover:text-red-500 transition-colors duration-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )) : null}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 bg-transparent border-2 border-[#A0A0A0]/30 text-[#A0A0A0] hover:border-[#A0A0A0] hover:text-white rounded-lg font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-[#0D0D0D] rounded-lg font-bold transition-all duration-300 btn-glow"
                  >
                    Save Preset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preset Details Dialog */}
      {showPresetDialog && selectedPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
          <div className="bg-[#1A1A1A] rounded-lg border-2 border-[#00F0FF]/30 shadow-[0_0_40px_rgba(0,240,255,0.3)] max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="p-6">
              {/* Dialog Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white font-['Orbitron'] mb-3">
                    {selectedPreset.name}
                  </h2>
                  <div className="bg-[#0D0D0D]/50 border border-[#A0A0A0]/20 rounded-lg p-4">
                    <h3 className="text-[#00F0FF] text-sm font-medium mb-2">Description</h3>
                    <p className="text-white text-base leading-relaxed">
                      {selectedPreset.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClosePresetDialog}
                  className="text-[#A0A0A0] hover:text-white transition-colors duration-300 ml-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Company */}
                {selectedPreset.company && (
                  <div className="bg-[#0D0D0D]/50 border border-[#A0A0A0]/20 rounded-lg p-4">
                    <h3 className="text-[#00F0FF] text-sm font-medium mb-2">Company</h3>
                    <p className="text-white text-base">{selectedPreset.company}</p>
                  </div>
                )}

                {/* Role */}
                {selectedPreset.role && (
                  <div className="bg-[#0D0D0D]/50 border border-[#A0A0A0]/20 rounded-lg p-4">
                    <h3 className="text-[#00F0FF] text-sm font-medium mb-2">Role</h3>
                    <p className="text-white text-base">{selectedPreset.role}</p>
                  </div>
                )}

                {/* Created Date */}
                <div className="bg-[#0D0D0D]/50 border border-[#A0A0A0]/20 rounded-lg p-4">
                  <h3 className="text-[#00F0FF] text-sm font-medium mb-2">Created</h3>
                  <p className="text-white text-base">
                    {selectedPreset.createdAt && selectedPreset.createdAt instanceof Date 
                      ? selectedPreset.createdAt.toLocaleDateString() 
                      : 'Unknown'}
                  </p>
                </div>

                {/* Skills Count */}
                <div className="bg-[#0D0D0D]/50 border border-[#A0A0A0]/20 rounded-lg p-4">
                  <h3 className="text-[#00F0FF] text-sm font-medium mb-2">Skills Count</h3>
                  <p className="text-white text-base">{selectedPreset.skills ? selectedPreset.skills.length : 0} skills</p>
                </div>
              </div>

              {/* All Skills */}
              <div className="bg-[#0D0D0D]/50 border border-[#A0A0A0]/20 rounded-lg p-4 mb-6">
                <h3 className="text-[#00F0FF] text-lg font-medium mb-4">All Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPreset.skills && selectedPreset.skills.length > 0 ? (
                    selectedPreset.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-[#00F0FF]/10 text-[#00F0FF] text-sm rounded-full border border-[#00F0FF]/30"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-[#A0A0A0] text-sm">No skills specified</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={handleClosePresetDialog}
                  className="flex-1 px-6 py-3 bg-transparent border-2 border-[#A0A0A0]/30 text-[#A0A0A0] hover:border-[#A0A0A0] hover:text-white rounded-lg font-medium transition-all duration-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleClosePresetDialog();
                    handleLaunchInterview(selectedPreset);
                  }}
                  className="flex-1 px-6 py-3 bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-[#0D0D0D] rounded-lg font-bold transition-all duration-300 btn-glow flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 000-5H8.5a2.5 2.5 0 000 5H10z" />
                  </svg>
                  <span>Launch Interview</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewDashboard;
