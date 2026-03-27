import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../stores/authStore.js';
import notificationService from '../services/notificationService.js';
import './NotificationBell.css';

const NotificationBell = () => {
    const { user } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount(user.id || user._id);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications(user.id || user._id);
            const notifs = Array.isArray(data) ? data : data.data || [];
            setNotifications(notifs);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleToggle = () => {
        const newStatus = !isOpen;
        setIsOpen(newStatus);
        if (newStatus) {
            fetchNotifications();
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            // Optimistic update or refresh
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead(user.id || user._id);
            fetchNotifications();
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    if (!user) return null;

    return (
        <div className="notification-bell-wrapper" ref={dropdownRef}>
            <button className="notification-bell-btn" onClick={handleToggle} title="Thông báo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="noti-header">
                        <h3>Thông báo</h3>
                        {unreadCount > 0 && (
                            <button className="noti-mark-all" onClick={handleMarkAllAsRead}>
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>
                    <div className="noti-list">
                        {notifications.length > 0 ? (
                            notifications.map((noti) => (
                                <div
                                    key={noti.id || noti._id}
                                    className={`noti-item ${!noti.isRead ? 'unread' : ''}`}
                                    onClick={() => !noti.isRead && handleMarkAsRead(noti.id || noti._id)}
                                >
                                    <div className="noti-content">{noti.message || noti.content}</div>
                                    <div className="noti-time">
                                        {new Date(noti.createdAt || noti.timestamp || Date.now()).toLocaleString('vi-VN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            day: '2-digit',
                                            month: '2-digit',
                                        })}
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
    );
};

export default NotificationBell;
