import React from 'react';
import '../Logo.png';
const Header = () => {
  return (
    <header className="app-header">
      <div className='header-logo-name'>
        <img src="Logo.png" alt="PSYCare Logo" className="logo" />
        <h1>PSYCare</h1>
      </div>
      <button className=" glass-btn logout-btn" onClick={() => {
        localStorage.removeItem('token');
        window.location.href = '/';
      }}>
        Logout
      </button>
    </header>
  );
};

export default Header;