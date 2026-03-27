import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore.js';
import notificationService from '../services/notificationService.js';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleUserDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
            <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" fill="white" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="hsl(250, 84%, 54%)" />
                <stop offset="100%" stopColor="hsl(280, 70%, 60%)" />
              </linearGradient>
            </defs>
          </svg>
          <span>Thesis Portal</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/home" className="navbar-link">Trang chủ</Link>
          <Link to="/theses" className="navbar-link">Đề tài</Link>
          
          <NotificationBell />

          <div className="navbar-user" onClick={toggleUserDropdown}>
            <div className="navbar-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="navbar-username">{user?.name || 'User'}</span>
            
            {showDropdown && (
              <div className="navbar-dropdown">
                <div className="navbar-dropdown-item">
                  <span className="navbar-dropdown-label">Role:</span>
                  <span className="navbar-dropdown-value">{user?.role || 'Student'}</span>
                </div>
                <div className="navbar-dropdown-divider"></div>
                <button onClick={handleLogout} className="navbar-dropdown-button">
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
