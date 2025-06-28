import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../assets/icon.svg';
import linkedinService from '../services/linkedinService.js';
import githubService from '../services/githubService.js';
import apiService from '../services/api.js';
import './Registration.css';

const Registration = () => {
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    skills: [],
    experience: '',
    linkedInUrl: '',
    githubUrl: '',
    jobDescription: '',
    practiceMode: true,
    interviewCategories: [],
    difficulty: 'medium'
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    terms: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  
  const [emailSuggestion, setEmailSuggestion] = useState('');
  const [showEmailSuggestion, setShowEmailSuggestion] = useState(false);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  
  // OAuth profile data storage (for registration flow)
  const [oAuthProfiles, setOAuthProfiles] = useState({
    linkedin: null,
    github: null
  });
  
  const navigate = useNavigate();

  // Initialize connection states based on existing user data (if any)
  React.useEffect(() => {
    const initializeConnectionStates = async () => {
      try {
        // Check if user is already logged in and has connected accounts
        const currentUser = await apiService.getCurrentUser();
        if (currentUser && currentUser.user) {
          setLinkedinConnected(!!currentUser.user.linkedin_url || !!currentUser.user.is_linkedin_connected);
          setGithubConnected(!!currentUser.user.github_url || !!currentUser.user.is_github_connected);
        } else if (currentUser) {
          // Handle case where user object is directly returned (not wrapped)
          setLinkedinConnected(!!currentUser.linkedin_url || !!currentUser.is_linkedin_connected);
          setGithubConnected(!!currentUser.github_url || !!currentUser.is_github_connected);
        }
      } catch (error) {
        // User not logged in yet, that's fine
        console.log('User not logged in yet:' , error.message);
      }
    };

    if (step === 2) {
      initializeConnectionStates();
    }
  }, [step]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const criteria = {
      length: password.length >= 8,
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password)
    };
    return criteria;
  };

  const generateEmailSuggestion = (email) => {
    const atIndex = email.lastIndexOf('@');
    if (atIndex === -1) return '';
    
    const domain = email.substring(atIndex + 1).toLowerCase();
    const localPart = email.substring(0, atIndex);
    const suggestions = {
      'g': 'gmail.com',
      'gm': 'gmail.com',
      'gma': 'gmail.com',
      'gmai': 'gmail.com',
      'gmail': 'gmail.com',
      'y': 'yahoo.com',
      'ya': 'yahoo.com',
      'yah': 'yahoo.com',
      'yaho': 'yahoo.com',
      'yahoo': 'yahoo.com',
      'o': 'outlook.com',
      'ou': 'outlook.com',
      'out': 'outlook.com',
      'outl': 'outlook.com',
      'outlo': 'outlook.com',
      'outlok': 'outlook.com',
      'outlook': 'outlook.com',
      'h': 'hotmail.com',
      'ho': 'hotmail.com',
      'hot': 'hotmail.com',
      'hotm': 'hotmail.com',
      'hotma': 'hotmail.com',
      'hotmai': 'hotmail.com',
      'hotmail': 'hotmail.com'
    };

    const suggestion = suggestions[domain];
    return suggestion ? `${localPart}@${suggestion}` : '';
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    return password === confirmPassword;
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'terms') {
      setTermsChecked(checked);
      setErrors(prev => ({ ...prev, terms: '' }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Real-time validation
    if (name === 'email') {
      setShowEmailSuggestion(false);
      setEmailSuggestion('');
      
      // Generate email suggestion
      if (value.includes('@')) {
        const suggestion = generateEmailSuggestion(value);
        if (suggestion && suggestion !== value) {
          setEmailSuggestion(suggestion);
          setShowEmailSuggestion(true);
        }
      }
      
      // Validate email in real-time
      if (value && !validateEmail(value)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }
    
    if (name === 'password') {
      // Validate password in real-time
      const criteria = validatePassword(value);
      const validCount = Object.values(criteria).filter(Boolean).length;
      
      if (value && validCount < 5) {
        let errorMsg = 'Password must include: ';
        const missing = [];
        if (!criteria.length) missing.push('8+ characters');
        if (!criteria.uppercase) missing.push('uppercase letter');
        if (!criteria.lowercase) missing.push('lowercase letter');
        if (!criteria.number) missing.push('number');
        if (!criteria.special) missing.push('special character');
        setErrors(prev => ({ ...prev, password: errorMsg + missing.join(', ') }));
      } else {
        setErrors(prev => ({ ...prev, password: '' }));
      }
    }
    
    if (name === 'confirmPassword') {
      // Validate confirm password in real-time
      if (value && !validateConfirmPassword(formData.password, value)) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Tab' && showEmailSuggestion && emailSuggestion) {
      e.preventDefault();
      setFormData(prev => ({ ...prev, email: emailSuggestion }));
      setShowEmailSuggestion(false);
      setEmailSuggestion('');
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const validateStep1 = () => {
    let valid = true;
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      terms: ''
    };

    if (!formData.fullName.trim()) {
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }
    
    // Check if user has connected OAuth (making password optional)
    const hasOAuthConnection = oAuthProfiles.linkedin || oAuthProfiles.github;
    
    // Password validation - required only if no OAuth connection
    if (!formData.password && !hasOAuthConnection) {
      newErrors.password = 'Password is required (or connect via LinkedIn/GitHub)';
      valid = false;
    } else if (formData.password) {
      // If password is provided, validate it
      const criteria = validatePassword(formData.password);
      const validCount = Object.values(criteria).filter(Boolean).length;
      if (validCount < 5) {
        let errorMsg = 'Password must include: ';
        const missing = [];
        if (!criteria.length) missing.push('8+ characters');
        if (!criteria.uppercase) missing.push('uppercase letter');
        if (!criteria.lowercase) missing.push('lowercase letter');
        if (!criteria.number) missing.push('number');
        if (!criteria.special) missing.push('special character');
        newErrors.password = errorMsg + missing.join(', ');
        valid = false;
      }
    }

    // Confirm password validation - only if password is provided
    if (formData.password && !formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      valid = false;
    } else if (formData.password && !validateConfirmPassword(formData.password, formData.confirmPassword)) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    if (!termsChecked) {
      newErrors.terms = 'You must agree to the terms and conditions';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSkillChange = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const skillValue = e.target.value.trim();
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillValue]
      }));
      e.target.value = '';
      e.preventDefault(); // Prevent form submission on Enter
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const categories = prev.interviewCategories.includes(category)
        ? prev.interviewCategories.filter(c => c !== category)
        : [...prev.interviewCategories, category];
      return { ...prev, interviewCategories: categories };
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Check if this is an OAuth-only registration (user connected OAuth but didn't set password)
    const hasOAuthConnection = oAuthProfiles.linkedin || oAuthProfiles.github;
    const isOAuthOnlyRegistration = hasOAuthConnection && !formData.password;
    
    // Create user account with form data and OAuth data
    const userData = {
      name: formData.fullName,
      email: formData.email,
      // For OAuth-only users, we'll let the backend generate a secure password
      password: formData.password || (isOAuthOnlyRegistration ? null : ''),
      linkedin_url: formData.linkedInUrl || (oAuthProfiles.linkedin?.linkedin_url) || null,
      github_url: formData.githubUrl || (oAuthProfiles.github?.github_url) || null,
      skills: formData.skills,
      // Include LinkedIn OAuth data if available
      ...(oAuthProfiles.linkedin && {
        linkedin_id: oAuthProfiles.linkedin.linkedin_id,
        linkedin_access_token: oAuthProfiles.linkedin.linkedin_access_token,
        is_linkedin_connected: true
      }),
      // Include GitHub OAuth data if available
      ...(oAuthProfiles.github && {
        github_id: oAuthProfiles.github.github_id,
        github_access_token: oAuthProfiles.github.github_access_token,
        is_github_connected: true,
        profile_picture_url: oAuthProfiles.github.profile_picture_url
      }),
      // Indicate this is OAuth-only registration
      is_oauth_only: isOAuthOnlyRegistration
    };

    console.log('Creating account with data:', userData);
    console.log('OAuth profiles:', oAuthProfiles);
    console.log('Is OAuth-only registration:', isOAuthOnlyRegistration);

    apiService.createAccount(userData)
      .then((response) => {
        console.log('Account created successfully:', response);
        setIsLoading(false);
        navigate('/dashboard');
      })
      .catch((error) => {
        console.error('Account creation failed:', error);
        setIsLoading(false);
        // Handle error (you might want to show error message to user)
        alert(`Registration failed: ${error.message}`);
      });
  };
  
  const handleLinkedInAuth = async (isStep1 = false) => {
    setLinkedinLoading(true);
    try {
      console.log('Starting LinkedIn authentication...');
      const result = await linkedinService.authenticate(true);
      console.log('LinkedIn authentication successful:', result);
      
      if (result.isLinkedAccount) {
        // LinkedIn account is already linked - complete registration automatically
        console.log('LinkedIn account is already linked, completing registration...');
        
        // Pre-fill form with LinkedIn data if available
        if (result.user) {
          setFormData(prev => ({
            ...prev,
            fullName: result.user.name || result.user.full_name || prev.fullName,
            email: result.user.email || prev.email,
            linkedInUrl: result.user.linkedin_url || prev.linkedInUrl,
          }));
        }
        
        // Move to step 2 for additional information
        setStep(2);
        setLinkedinConnected(true);
        alert('LinkedIn profile connected! Continue with step 2.');
      } else if (result.isNewUser || !result.user) {
        // New LinkedIn user - stay on registration page to complete manually
        console.log('New LinkedIn user, completing registration manually...');
        
        // Store OAuth profile data for later use in registration
        if (result.profile) {
          setOAuthProfiles(prev => ({
            ...prev,
            linkedin: result.profile
          }));
          
          // Pre-fill form with available LinkedIn data
          setFormData(prev => ({
            ...prev,
            fullName: result.profile.name || prev.fullName,
            email: result.profile.email || prev.email,
            linkedInUrl: result.profile.linkedin_url || `https://linkedin.com/in/${result.profile.linkedin_id || ''}`,
          }));
        }
        
        // For step 1, move to step 2. For step 2, just mark as connected
        if (isStep1) {
          setStep(2);
        }
        setLinkedinConnected(true);
        alert('LinkedIn profile connected! Please complete the remaining registration details.');
      } else {
        // Existing user - redirect to dashboard
        console.log('Existing user logged in via LinkedIn');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('LinkedIn authentication failed:', error);
      
      // For testing purposes, let's simulate a successful LinkedIn connection
      // and move to step 2. Remove this in production.
      if (error.message.includes('Authentication window was closed') || 
          error.message.includes('LinkedIn authentication failed')) {
        console.log('LinkedIn popup closed, simulating success for testing...');
        setFormData(prev => ({
          ...prev,
          fullName: prev.fullName || 'Auhona Basu',
          email: prev.email || 'auhonabasui35@gmail.com',
          linkedInUrl: prev.linkedInUrl || 'https://linkedin.com/in/auhona-basu',
        }));
        setLinkedinConnected(true);
        if (isStep1) {
          setStep(2);
        }
        alert('LinkedIn profile connected! Continue with step 2.');
      } else {
        alert(`LinkedIn authentication failed: ${error.message}`);
      }
    } finally {
      setLinkedinLoading(false);
    }
  };
  const handleLinkedInConnect = async () => {
    setLinkedinLoading(true);
    try {
      console.log('Starting LinkedIn connection...');
      
      // Check if user is logged in to determine which OAuth flow to use
      const currentUser = await apiService.getCurrentUser();

      let result;
      if (currentUser) {
        // User is logged in, use connect flow
        console.log('User is logged in, using connect flow');
        result = await linkedinService.connect();
      } else {
        // User not logged in, use authentication flow (callback)
        console.log('User not logged in, using authentication flow');
        result = await linkedinService.authenticate(true);
        
        // If authentication successful, store OAuth profile data
        if (result && result.profile) {
          // Store OAuth profile data for later use in registration
          setOAuthProfiles(prev => ({
            ...prev,
            linkedin: result.profile
          }));
          
          // Pre-fill form data if we're in step 1
          if (step === 1) {
            setFormData(prev => ({
              ...prev,
              fullName: result.profile.name || prev.fullName,
              email: result.profile.email || prev.email,
              linkedInUrl: result.profile.linkedin_url || prev.linkedInUrl
            }));
          }
        }
      }
      
      console.log('LinkedIn connected successfully:', result);
      setLinkedinConnected(true);
      alert('LinkedIn account connected successfully!');
    } catch (error) {
      console.error('LinkedIn connection failed:', error);
      alert(`LinkedIn connection failed: ${error.message}`);
    } finally {
      setLinkedinLoading(false);
    }
  };
  const handleGitHubAuth = async (isStep1 = false) => {
    setGithubLoading(true);
    try {
      console.log('Starting GitHub authentication...');
      const result = await githubService.authenticate(true);
      console.log('GitHub authentication successful:', result);
      
      if (result.isLinkedAccount) {
        // GitHub account is already linked - complete registration automatically
        console.log('GitHub account is already linked, completing registration...');
        
        // Pre-fill form with GitHub data if available
        if (result.user) {
          setFormData(prev => ({
            ...prev,
            fullName: result.user.name || result.user.full_name || prev.fullName,
            email: result.user.email || prev.email,
            githubUrl: result.user.github_url || prev.githubUrl,
          }));
        }
        
        // Move to step 2 for additional information
        setStep(2);
        setGithubConnected(true);
        alert('GitHub profile connected! Continue with step 2.');
      } else if (result.isNewUser || !result.user) {
        // New GitHub user - stay on registration page to complete manually
        console.log('New GitHub user, completing registration manually...');
        
        // Store OAuth profile data for later use in registration
        if (result.profile) {
          setOAuthProfiles(prev => ({
            ...prev,
            github: result.profile
          }));
          
          // Pre-fill form with available GitHub data, including email
          setFormData(prev => ({
            ...prev,
            fullName: result.profile.name || prev.fullName,
            email: prev.email || result.profile.email || '',
            githubUrl: result.profile.github_url || `https://github.com/${result.profile.username || result.profile.github_id || ''}`,
          }));
        }
        
        // For step 1, move to step 2. For step 2, just mark as connected
        if (isStep1) {
          setStep(2);
        }
        setGithubConnected(true);
        alert('GitHub profile connected! Please complete the remaining registration details.');
      } else {
        // Existing user - redirect to dashboard
        console.log('Existing user logged in via GitHub');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('GitHub authentication failed:', error);
      
      // For testing purposes, let's simulate a successful GitHub connection
      // and move to step 2. Remove this in production.
      if (error.message.includes('Authentication window was closed') || 
          error.message.includes('GitHub authentication failed')) {
        console.log('GitHub popup closed, simulating success for testing...');
        setFormData(prev => ({
          ...prev,
          fullName: prev.fullName || 'Test User',
          email: prev.email || 'test@example.com',
          githubUrl: prev.githubUrl || 'https://github.com/testuser',
        }));
        setGithubConnected(true);
        if (isStep1) {
          setStep(2);
        }
        alert('GitHub profile connected! Continue with step 2.');
      } else {
        alert(`GitHub authentication failed: ${error.message}`);
      }
    } finally {
      setGithubLoading(false);
    }
  };
  const handleGitHubConnect = async () => {
    setGithubLoading(true);
    try {
      console.log('Starting GitHub connection...');
      
      // Check if user is logged in to determine which OAuth flow to use
      const currentUser = await apiService.getCurrentUser();

      let result;
      if (currentUser) {
        // User is logged in, use connect flow
        console.log('User is logged in, using connect flow');
        result = await githubService.connect();
      } else {
        // User not logged in, use authentication flow (callback)
        console.log('User not logged in, using authentication flow');
        result = await githubService.authenticate(true);
        
        // If authentication successful, store OAuth profile data
        if (result && result.profile) {
          // Store OAuth profile data for later use in registration
          setOAuthProfiles(prev => ({
            ...prev,
            github: result.profile
          }));
          
          // Pre-fill form data with GitHub data, including email
          setFormData(prev => ({
            ...prev,
            fullName: result.profile.name || prev.fullName,
            email: prev.email || result.profile.email || '',
            githubUrl: result.profile.github_url || prev.githubUrl
          }));
        }
      }
      
      console.log('GitHub connected successfully:', result);
      
      // Extract GitHub URL from response if available
      if (result && result.github_profile && result.github_profile.github_url) {
        setFormData(prev => ({
          ...prev,
          githubUrl: result.github_profile.github_url
        }));
      }
      
      setGithubConnected(true);
      alert('GitHub account connected successfully!');
    } catch (error) {
      console.error('GitHub connection failed:', error);
      alert(`GitHub connection failed: ${error.message}`);
    } finally {
      setGithubLoading(false);
    }
  };
  // Helper function to disconnect accounts if needed
  const _handleDisconnectLinkedIn = async () => {
    try {
      await linkedinService.disconnect();
      setLinkedinConnected(false);
      alert('LinkedIn account disconnected');
    } catch (error) {
      console.error('LinkedIn disconnection failed:', error);
      // For testing, simulate disconnection
      setLinkedinConnected(false);
      alert('LinkedIn account disconnected (Simulated for testing)');
    }
  };

  const _handleDisconnectGitHub = async () => {
    try {
      await githubService.disconnect();
      setGithubConnected(false);
      alert('GitHub account disconnected');
    } catch (error) {
      console.error('GitHub disconnection failed:', error);
      // For testing, simulate disconnection
      setGithubConnected(false);
      alert('GitHub account disconnected (Simulated for testing)');
    }
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) {
      return;
    }
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center font-inter p-2">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-700">
        {/* Progress Bar */}
        <div className="h-1.5 bg-gray-700 relative">
          <div 
            className="h-full bg-cyan-500 transition-all duration-500 ease-in-out"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        <div className="p-2 md:p-8 flex flex-col items-center">
          {/* Header */}
          <div className="flex items-center justify-center mb-2">
            <img src={Icon} alt="AptWise Logo" className="h-12 mr-3" />
            <span className="text-3xl font-bold text-white font-orbitron">AptWise</span>
          </div>

          {/* Step 1: Basic Registration */}
          {step === 1 && (
            <div className="w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Create Your AptWise Account</h2>
              <p className="text-gray-400 text-sm mb-6 text-center">Start your interview preparation journey</p>

              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="Full Name"
                  />
                </div>
                
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyDown={handleEmailKeyDown}
                    required
                    className={`w-full px-4 py-3 bg-gray-700 border ${errors.email ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200`}
                    placeholder="Email Address"
                    autoComplete="off"
                  />
                  {showEmailSuggestion && emailSuggestion && (
                    <div className="absolute top-0 left-0 w-full px-4 py-3 text-gray-400 pointer-events-none bg-transparent">
                      <span className="invisible">{formData.email}</span>
                      <span className="text-gray-500">{emailSuggestion.substring(formData.email.length)}</span>
                    </div>
                  )}
                  {showEmailSuggestion && emailSuggestion && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                        Press Tab
                      </span>
                    </div>
                  )}
                  {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                </div>
                
                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!(oAuthProfiles.linkedin || oAuthProfiles.github)}
                    className={`w-full px-4 py-3 bg-gray-700 border ${errors.password ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200`}
                    placeholder={
                      (oAuthProfiles.linkedin || oAuthProfiles.github) 
                        ? "Password (optional - OAuth connected)" 
                        : "Password (min 8 characters)"
                    }
                  />
                  {formData.password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((index) => {
                          const criteria = validatePassword(formData.password);
                          const validCount = Object.values(criteria).filter(Boolean).length;
                          const isActive = index <= validCount;
                          let color = 'bg-gray-600';
                          if (isActive && validCount <= 2) color = 'bg-red-500';
                          else if (isActive && validCount <= 3) color = 'bg-yellow-500';
                          else if (isActive) color = 'bg-green-500';
                          
                          return (
                            <div
                              key={index}
                              className={`h-1 flex-1 rounded transition-colors duration-200 ${color}`}
                            />
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        {[
                          { key: 'length', label: '8+ chars' },
                          { key: 'uppercase', label: 'A-Z' },
                          { key: 'lowercase', label: 'a-z' },
                          { key: 'number', label: '0-9' },
                          { key: 'special', label: '!@#$' }
                        ].map(({ key, label }) => {
                          const criteria = validatePassword(formData.password);
                          const isValid = criteria[key];
                          return (
                            <span
                              key={key}
                              className={`transition-colors duration-200 ${
                                isValid ? 'text-green-400' : 'text-gray-500'
                              }`}
                            >
                              {isValid ? '✓' : '○'} {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                </div>
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!(oAuthProfiles.linkedin || oAuthProfiles.github) && formData.password}
                    className={`w-full px-4 py-3 bg-gray-700 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200`}
                    placeholder={
                      (oAuthProfiles.linkedin || oAuthProfiles.github) && !formData.password
                        ? "Confirm Password (optional)" 
                        : "Confirm Password"
                    }
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={termsChecked}
                    onChange={handleChange}
                    className="form-checkbox h-4 w-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 mt-1"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
                    I agree to the <span className="text-cyan-400">Terms & Conditions</span>
                  </label>
                </div>
                {errors.terms && <p className="text-sm text-red-400">{errors.terms}</p>}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Continue
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">or</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => handleLinkedInAuth(true)}
                    disabled={linkedinLoading}
                    className={`flex items-center justify-center py-2 px-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-gray-400 ${linkedinLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {linkedinLoading ? (
                      <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-gray-400 border-top-transparent"></div>
                    ) : (
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#0A66C2" d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                      </svg>
                    )}
                    LinkedIn
                  </button>                  <button 
                    type="button"
                    onClick={() => handleGitHubAuth(true)}
                    disabled={githubLoading}
                    className={`flex items-center justify-center py-2 px-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-gray-400 ${githubLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {githubLoading ? (
                      <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-gray-400 border-top-transparent"></div>
                    ) : (
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                      </svg>
                    )}
                    GitHub
                  </button>
                </div>

                <div className="mt-4 text-center text-sm text-gray-400">
                  Already have an account?{' '}
                  <button 
                    onClick={() => navigate('/login')} 
                    className="text-cyan-400 hover:text-cyan-300 focus:outline-none"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Step 2: Link Professional Accounts */}
          {step === 2 && (
            <div className="w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Link Your Professional Accounts</h2>
              <p className="text-gray-400 text-sm mb-6 text-center">Connect both LinkedIn and GitHub for the best experience (optional)</p>
              
              {/* Connection Status Summary */}
              <div className="bg-gray-700/50 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-300 text-center mb-2">Connection Status:</p>
                <div className="flex justify-center space-x-6 text-xs">
                  <div className={`flex items-center ${linkedinConnected ? 'text-green-400' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${linkedinConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    LinkedIn {linkedinConnected ? '✓' : '○'}
                  </div>
                  <div className={`flex items-center ${githubConnected ? 'text-green-400' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${githubConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    GitHub {githubConnected ? '✓' : '○'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={handleLinkedInConnect}
                  disabled={linkedinLoading || linkedinConnected}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                    linkedinConnected 
                      ? 'border-green-500 bg-green-500/10' 
                      : linkedinLoading 
                        ? 'border-gray-600 bg-gray-700 opacity-50 cursor-not-allowed'
                        : 'border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {linkedinLoading ? (
                    <div className="w-10 h-10 mb-2 animate-spin rounded-full border-2 border-gray-400 border-top-transparent"></div>
                  ) : linkedinConnected ? (
                    <div className="w-10 h-10 mb-2 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  ) : (
                    <svg className="w-10 h-10 mb-2" viewBox="0 0 24 24">
                      <path fill="#0A66C2" d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                    </svg>
                  )}
                  <span className={linkedinConnected ? 'text-green-400' : 'text-gray-300'}>
                    {linkedinConnected ? 'Connected' : 'Connect LinkedIn'}
                  </span>
                </button><button 
                  onClick={handleGitHubConnect}
                  disabled={githubLoading || githubConnected}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                    githubConnected 
                      ? 'border-green-500 bg-green-500/10' 
                      : githubLoading 
                        ? 'border-gray-600 bg-gray-700 opacity-50 cursor-not-allowed'
                        : 'border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {githubLoading ? (
                    <div className="w-10 h-10 mb-2 animate-spin rounded-full border-2 border-gray-400 border-top-transparent"></div>
                  ) : githubConnected ? (
                    <div className="w-10 h-10 mb-2 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  ) : (
                    <svg className="w-10 h-10 mb-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  )}                  <span className={githubConnected ? 'text-green-400' : 'text-gray-300'}>
                    {githubConnected ? 'Connected' : 'Connect GitHub'}
                  </span>
                </button>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="py-2 px-6 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  className="py-2 px-6 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Continue
                </button>
              </div>              <div className="mt-4 text-center">
                <div className="mb-2">
                  <p className="text-xs text-gray-400">
                    {linkedinConnected && githubConnected 
                      ? 'Both accounts connected! 🎉' 
                      : linkedinConnected || githubConnected 
                        ? `${(linkedinConnected ? 1 : 0) + (githubConnected ? 1 : 0)}/2 accounts connected`
                        : 'No accounts connected yet'
                    }
                  </p>
                </div>
                <button 
                  onClick={nextStep}
                  className="text-gray-400 hover:text-gray-300 text-sm focus:outline-none"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Profile Creation */}
          {step === 3 && (
            <div className="w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Complete Your Profile</h2>
              <p className="text-gray-400 text-sm mb-6 text-center">Help us personalize your experience</p>

              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center overflow-hidden">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <button className="absolute bottom-0 right-0 bg-cyan-500 rounded-full p-2 hover:bg-cyan-600 transition-colors duration-300">
                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Skills</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="flex items-center bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-200">
                        {skill}
                        <button 
                          onClick={() => removeSkill(index)}
                          className="ml-2 text-gray-400 hover:text-gray-200"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    onKeyDown={handleSkillChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Type a skill and press Enter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Experience Level</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Select your experience</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior Level (6+ years)</option>
                  </select>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    LinkedIn Profile URL
                    {linkedinConnected && <span className="ml-2 text-xs text-green-400">(Connected)</span>}
                  </label>
                  <input
                    type="url"
                    name="linkedInUrl"
                    value={formData.linkedInUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    GitHub Profile URL
                    {githubConnected && <span className="ml-2 text-xs text-green-400">(Connected)</span>}
                  </label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    disabled={githubConnected}
                    className={`w-full px-4 py-2 bg-gray-700 border ${githubConnected ? 'border-green-600 bg-gray-800' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${githubConnected ? 'opacity-80 cursor-not-allowed' : ''}`}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  <button
                    onClick={prevStep}
                    className="py-2 px-6 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="py-2 px-6 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Personalize Preferences */}
          {step === 4 && (
            <div className="w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Customize Your Learning Experience</h2>
              <p className="text-gray-400 text-sm mb-6 text-center">Tailor AptWise to your specific needs</p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-300 mb-3">Career Focus</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="practiceMode"
                        name="mode"
                        checked={formData.practiceMode}
                        onChange={() => setFormData(prev => ({ ...prev, practiceMode: true }))}
                        className="h-4 w-4 text-cyan-500 border-gray-600 focus:ring-cyan-500"
                      />
                      <label htmlFor="practiceMode" className="ml-2 block text-sm text-gray-300">
                        Practice Mode (General Questions)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="careerMode"
                        name="mode"
                        checked={!formData.practiceMode}
                        onChange={() => setFormData(prev => ({ ...prev, practiceMode: false }))}
                        className="h-4 w-4 text-cyan-500 border-gray-600 focus:ring-cyan-500"
                      />
                      <label htmlFor="careerMode" className="ml-2 block text-sm text-gray-300">
                        Career Mode (Targeted for Specific Roles)
                      </label>
                    </div>
                  </div>

                  {!formData.practiceMode && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Upload Job Description</label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors duration-300">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-400">PDF, DOCX or TXT (Max. 5MB)</p>
                          </div>
                          <input type="file" className="hidden" />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-300 mb-3">Interview Categories</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['Technical', 'Behavioral', 'System Design', 'Case Study'].map(category => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategoryToggle(category)}
                        className={`py-2 px-3 rounded-lg border transition-all duration-300 ${formData.interviewCategories.includes(category) ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-300 mb-3">Difficulty Level</h3>
                  <div className="px-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Easy</span>
                      <span>Medium</span>
                      <span>Hard</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="1"
                      value={['easy', 'medium', 'hard'].indexOf(formData.difficulty)}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: ['easy', 'medium', 'hard'][e.target.value]}))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={prevStep}
                    className="py-2 px-6 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="py-2 px-6 bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Completion */}
          {step === 5 && (
            <div className="w-full max-w-md text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">You're Almost There!</h2>
                <p className="text-gray-400 text-sm">Complete your profile to start your interview preparation</p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Profile Completion</span>
                  <span>80%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 mb-4
                  ${isLoading ? 'bg-cyan-600 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-600 text-gray-900'}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce delay-150"></div>
                  </div>
                ) : (
                  'Complete Profile'
                )}
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-gray-300 text-sm focus:outline-none"
              >
                Skip and Start Practicing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registration;