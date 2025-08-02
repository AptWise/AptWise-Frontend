import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import icon from '../assets/icon.svg';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.full_name) return user.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserAvatar = () => {
    // Return first letter of name or email as avatar
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate('/')}>
        <img src={icon} alt="AptWise Icon" className="logo-icon" />
        <span className="logo-text">AptWise</span>
      </div>
      
      <div className="nav-links">
        <a 
          href="/" 
          className={`nav-link ${isActiveLink('/') ? 'active' : ''}`}
        >
          Home
        </a>
        <a 
          href="/features" 
          className={`nav-link ${isActiveLink('/features') ? 'active' : ''}`}
        >
          Features
        </a>
        <a 
          href="#" 
          className="nav-link"
        >
          Try Demo
        </a>
        <a 
          href="/dashboard" 
          className={`nav-link ${isActiveLink('/dashboard') || isActiveLink('/interview') ? 'active' : ''}`}
        >
          Dashboard
        </a>
      </div>
      
      <div className="nav-actions">
        {loading ? (
          <div className="user-menu">
            <div className="user-badge" style={{ cursor: 'default', opacity: '0.7' }}>
              <div className="relative">
                <div className="user-avatar">
                  U
                </div>
                <div className="user-status-indicator"></div>
              </div>
              <span className="user-name">Loading...</span>
            </div>
          </div>
        ) : user ? (
          <div className="user-menu" ref={dropdownRef}>
            <div 
              className="user-badge" 
              onClick={toggleDropdown}
              style={{ cursor: 'pointer' }}
            >
              <div className="relative">
                {user.profile_picture_url ? (
                  <img
                    src={user.profile_picture_url}
                    alt="Profile"
                    className="user-avatar-img"
                  />
                ) : (
                  <div className="user-avatar">
                    {getUserAvatar()}
                  </div>
                )}
                <div className="user-status-indicator"></div>
              </div>
              <span className="user-name">{getUserDisplayName()}</span>
            </div>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {user.profile_picture_url ? (
                      <img
                        src={user.profile_picture_url}
                        alt="Profile"
                        className="dropdown-avatar-img"
                      />
                    ) : (
                      <div className="dropdown-avatar-circle">
                        {getUserAvatar()}
                      </div>
                    )}
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-name">{getUserDisplayName()}</span>
                    <span className="dropdown-email">{user.email}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button className="btn login" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="btn get-started" onClick={() => navigate('/Registration')}>
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
