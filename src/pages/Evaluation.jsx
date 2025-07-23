import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './Evaluation.css';
import Button from '../components/Button';
import apiService from '../services/api';
import icon from '../assets/icon.svg';

const Evaluation = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const location = useLocation();
  
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get the chat ID from params or from location state
  const getChatId = () => {
    if (chatId) return chatId;
    
    return location.state?.chatId;
  };
  
  const currentChatId = getChatId();
  
  useEffect(() => {
    const fetchEvaluation = async () => {
      if (!currentChatId) {
        setError('No interview ID was provided');
        setLoading(false);
        return;
      }
      
      try {
        const data = await apiService.getEvaluation(currentChatId);
        setEvaluation(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching evaluation:', err);
        setError('Failed to load your evaluation. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchEvaluation();
  }, [currentChatId]);
  
  const goToDashboard = () => {
    navigate('/interview-dashboard');
  };
  
  const startNewInterview = () => {
    navigate('/interview-dashboard');
  };
  
  if (loading) {
    return (
      <div className="evaluation-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your interview performance...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="evaluation-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <Button onClick={goToDashboard}>Return to Dashboard</Button>
      </div>
    );
  }
  
  if (!evaluation) {
    return (
      <div className="evaluation-error">
        <h2>Evaluation Not Found</h2>
        <p>We couldn't find the evaluation for this interview.</p>
        <Button onClick={goToDashboard}>Return to Dashboard</Button>
      </div>
    );
  }
  
  // Helper function to render score as a percentage
  const renderScore = (score) => {
    return Math.round(score * 100) + '%';
  };
  
  // Helper function to create a visual bar for scores
  const renderScoreBar = (score) => {
    const percentage = Math.round(score * 100);
    return (
      <div className="score-bar-container">
        <div 
          className="score-bar" 
          style={{ width: `${percentage}%`, backgroundColor: getScoreColor(score) }}
        ></div>
        <span className="score-percentage">{percentage}%</span>
      </div>
    );
  };
  
  // Get appropriate color for score
  const getScoreColor = (score) => {
    if (score >= 0.8) return '#4CAF50'; // Green for high scores
    if (score >= 0.6) return '#FFC107'; // Yellow for medium scores
    return '#FF5252'; // Red for low scores
  };

  return (
    <div className="evaluation-container">
      <div className="evaluation-header">
        <div className="header-left">
          <img src={icon} alt="AptWise" className="evaluation-logo" />
          <h1>Interview Evaluation</h1>
        </div>
        <div className="header-actions">
          <Button onClick={startNewInterview}>New Interview</Button>
          <Button onClick={goToDashboard}>Dashboard</Button>
        </div>
      </div>
      
      <div className="evaluation-content">
        <div className="evaluation-summary">
          <div className="overall-score-container">
            <h2>Overall Performance</h2>
            <div className="overall-score">
              <div className="score-circle" style={{ 
                background: `conic-gradient(
                  ${getScoreColor(evaluation.overallScore)} ${evaluation.overallScore * 360}deg,
                  #e9ecef 0deg
                )` 
              }}>
                <span>{renderScore(evaluation.overallScore)}</span>
              </div>
            </div>
            <p className="evaluation-date">
              Evaluation completed on {new Date(evaluation.completedAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="summary-text">
            <h3>Summary</h3>
            <p>{evaluation.summary}</p>
          </div>
        </div>
        
        <div className="strengths-weaknesses">
          <div className="strengths">
            <h3>Strengths</h3>
            <ul>
              {evaluation.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          
          <div className="areas-to-improve">
            <h3>Areas to Improve</h3>
            <ul>
              {evaluation.areasToImprove.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="topic-scores">
          <h3>Performance by Topic</h3>
          <div className="topic-list">
            {evaluation.topicScores.map((topic) => (
              <div key={topic.name} className="topic-item">
                <div className="topic-header">
                  <h4>{topic.name}</h4>
                  <span>{renderScore(topic.score)}</span>
                </div>
                {renderScoreBar(topic.score)}
                {topic.subtopics && topic.subtopics.length > 0 && (
                  <div className="subtopics">
                    {topic.subtopics.map((subtopic) => (
                      <div key={subtopic.name} className="subtopic-item">
                        <div className="subtopic-header">
                          <h5>{subtopic.name}</h5>
                          <span>{renderScore(subtopic.score)}</span>
                        </div>
                        {renderScoreBar(subtopic.score)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="detailed-analysis">
          <h3>Detailed Analysis</h3>
          <div className="analysis-text">
            {evaluation.detailedAnalysis.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
        
        <div className="action-plan">
          <h3>Recommended Action Plan</h3>
          <ol>
            {evaluation.actionItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </div>
      </div>
      
      <div className="evaluation-footer">
        <p>This evaluation was generated by AptWise's AI interview analysis system.</p>
        <div className="footer-actions">
          <Button onClick={startNewInterview}>Start New Interview</Button>
          <Button onClick={() => navigate('/interview-dashboard')}>View All Interviews</Button>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
