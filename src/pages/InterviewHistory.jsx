import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import apiService from '../services/api';
import './InterviewHistory.css';

const InterviewHistory = () => {
  const navigate = useNavigate();
  const { _user } = useContext(AuthContext);
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('evaluation');
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingInterview, setDeletingInterview] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoadingInterviews(true);
      const interviewsData = await apiService.getUserInterviews();
      setInterviews(interviewsData);
    } catch (error) {
      console.error('Error loading interviews:', error);
      setError('Failed to load interviews');
    } finally {
      setLoadingInterviews(false);
    }
  };

  const handleInterviewSelect = async (interview) => {
    if (selectedInterview?.id === interview.id) {
      return; // Already selected
    }

    setSelectedInterview(interview);
    setActiveTab('evaluation'); // Default to evaluation tab
    setLoadingEvaluation(true);
    setLoadingChat(true);
    setEvaluation(null);
    setChatMessages([]);

    // Load evaluation
    try {
      const evaluationData = await apiService.getEvaluationForInterview(interview.id);
      
      // Parse the evaluation text if it's JSON
      let parsedEvaluation;
      try {
        parsedEvaluation = JSON.parse(evaluationData.evaluation_text);
      } catch (e) {
        console.warn('Evaluation text is not JSON:', e);
        // If it's not JSON, treat it as plain text
        parsedEvaluation = { raw_text: evaluationData.evaluation_text };
      }
      
      setEvaluation(parsedEvaluation);
    } catch (error) {
      console.error('Error loading evaluation:', error);
      setEvaluation(null);
    } finally {
      setLoadingEvaluation(false);
    }

    // Load chat messages
    try {
      const interviewData = await apiService.getInterviewById(interview.id);
      if (interviewData && interviewData.interview_text) {
        const parsedMessages = parseInterviewText(interviewData.interview_text);
        setChatMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      setChatMessages([]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Parse interview text into structured messages
  const parseInterviewText = (interviewText) => {
    const lines = interviewText.split('\n');
    const messages = [];
    let messageId = 1;
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      if (line.startsWith('user: ')) {
        messages.push({
          id: messageId++,
          role: 'user',
          content: line.substring(6),
          timestamp: new Date(),
        });
      } else if (line.startsWith('assistant: ')) {
        messages.push({
          id: messageId++,
          role: 'assistant',
          content: line.substring(11),
          timestamp: new Date(),
        });
      }
    }
    
    return messages;
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'delete') {
      setShowDeleteModal(true);
    }
    
    // Scroll to top of content when switching tabs
    const tabContent = document.querySelector('.tab-content');
    if (tabContent) {
      tabContent.scrollTop = 0;
    }
  };

  // Handle delete interview
  const handleDeleteInterview = async () => {
    if (!selectedInterview) return;

    try {
      setDeletingInterview(true);
      
      // Delete the interview (this should also delete the evaluation)
      await apiService.deleteInterview(selectedInterview.id);
      
      // Remove from interviews list
      setInterviews(prev => prev.filter(interview => interview.id !== selectedInterview.id));
      
      // Reset selected interview
      setSelectedInterview(null);
      setEvaluation(null);
      setChatMessages([]);
      setActiveTab('evaluation');
      
      setShowDeleteModal(false);
      
    } catch (error) {
      console.error('Error deleting interview:', error);
      alert('Failed to delete interview. Please try again.');
    } finally {
      setDeletingInterview(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderChatContent = () => {
    if (loadingChat) {
      return (
        <div className="chat-loading">
          <div className="loading-spinner"></div>
          <p>Loading conversation...</p>
        </div>
      );
    }

    if (!chatMessages || chatMessages.length === 0) {
      return (
        <div className="no-chat">
          <h3>No Conversation Available</h3>
          <p>No conversation history found for this interview.</p>
        </div>
      );
    }

    return (
      <div className="chat-content">
        <div className="chat-messages">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role}`}
            >
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEvaluationContent = () => {
    if (loadingEvaluation) {
      return (
        <div className="evaluation-loading">
          <div className="loading-spinner"></div>
          <p>Loading evaluation...</p>
        </div>
      );
    }

    if (!evaluation) {
      return (
        <div className="no-evaluation">
          <h3>No Evaluation Available</h3>
          <p>No evaluation found for this interview.</p>
        </div>
      );
    }

    // If it's a structured evaluation
    if (evaluation.overall_score) {
      return (
        <div className="evaluation-content">
          <div className="evaluation-header">
            <h3>Interview Evaluation</h3>
            <div className="overall-score">
              <span className="score-label">Overall Score:</span>
              <span className="score-value">{evaluation.overall_score}/100</span>
              <span className="grade">{evaluation.interview_grade}</span>
            </div>
          </div>

          <div className="evaluation-section">
            <h4>Performance Summary</h4>
            <p>{evaluation.performance_summary}</p>
          </div>

          <div className="evaluation-grid">
            <div className="evaluation-item">
              <h5>Technical Competency</h5>
              <div className="score">{evaluation.technical_competency?.score}/100</div>
              <p>{evaluation.technical_competency?.feedback}</p>
            </div>

            <div className="evaluation-item">
              <h5>Communication Skills</h5>
              <div className="score">{evaluation.communication_skills?.score}/100</div>
              <p>{evaluation.communication_skills?.feedback}</p>
            </div>

            <div className="evaluation-item">
              <h5>Problem Solving</h5>
              <div className="score">{evaluation.problem_solving?.score}/100</div>
              <p>{evaluation.problem_solving?.feedback}</p>
            </div>

            <div className="evaluation-item">
              <h5>Cultural Fit</h5>
              <div className="score">{evaluation.cultural_fit?.score}/100</div>
              <p>{evaluation.cultural_fit?.feedback}</p>
            </div>
          </div>

          <div className="evaluation-section">
            <h4>Strengths</h4>
            <ul>
              {evaluation.strengths?.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>

          <div className="evaluation-section">
            <h4>Areas for Improvement</h4>
            <ul>
              {evaluation.areas_for_improvement?.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>

          {evaluation.detailed_feedback && (
            <div className="evaluation-section">
              <h4>Detailed Feedback</h4>
              <div className="feedback-subsection">
                <h5>Positive Highlights</h5>
                <ul>
                  {evaluation.detailed_feedback.positive_highlights?.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              </div>
              <div className="feedback-subsection">
                <h5>Improvement Suggestions</h5>
                <ul>
                  {evaluation.detailed_feedback.improvement_suggestions?.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="evaluation-section">
            <h4>Next Steps</h4>
            <ul>
              {evaluation.next_steps?.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    // If it's raw text
    return (
      <div className="evaluation-content">
        <h3>Interview Evaluation</h3>
        <div className="raw-evaluation">
          <pre>{evaluation.raw_text}</pre>
        </div>
      </div>
    );
  };

  const renderDeleteModal = () => {
    if (!showDeleteModal) return null;

    return (
      <div className="delete-modal-overlay">
        <div className="delete-modal">
          <h3>Delete Interview</h3>
          <p>
            Are you sure you want to delete "{selectedInterview?.title}"?
          </p>
          <p className="warning-text">
            This will permanently delete both the interview conversation and evaluation. 
            This action cannot be undone.
          </p>
          <div className="modal-actions">
            <button 
              className="btn-cancel"
              onClick={() => {
                setShowDeleteModal(false);
                setActiveTab('evaluation');
              }}
              disabled={deletingInterview}
            >
              Cancel
            </button>
            <button 
              className="btn-delete"
              onClick={handleDeleteInterview}
              disabled={deletingInterview}
            >
              {deletingInterview ? 'Deleting...' : 'Delete Interview'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'evaluation':
        return renderEvaluationContent();
      case 'interview':
        return renderChatContent();
      default:
        return renderEvaluationContent();
    }
  };

  return (
    <div className="interview-history-container">
      <div className="history-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          Back to Dashboard
        </button>
        <h1>Interview History & Evaluations</h1>
      </div>

      <div className="history-content">
        <div className="interviews-sidebar">
          <h2>Your Interviews</h2>
          {loadingInterviews ? (
            <div className="loading">Loading interviews...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : interviews.length === 0 ? (
            <div className="empty-state">
              <p>No interviews found.</p>
              <button 
                className="start-interview-btn"
                onClick={() => navigate('/dashboard')}
              >
                Start Your First Interview
              </button>
            </div>
          ) : (
            <div className="interviews-list">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className={`interview-item ${selectedInterview?.id === interview.id ? 'selected' : ''}`}
                  onClick={() => handleInterviewSelect(interview)}
                >
                  <h3>{interview.title}</h3>
                  <p className="interview-date">{formatDate(interview.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="main-panel">
          {!selectedInterview ? (
            <div className="no-selection">
              <h3>No interview selected</h3>
              <p>Select an interview from the left panel to view its details.</p>
            </div>
          ) : (
            <div className="interview-details">
              <div className="interview-header-info">
                <h2>{selectedInterview.title}</h2>
                <p className="interview-date">Interview Date: {formatDate(selectedInterview.created_at)}</p>
              </div>
              
              {/* Tabs */}
              <div className="tabs-container">
                <div className="tabs">
                  <button 
                    className={`tab ${activeTab === 'evaluation' ? 'active' : ''}`}
                    onClick={() => handleTabChange('evaluation')}
                  >
                    📊 Evaluation
                  </button>
                  <button 
                    className={`tab ${activeTab === 'interview' ? 'active' : ''}`}
                    onClick={() => handleTabChange('interview')}
                  >
                    💬 Interview Chat
                  </button>
                  <button 
                    className={`tab delete-tab`}
                    onClick={() => handleTabChange('delete')}
                  >
                    🗑️ Delete Interview
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {renderTabContent()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {renderDeleteModal()}
    </div>
  );
};

export default InterviewHistory;
