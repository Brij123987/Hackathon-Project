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
        <div className="hamburger" onClick={toggleDropdown}>
          <div className={`bar ${isOpen ? 'active' : ''}`} />
          <div className={`bar ${isOpen ? 'active' : ''}`} />
          <div className={`bar ${isOpen ? 'active' : ''}`} />
        </div>
        {isOpen && children[1]} {/* DropDownPanel */}
      </div>
    </header>
  );
}

export default Header;