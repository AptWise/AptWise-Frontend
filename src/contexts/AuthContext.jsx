import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
      const response = await apiService.login(credentials);
      // After successful login, refresh user data
      try {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to get user data after login:', error);
        // Set user from response if available
        if (response.user) {
          setUser(response.user);
        }
      }
      return response;
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      setUser(null);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    setUser,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
