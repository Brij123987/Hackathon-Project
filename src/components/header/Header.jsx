import React, { useState } from 'react';
import './Header.css';

function Header({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="header">
      <div className="left">
        {children[0]} {/* Logo */}
      </div>

      <div className="right">
        <div className="hamburger" onClick={toggleDropdown}>
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </div>
        {isOpen && children[1]} {/* DropDownPanel */}
      </div>
    </div>
  );
}

export default Header;
