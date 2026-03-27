import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore.js';
import notificationService from '../services/notificationService.js';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(user.id || user._id);
      const notifs = Array.isArray(data) ? data : data.data || [];
      setNotifications(notifs);
      
      const count = await notificationService.getUnreadCount(user.id || user._id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications(); // Refresh list to get accurate state
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user.id || user._id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const toggleNotiDropdown = () => {
    setShowNotiDropdown(!showNotiDropdown);
    if (showDropdown) setShowDropdown(false);
  };

  const toggleUserDropdown = () => {
    setShowDropdown(!showDropdown);
    if (showNotiDropdown) setShowNotiDropdown(false);
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
          
          {user && (
            <div className="navbar-notification">
              <div className="navbar-bell" onClick={toggleNotiDropdown}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                  <span className="navbar-badge">{unreadCount}</span>
                )}
              </div>
              
              {showNotiDropdown && (
                <div className="navbar-dropdown noti-dropdown">
                  <div className="noti-header">
                    <span>Thông báo</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllAsRead} className="noti-mark-all">
                        Đánh dấu đã đọc tất cả
                      </button>
                    )}
                  </div>
                  <div className="noti-list">
                    {notifications.length > 0 ? (
                      notifications.map(noti => (
                        <div 
                          key={noti.id || noti._id} 
                          className={`noti-item ${!noti.isRead ? 'unread' : ''}`}
                          onClick={() => !noti.isRead && handleMarkAsRead(noti.id || noti._id)}
                        >
                          <div className="noti-content">{noti.message || noti.content || noti.title}</div>
                          <div className="noti-time">
                            {new Date(noti.createdAt || noti.timestamp || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="noti-empty">Không có thông báo nào</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

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
