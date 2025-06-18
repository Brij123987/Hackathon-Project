import './DropDownPanel.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../userSystem/AuthContext';

function DropDownPanel({ onClose }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    // Close the menu after navigation
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    // Close the menu after logout
    if (onClose) onClose();
  };

  const handleMenuItemClick = (action, path) => {
    if (action) {
      action();
    } else if (path) {
      handleNavigation(path);
    }
    // Close menu for any menu item click (including welcome item)
    if (onClose) onClose();
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
        { label: `Welcome, User`, icon: '👤', action: null, show: true, isWelcome: true },
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
            onClick={() => handleMenuItemClick(null, item.path)}
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
            onClick={() => handleMenuItemClick(item.action, item.path)}
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