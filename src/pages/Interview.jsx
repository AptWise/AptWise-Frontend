import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import icon from '../assets/icon.svg';
import './Interview.css';
import Button from '../components/Button';
import apiService from '../services/api';

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get interview data from navigation state or localStorage
  const getInterviewData = () => {
    const stateData = location.state?.interviewData;
    if (stateData) return stateData;
    
    const localStorageData = localStorage.getItem('currentInterviewData');
    if (localStorageData) {
      try {
        return JSON.parse(localStorageData);
      } catch (error) {
        console.error('Error parsing interview data from localStorage:', error);
      }
    }
    return null;
  };

  const interviewData = getInterviewData();
  
  // Create personalized welcome message
  const createWelcomeMessage = () => {
    if (!interviewData) {
      return "Hello! I'm your interview preparation assistant. What position are you preparing for today?";
    }
    
    const { userName, company, role, skills } = interviewData;
    let message = `Hi ${userName}! Today we are here for the practice of ${role || 'a position'}`;
    
    if (company) {
      message += ` at ${company}`;
    }
    
    if (skills && skills.length > 0) {
      const skillsList = skills.join(', ');
      message += `. The skills that will be covered in the interview are: ${skillsList}`;
    }
    
    message += ". Let's begin your interview preparation!";
    return message;
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: createWelcomeMessage(),
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentInterview, setCurrentInterview] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [isTypewriterActive, setIsTypewriterActive] = useState(false);
  const [searchContext, setSearchContext] = useState(null); // Store search context for next question
  const hasGeneratedInitialQuestionRef = useRef(false);
  const isGeneratingQuestionRef = useRef(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Generate initial AI question when interview starts
  // const generateInitialAIQuestion = async () => {
  //   if (!interviewData || !interviewData.skills || hasGeneratedInitialQuestionRef.current || isGeneratingQuestionRef.current) return;
    
  //   hasGeneratedInitialQuestionRef.current = true; // Set flag immediately to prevent multiple calls
  //   isGeneratingQuestionRef.current = true;
  //   setIsTyping(true); // Show typing indicator for initial question
    
  //   try {
  //     const requestData = {
  //       user_details: {
  //         userName: interviewData.userName || user?.name || 'User',
  //         company: interviewData.company || 'Company',
  //         role: interviewData.role || 'Position'
  //       },
  //       skills: interviewData.skills || [],
  //       conversation_history: []
  //     };
      
  //     const response = await apiService.generateInterviewQuestion(requestData);
      
  //     if (response.success) {
  //       // Stop the typing indicator and start typewriter effect
  //       setIsTyping(false);
        
  //       // Store search context for next question
  //       if (response.search_context) {
  //         setSearchContext(response.search_context);
  //       }
        
  //       typewriterEffect(response.question, () => {
  //         // Add the AI question after the welcome message
  //         const aiQuestionMessage = {
  //           id: Date.now(), // Use timestamp for unique ID
  //           role: 'assistant',
  //           content: response.question,
  //           timestamp: new Date(),
  //         };
          
  //         setMessages(prev => [...prev, aiQuestionMessage]);
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error generating initial AI question:', error);
  //     setIsTyping(false); // Stop typing indicator on error
  //     hasGeneratedInitialQuestionRef.current = false; // Reset flag on error so it can be retried
  //   } finally {
  //     isGeneratingQuestionRef.current = false;
  //   }
  // };

  // NOTE: Removed automatic initial question generation - questions will only be generated after user sends a message
  // useEffect(() => {
  //   if (user && interviewData && !hasGeneratedInitialQuestionRef.current) {
  //     // Add a small delay to allow the welcome message to be displayed first
  //     const timer = setTimeout(() => {
  //       generateInitialAIQuestion();
  //     }, 2000);
  //     
  //     // Cleanup timeout on component unmount
  //     return () => clearTimeout(timer);
  //   }
  // }, [user, interviewData]);

  // Toggle sidebar collapse states
  const toggleLeftSidebar = () => {
    setLeftSidebarCollapsed(!leftSidebarCollapsed);
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    scrollToBottom();
  }, [messages, typewriterText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Typewriter effect function
  const typewriterEffect = (text, onComplete) => {
    setTypewriterText('');
    setIsTypewriterActive(true);
    let index = 0;
    let currentText = '';
    
    const timer = setInterval(() => {
      if (index < text.length) {
        currentText += text.charAt(index);
        setTypewriterText(currentText);
        index++;
      } else {
        clearInterval(timer);
        setIsTypewriterActive(false);
        onComplete();
      }
    }, 5); // Adjust speed here (lower = faster)
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || isTyping) return; // Prevent if empty or typing
    
    console.log('🚀 handleSendMessage called with:', inputMessage);
    
    const newUserMessage = {
      id: Date.now(), // Use timestamp for unique ID
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };
    
    console.log('💬 Adding user message:', newUserMessage);
    
    // Add user message to chat immediately
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    
    // Check if already generating after we've added the user message
    if (isGeneratingQuestionRef.current) {
      console.log('⚠️ Already generating question, skipping API call');
      return;
    }
    
    isGeneratingQuestionRef.current = true;
    setIsTyping(true);
    
    console.log('🤖 Starting AI question generation...');
    
    try {
      // Prepare the conversation history for the AI service
      const conversationHistory = [...messages, newUserMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }));
      
      // Prepare the request data
      const requestData = {
        user_details: {
          userName: interviewData?.userName || user?.name || 'User',
          company: interviewData?.company || 'Company',
          role: interviewData?.role || 'Position'
        },
        skills: interviewData?.skills || [],
        conversation_history: conversationHistory,
        search_context: searchContext // Include search context from previous response
      };
      
      // Call the AI service
      console.log('📡 Calling AI service with:', requestData);
      const response = await apiService.generateInterviewQuestion(requestData);
      console.log('✅ AI service response:', response);
      
      if (response.success) {
        // Stop the typing indicator and start typewriter effect
        setIsTyping(false);
        
        // Store search context for next question
        if (response.search_context) {
          setSearchContext(response.search_context);
          console.log('💡 Stored search context for next question:', response.search_context);
        }
        
        typewriterEffect(response.question, () => {
          const responseMessage = {
            id: Date.now() + 1, // Use timestamp for unique ID
            role: 'assistant',
            content: response.question,
            timestamp: new Date(),
          };
          
          console.log('🤖 Adding AI response message:', responseMessage);
          setMessages(prev => [...prev, responseMessage]);
        });
      } else {
        console.log('❌ AI service returned error:', response);
        // Handle error response
        setIsTyping(false);
        const errorMessage = {
          id: Date.now() + 1, // Use timestamp for unique ID
          role: 'assistant',
          content: 'I apologize, but I encountered an issue generating your next question. Could you please try again?',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
      
    } catch (error) {
      console.error('💥 Error sending message:', error);
      setIsTyping(false);
      
      // Show error message to user
      const errorMessage = {
        id: Date.now() + 1, // Use timestamp for unique ID
        role: 'assistant',
        content: 'I apologize, but I encountered a technical issue. Could you please try again?',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      console.log('🏁 Setting isGeneratingQuestionRef to false');
      isGeneratingQuestionRef.current = false;
    }
  };

  // Temporary function to simulate responses
  // const getSimulatedResponse = (message) => {
  //   const lowerMessage = message.toLowerCase();
    
  //   if (lowerMessage.includes('react') || lowerMessage.includes('frontend')) {
  //     return "For React positions, be prepared to discuss component lifecycle, hooks, state management, and performance optimization. Could you tell me about a challenging React project you've worked on?";
  //   } else if (lowerMessage.includes('python') || lowerMessage.includes('backend')) {
  //     return "Backend roles often require deep knowledge of API design, database optimization, and system architecture. Can you walk me through how you'd design a scalable backend service?";
  //   } else if (lowerMessage.includes('experience') || lowerMessage.includes('project')) {
  //     return "That's great experience! Now, let me ask you a common interview question: Can you describe a challenging problem you faced in a recent project and how you solved it?";
  //   } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
  //     return "Hi there! What type of position are you interviewing for? I can help you prepare with role-specific questions and feedback.";
  //   } else {
  //     return "That's interesting! Let's dig deeper into this topic with a common interview question: How do you approach learning new technologies or frameworks when they're required for a project?";
  //   }
  // };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewInterview = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: "Hello! I'm your interview preparation assistant. What position are you preparing for today?",
        timestamp: new Date(),
      },
    ]);
    setCurrentInterview(null);
    setTypewriterText('');
    setIsTypewriterActive(false);
    hasGeneratedInitialQuestionRef.current = false; // Reset the flag for new interview
  };

  if (loading) {
    return (
      <div className="interview-loading">
        <div className="loading-spinner"></div>
        <p>Loading interview session...</p>
      </div>
    );
  }

  return (
    <div className="interview-container">
      {/* Left Sidebar */}
      <div className={`interview-sidebar ${leftSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar toggle button */}
        <div className="sidebar-toggle-btn" onClick={toggleLeftSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
          </svg>
        </div>
        
        <div className="sidebar-header">
          <img src={icon} alt="AptWise Icon" className="sidebar-logo" />
          <span className="sidebar-title">AptWise</span>
        </div>
        
        <button className="new-chat-btn" onClick={startNewInterview}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
            <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8zm0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
          </svg>
          {!leftSidebarCollapsed && <span className="btn-text">New Interview</span>}
        </button>
        
        <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4zM3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707zM2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10zm9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5zm.754-4.246a.389.389 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.389.389 0 0 0-.029-.518z"/>
            <path fill-rule="evenodd" d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A7.988 7.988 0 0 1 0 10zm8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3z"/>
          </svg>
          {!leftSidebarCollapsed && <span className="btn-text">Dashboard</span>}
        </button>
        
        <div className="interview-history">
          <h3>Recent Interviews</h3>
          <div className="history-items">
            <div className="history-item">
              <span>Frontend Developer Interview</span>
              <span className="history-date">July 10</span>
            </div>
            <div className="history-item">
              <span>React Technical Interview</span>
              <span className="history-date">July 8</span>
            </div>
            <div className="history-item">
              <span>System Design Practice</span>
              <span className="history-date">July 5</span>
            </div>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email || 'user@example.com'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`interview-main ${leftSidebarCollapsed ? 'left-expanded' : ''}`}>
        {/* Chat Header */}
        <div className="interview-header">
          <div className="header-left">
            {leftSidebarCollapsed && (
              <button className="mobile-menu-btn" onClick={toggleLeftSidebar}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </button>
            )}
            <h2>{currentInterview ? currentInterview.title : 'Interview Session'}</h2>
          </div>
          <div className="interview-actions">
            <button className="action-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3z"/>
              </svg>
              End Interview
            </button>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="interview-messages custom-scrollbar" ref={chatContainerRef}>
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'assistant' ? (
                  <img src={icon} alt="Assistant" className="assistant-avatar" />
                ) : (
                  <div className="user-message-avatar">{user?.name?.charAt(0) || 'U'}</div>
                )}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">
                    {message.role === 'assistant' ? 'AptWise' : user?.name || 'You'}
                  </span>
                </div>
                <div className="message-text">{message.content}</div>
              </div>
            </div>
          ))}
          
          {/* Typewriter effect message */}
          {isTypewriterActive && (
            <div className="message assistant">
              <div className="message-avatar">
                <img src={icon} alt="Assistant" className="assistant-avatar" />
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">AptWise</span>
                </div>
                <div className="message-text">
                  {typewriterText}
                  <span className="typewriter-cursor">|</span>
                </div>
              </div>
            </div>
          )}
          
          {isTyping && !isTypewriterActive && (
            <div className="message assistant typing">
              <div className="message-avatar">
                <img src={icon} alt="Assistant" className="assistant-avatar" />
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">AptWise</span>
                </div>
                <div className="message-text">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Chat Input */}
        <div className="interview-input-container">
          <div className="interview-input-wrapper">
            <textarea
              className="interview-input custom-scrollbar"
              placeholder="Type your message here..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button 
              className="send-button" 
              onClick={handleSendMessage}
              disabled={inputMessage.trim() === ''}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
              </svg>
            </button>
          </div>
          <div className="interview-footer">
            <p>AptWise Interview Assistant uses AI to simulate realistic interview questions and provide feedback.</p>
          </div>
        </div>
      </div>
      
      {/* We no longer need a floating button since we have icons in the collapsed sidebar */}
    </div>
  );
};

export default Interview;
