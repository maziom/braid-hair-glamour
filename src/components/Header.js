import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="Header">
      <div className="logo">
        <Link to="/">Salon fryzjerski</Link>
      </div>
      <div className="hamburger" onClick={toggleMenu}>
        &#9776;
      </div>
      <nav className={menuOpen ? 'nav-open' : ''}>
        <Link to="/" onClick={toggleMenu}>Strona główna</Link>
        <Link to="/contact" onClick={toggleMenu}>Skontaktuj się z nami</Link>
      </nav>
    </header>
  );
}

export default Header;
