import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/home';
import Login from './pages/Login';
import Register from './pages/Registration';
import LinkedInCallback from './pages/LinkedInCallback';
import GitHubCallback from './pages/GitHubCallback';
import Dashboard from './pages/Dashboard';
import LinkedInTest from './pages/LinkedInTest';
import GitHubTest from './pages/GitHubTest';
import Interview from './pages/Interview';
import InterviewDashboard from './pages/InterviewDashboard';
import InterviewHistory from './pages/InterviewHistory';
import Evaluation from './pages/Evaluation';

const App = () => {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Registration" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview-dashboard" element={<InterviewDashboard />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/interview-history" element={<InterviewHistory />} />
        <Route path="/evaluation" element={<Evaluation />} />
        <Route path="/evaluation/:chatId" element={<Evaluation />} />
        <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
        <Route path="/auth/github/callback" element={<GitHubCallback />} />
        <Route path="/test-linkedin" element={<LinkedInTest />} />
        <Route path="/test-github" element={<GitHubTest />} />
      </Routes>
    </div>
  );
};

export default App;