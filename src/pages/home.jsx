import React from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import Button from '../components/Button';
import Navbar from '../components/Navbar';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Top Navigation Bar */}
      <Navbar />

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