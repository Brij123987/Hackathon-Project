import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount and when storage changes
  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      // You can decode the token to get user info if needed
      setUser({ token });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === null) {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for same-tab logout
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const login = (token, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem('authToken', token);
      sessionStorage.removeItem('authToken');
    } else {
      sessionStorage.setItem('authToken', token);
      localStorage.removeItem('authToken');
    }
    
    setIsAuthenticated(true);
    setUser({ token });
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuthStatus
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