import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/Registration" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/interview-dashboard" element={<InterviewDashboard />} />
      <Route path="/interview" element={<Interview />} />
      <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
      <Route path="/auth/github/callback" element={<GitHubCallback />} />
      <Route path="/test-linkedin" element={<LinkedInTest />} />
      <Route path="/test-github" element={<GitHubTest />} />
    </Routes>
  );
};

export default App;