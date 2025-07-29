import React, { useEffect } from 'react';
import './home.css';
import Button from '../components/Button';
import Navbar from '../components/Navbar';

const Home = () => {
  // Add and remove body class to control scrolling
  useEffect(() => {
    document.body.classList.add('home-page-active');
    return () => {
      document.body.classList.remove('home-page-active');
    };
  }, []);

  return (
    <div className="home-container">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Nail Every Interview with Confidence</h1>
          <p>
            AptWise is your AI-powered prep companion — personalized, precise, and ready anytime.
          </p>
          <div className="hero-buttons">
            <Button type="secondary" text="Try Demo" />
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;