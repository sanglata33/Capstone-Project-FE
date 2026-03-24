import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore.js';
import './SupervisorLayout.css'; // Mượn tạm CSS của Supervisor

const LecturerLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="supervisor-layout">
      <nav className="supervisor-navbar">
        <div className="navbar-brand">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="url(#navGradient)" />
            <path d="M24 12L33 18V30L24 36L15 30V18L24 12Z" fill="white" />
            <defs>
              <linearGradient id="navGradient" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="hsl(250, 84%, 54%)" />
                <stop offset="100%" stopColor="hsl(280, 70%, 60%)" />
              </linearGradient>
            </defs>
          </svg>
          <span className="brand-text">Cổng Giảng Viên</span>
        </div>

        <div className="navbar-menu">
          <Link to="/lecturer/dashboard" className="nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            Trang chủ
          </Link>
          <Link to="/lecturer/reviews" className="nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Chấm Đề Tài
          </Link>
          <Link to="/lecturer/history" className="nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Lịch Sử Đánh Giá
          </Link>
          <Link to="/lecturer/all-theses" className="nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Tra Cứu Đề Tài
          </Link>
          <Link to="/lecturer/stats" className="nav-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            Thống Kê Cá Nhân
          </Link>
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'L'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.fullName || user?.name || 'Giảng viên'}</div>
              <div className="user-role">Hội đồng Phản biện</div>
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

      <main className="supervisor-content">
        <Outlet />
      </main>
    </div>
  );
};

export default LecturerLayout;
