import React, { useState } from 'react';
import './Header.css';

function Header({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <header className="header">
      <div className="left">
        {children[0]} {/* Logo */}
      </div>

      <div className="right">
        <button 
          className={`menu-button ${isOpen ? 'active' : ''}`} 
          onClick={toggleDropdown}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <div className="menu-icon">
            <div className="menu-line" />
            <div className="menu-line" />
            <div className="menu-line" />
          </div>
        </button>
        {isOpen && children[1]} {/* DropDownPanel */}
      </div>
    </header>
  );
}

export default Header;