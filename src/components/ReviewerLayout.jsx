import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore.js';
import NotificationBell from './NotificationBell.jsx';
import './ReviewerLayout.css';

const ReviewerLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="reviewer-layout">
      <nav className="reviewer-navbar">
        <div className="navbar-brand">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="url(#reviewGradient)" />
            <path d="M24 12L33 18V30L24 36L15 30V18L24 12Z" fill="white" />
            <defs>
              <linearGradient id="reviewGradient" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="hsl(200, 84%, 54%)" />
                <stop offset="100%" stopColor="hsl(220, 70%, 60%)" />
              </linearGradient>
            </defs>
          </svg>
          <span className="brand-text">Review Đề Tài</span>
        </div>

        <div className="navbar-menu">
          <Link to="/reviewer" className="nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Trang chủ
          </Link>
          <Link to="/reviewer/theses" className="nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Đề Tài Review
          </Link>
        </div>

        <NotificationBell />

        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'R'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'Reviewer'}</div>
              <div className="user-role">Giảng viên Review</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="reviewer-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ReviewerLayout;
