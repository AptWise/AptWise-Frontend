import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Features.css';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const Features = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="features-page-container">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Features Hero Section */}
      <section className="features-hero">
        <div className="features-hero-content">
          <h1 className="features-hero-title">Powerful Features</h1>
          <p className="features-hero-subtitle">
            Discover the comprehensive tools and capabilities that make AptWise your ultimate interview preparation companion.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5V9H9V3.5L15 4V2.5C15 1.67 14.33 1 13.5 1H10.5C9.67 1 9 1.67 9 2.5V4L3 3.5V9H21ZM21 10H3V21C3 21.55 3.45 22 4 22H20C20.55 22 21 21.55 21 21V10Z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">AI-Powered Mock Interviews</h3>
              <p className="feature-description">Experience realistic interview scenarios with our advanced AI that adapts to your responses and provides intelligent follow-up questions. Our AI interviewer simulates real-world interview conditions to help you practice effectively.</p>
              <div className="card-glow"></div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">Real-Time Performance Analytics</h3>
              <p className="feature-description">Get instant feedback on your communication skills, technical accuracy, and confidence levels with detailed performance metrics. Track your progress across multiple dimensions and identify areas for improvement.</p>
              <div className="card-glow"></div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">Personalized Learning Path</h3>
              <p className="feature-description">Receive customized improvement plans based on your performance, targeting specific skills and knowledge gaps. Our AI creates tailored learning journeys that adapt to your progress and career goals.</p>
              <div className="card-glow"></div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">Comprehensive Progress Tracking</h3>
              <p className="feature-description">Monitor your improvement over time with detailed analytics, skill assessments, and interview history tracking. Visualize your growth with interactive charts and performance trends.</p>
              <div className="card-glow"></div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">Industry-Specific Scenarios</h3>
              <p className="feature-description">Practice with tailored interview questions and scenarios specific to your target industry and role requirements. From tech startups to finance, we cover diverse industry-specific interview patterns.</p>
              <div className="card-glow"></div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.08 5.74-.08 5.74s-2.05-1.35-4.56-1.35-4.56 1.35-4.56 1.35-.07-4.16-.08-5.74c1.69-.83 3.33-.83 4.64-.83s2.95 0 4.64.83z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">Expert Feedback & Tips</h3>
              <p className="feature-description">Access professional insights and expert recommendations to refine your interview technique and boost your confidence. Learn from industry veterans and successful candidates.</p>
              <div className="card-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="features-cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Master Your Next Interview?</h2>
          <p className="cta-description">
            Join thousands of candidates who have improved their interview skills with AptWise.
          </p>
          <div className="cta-buttons">
            {user ? (
              <button className="btn get-started-cta" onClick={() => navigate('/dashboard')}>
                Start your interview prep
              </button>
            ) : (
              <>
                <button className="btn get-started-cta" onClick={() => navigate('/Registration')}>
                  Get Started Free
                </button>
                <button className="btn try-demo-cta" onClick={() => navigate('/login')}>
                  Try Demo
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
