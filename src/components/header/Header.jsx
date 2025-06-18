import React, { useState, useEffect, useRef } from 'react';
import './Header.css';

function Header({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    // Cleanup event listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  return (
    <header className="header">
      <div className="left">
        {children[0]} {/* Logo */}
      </div>

      <div className="right" ref={dropdownRef}>
        <button 
          ref={buttonRef}
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