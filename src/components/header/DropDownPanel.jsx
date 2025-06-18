import './DropDownPanel.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function DropDownPanel() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      // You can decode the token to get username if needed
      // For now, we'll use a placeholder
      setUsername('User');
    }
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUsername('');
    navigate('/');
  };

  const menuItems = [
    { label: 'Home', icon: '🏠', path: '/', show: true },
    { label: 'Track Earthquake', icon: '🌍', path: '/graphs', show: true },
    { label: 'Track Cyclone', icon: '🌪️', path: '/graphs', show: true },
    { label: 'About', icon: 'ℹ️', path: '/about', show: true },
    { label: 'Contact', icon: '📞', path: '/contact', show: true },
  ];

  const authItems = isAuthenticated 
    ? [
        { label: `Welcome, ${username}`, icon: '👤', action: null, show: true, isWelcome: true },
        { label: 'Dashboard', icon: '📊', path: '/dashboard', show: true },
        { label: 'Logout', icon: '🚪', action: handleLogout, show: true, isLogout: true },
      ]
    : [
        { label: 'Sign Up', icon: '📝', path: '/signup', show: true },
        { label: 'Login', icon: '🔑', path: '/login', show: true },
      ];

  return (
    <div className="dropdown-panel">
      <div className="dropdown-header">
        <h3>Menu</h3>
      </div>
      
      <ul className="dropdown-menu">
        {menuItems.filter(item => item.show).map((item, index) => (
          <li 
            key={index}
            onClick={() => handleNavigation(item.path)}
            className="menu-item"
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </li>
        ))}
        
        <div className="menu-divider"></div>
        
        {authItems.filter(item => item.show).map((item, index) => (
          <li 
            key={`auth-${index}`}
            onClick={item.action ? item.action : () => item.path && handleNavigation(item.path)}
            className={`menu-item ${item.isWelcome ? 'welcome-item' : ''} ${item.isLogout ? 'logout-item' : ''}`}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DropDownPanel;