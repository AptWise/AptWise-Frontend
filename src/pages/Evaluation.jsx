import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Evaluation.css';
import Button from '../components/Button';
import apiService from '../services/api';
import icon from '../assets/icon.svg';

const Evaluation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get interview data from navigation state
  const interviewData = location.state?.interviewData;
  const conversationHistory = location.state?.conversationHistory;
  
  useEffect(() => {
    const performEvaluation = async () => {
      if (!interviewData || !conversationHistory) {
        setError('No interview data was provided for evaluation');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Starting evaluation with data:', { interviewData, conversationHistory });
        
        const evaluationRequest = {
          interview_data: interviewData,
          conversation_history: conversationHistory
        };
        
        const result = await apiService.evaluateInterview(evaluationRequest);
        
        if (result.success) {
          setEvaluation(result.evaluation);
        } else {
          setError(result.error || 'Evaluation failed');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error performing evaluation:', err);
        setError('Failed to evaluate your interview. Please try again later.');
        setLoading(false);
      }
    };
    
    performEvaluation();
  }, [interviewData, conversationHistory]);
  
  const goToDashboard = () => {
    navigate('/interview-dashboard');
  };
  
  const startNewInterview = () => {
    navigate('/interview-dashboard');
  };

  const goToHistory = () => {
    navigate('/interview-history');
  };
  
  if (loading) {
    return (
      <div className="evaluation-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your interview performance with AI...</p>
        <p className="loading-subtext">This may take a few moments...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="evaluation-error">
        <div className="error-content">
          <h2>Evaluation Failed</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={goToDashboard} className="btn-primary">Return to Dashboard</button>
            <button onClick={() => window.history.back()} className="btn-secondary">Go Back</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!evaluation) {
    return (
      <div className="evaluation-error">
        <div className="error-content">
          <h2>No Evaluation Available</h2>
          <p>We couldn't generate an evaluation for this interview.</p>
          <button onClick={goToDashboard} className="btn-primary">Return to Dashboard</button>
        </div>
      </div>
    );
  }
  
  // Helper function to get color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50'; // Green for high scores
    if (score >= 60) return '#FFC107'; // Yellow for medium scores
    return '#FF5252'; // Red for low scores
  };
  
  // Helper function to get grade color
  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return '#4CAF50';
    if (grade.startsWith('B')) return '#FFC107';
    if (grade.startsWith('C')) return '#FF9800';
    return '#FF5252';
  };

  return (
    <div className="evaluation-container">
      {/* Header */}
      <div className="evaluation-header">
        <div className="header-left">
          <img src={icon} alt="AptWise" className="evaluation-logo" />
          <div className="header-text">
            <h1>Interview Evaluation</h1>
            {interviewData?.company && interviewData?.role && (
              <p>{interviewData.company} - {interviewData.role}</p>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button onClick={startNewInterview} className="btn-primary">
            New Interview
          </button>
          <button onClick={goToHistory} className="btn-secondary">
            History
          </button>
          <button onClick={goToDashboard} className="btn-secondary">
            Dashboard
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="evaluation-content">
        {/* Overall Score Section */}
        <div className="score-overview">
          <div className="overall-score-card">
            <div className="score-circle-container">
              <div className="score-circle" style={{ 
                background: `conic-gradient(
                  ${getScoreColor(evaluation.final_score || evaluation.overall_score)} ${(evaluation.final_score || evaluation.overall_score) * 3.6}deg,
                  #e9ecef 0deg
                )` 
              }}>
                <div className="score-inner">
                  <span className="score-number">{evaluation.final_score || evaluation.overall_score}</span>
                  <span className="score-text">/ 100</span>
                </div>
              </div>
            </div>
            {evaluation.interview_grade && (
              <div className="grade-display">
                <span className="grade-label">Grade:</span>
                <span className="grade-value" style={{ color: getGradeColor(evaluation.interview_grade) }}>
                  {evaluation.interview_grade}
                </span>
              </div>
            )}
          </div>
          
          <div className="performance-summary">
            <h3>Performance Summary</h3>
            <p>{evaluation.overall_feedback || evaluation.performance_summary}</p>
          </div>
        </div>
        
        {/* Skill Performance Summary */}
        {evaluation.skill_performance_summary && Object.keys(evaluation.skill_performance_summary).length > 0 && (
          <div className="skill-performance">
            <h3>Skill Assessment</h3>
            <div className="skill-grid">
              {Object.entries(evaluation.skill_performance_summary).map(([skill, data]) => (
                <div key={skill} className="skill-item">
                  <div className="skill-header">
                    <h4>{skill}</h4>
                    <span className="skill-score">{data.score}/100</span>
                  </div>
                  <div className="skill-bar">
                    <div 
                      className="skill-fill" 
                      style={{ 
                        width: `${data.score}%`,
                        backgroundColor: getScoreColor(data.score)
                      }}
                    ></div>
                  </div>
                  <p className="skill-feedback">{data.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question-by-Question Breakdown */}
        {evaluation.detailed_breakdown && evaluation.detailed_breakdown.length > 0 && (
          <div className="question-breakdown">
            <h3>Question-by-Question Analysis</h3>
            <div className="breakdown-container">
              {evaluation.detailed_breakdown.map((item, index) => (
                <div key={index} className="question-card">
                  <div className="question-header">
                    <h4>Question {item.question_number}</h4>
                  </div>
                  <div className="question-content">
                    <p className="question-text"><strong>Q:</strong> {item.question}</p>
                    <p className="answer-text"><strong>Your Answer:</strong> {item.user_answer}</p>
                  </div>
                  <div className="evaluation-metrics">
                    <div className="metric">
                      <span className="metric-label">Correctness:</span>
                      <div className="metric-score-container">
                        <span className="metric-score" style={{ color: getScoreColor(item.evaluation?.correctness?.score || 0) }}>
                          {item.evaluation?.correctness?.score || 0}/100
                        </span>
                        <div className="metric-bar">
                          <div 
                            className="metric-fill" 
                            style={{ 
                              width: `${item.evaluation?.correctness?.score || 0}%`,
                              backgroundColor: getScoreColor(item.evaluation?.correctness?.score || 0)
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Completeness:</span>
                      <div className="metric-score-container">
                        <span className="metric-score" style={{ color: getScoreColor(item.evaluation?.completeness?.score || 0) }}>
                          {item.evaluation?.completeness?.score || 0}/100
                        </span>
                        <div className="metric-bar">
                          <div 
                            className="metric-fill" 
                            style={{ 
                              width: `${item.evaluation?.completeness?.score || 0}%`,
                              backgroundColor: getScoreColor(item.evaluation?.completeness?.score || 0)
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Confidence:</span>
                      <div className="metric-score-container">
                        <span className="metric-score" style={{ color: getScoreColor(item.evaluation?.confidence?.score || 0) }}>
                          {item.evaluation?.confidence?.score || 0}/100
                        </span>
                        <div className="metric-bar">
                          <div 
                            className="metric-fill" 
                            style={{ 
                              width: `${item.evaluation?.confidence?.score || 0}%`,
                              backgroundColor: getScoreColor(item.evaluation?.confidence?.score || 0)
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="evaluation-feedback">
                    {item.evaluation?.correctness?.feedback && (
                      <p><strong>Correctness:</strong> {item.evaluation.correctness.feedback}</p>
                    )}
                    {item.evaluation?.completeness?.feedback && (
                      <p><strong>Completeness:</strong> {item.evaluation.completeness.feedback}</p>
                    )}
                    {item.evaluation?.confidence?.feedback && (
                      <p><strong>Confidence:</strong> {item.evaluation.confidence.feedback}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legacy Detailed Scores (for backward compatibility) */}
        {evaluation.technical_competency && (
          <div className="detailed-scores">
            <h3>Detailed Assessment</h3>
            <div className="score-grid">
              <div className="score-item">
                <div className="score-header">
                  <h4>Technical Competency</h4>
                  <span className="score-value">{evaluation.technical_competency.score}/100</span>
                </div>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ 
                      width: `${evaluation.technical_competency.score}%`,
                      backgroundColor: getScoreColor(evaluation.technical_competency.score)
                    }}
                  ></div>
                </div>
                <p className="score-feedback">{evaluation.technical_competency.feedback}</p>
              </div>
              
              <div className="score-item">
                <div className="score-header">
                  <h4>Communication Skills</h4>
                  <span className="score-value">{evaluation.communication_skills.score}/100</span>
                </div>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ 
                      width: `${evaluation.communication_skills.score}%`,
                      backgroundColor: getScoreColor(evaluation.communication_skills.score)
                    }}
                  ></div>
                </div>
                <p className="score-feedback">{evaluation.communication_skills.feedback}</p>
              </div>
              
              <div className="score-item">
                <div className="score-header">
                  <h4>Problem Solving</h4>
                  <span className="score-value">{evaluation.problem_solving.score}/100</span>
                </div>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ 
                      width: `${evaluation.problem_solving.score}%`,
                      backgroundColor: getScoreColor(evaluation.problem_solving.score)
                    }}
                  ></div>
                </div>
                <p className="score-feedback">{evaluation.problem_solving.feedback}</p>
              </div>
              
              <div className="score-item">
                <div className="score-header">
                  <h4>Cultural Fit</h4>
                  <span className="score-value">{evaluation.cultural_fit.score}/100</span>
                </div>
                <div className="score-bar">
                  <div 
                    className="score-fill" 
                    style={{ 
                      width: `${evaluation.cultural_fit.score}%`,
                      backgroundColor: getScoreColor(evaluation.cultural_fit.score)
                    }}
                  ></div>
                </div>
                <p className="score-feedback">{evaluation.cultural_fit.feedback}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Strengths and Improvements */}
        <div className="feedback-section">
          <div className="feedback-grid">
            <div className="strengths-card">
              <h3>✅ Key Strengths</h3>
              <ul>
                {evaluation.strengths?.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
            
            <div className="improvements-card">
              <h3>🎯 Areas for Improvement</h3>
              <ul>
                {evaluation.areas_for_improvement?.map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Legacy Detailed Feedback (for backward compatibility) */}
        {evaluation.detailed_feedback && (
          <div className="detailed-feedback">
            <h3>Detailed Feedback</h3>
            
            <div className="feedback-subsection">
              <h4>🌟 Positive Highlights</h4>
              <ul>
                {evaluation.detailed_feedback.positive_highlights?.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
            
            <div className="feedback-subsection">
              <h4>💡 Improvement Suggestions</h4>
              <ul>
                {evaluation.detailed_feedback.improvement_suggestions?.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {evaluation.next_steps && evaluation.next_steps.length > 0 && (
          <div className="next-steps">
            <h3>🚀 Recommended Next Steps</h3>
            <ol>
              {evaluation.next_steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}
        
        {/* Footer Actions */}
        <div className="evaluation-footer">
          <div className="footer-actions">
            <button onClick={startNewInterview} className="btn-primary">
              Start New Interview
            </button>
            <button onClick={goToHistory} className="btn-secondary">
              View History
            </button>
            <button onClick={goToDashboard} className="btn-secondary">
              Return to Dashboard
            </button>
          </div>
          <p className="ai-disclaimer">
            This evaluation was generated using AI analysis. Results are for practice purposes only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
