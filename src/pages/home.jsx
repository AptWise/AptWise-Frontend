import React from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import icon from '../assets/icon.svg';
import Button from '../components/Button';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="logo">
          <img src={icon} alt="AptWise Icon" className="logo-icon" />
          <span className="logo-text">AptWise</span>
        </div>
        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">Try Demo</a>
          <a href="#">About</a>
        </div>
        <div className="nav-actions">
          <button className="btn login" onClick={() => navigate('/login')}>Login</button>
          <button className="btn get-started">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Nail Every Interview with Confidence</h1>
          <p>
            AptWise is your AI-powered prep companion — personalized, precise, and ready anytime.
          </p>
          <div className="hero-buttons">
            <Button type="primary" text="Try Demo" />
            <Button type="secondary" text="Explore Features" onClick={() => navigate('/login')} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;