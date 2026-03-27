import axiosInstance from '../utils/axios.js';
import { API_ENDPOINTS } from '../config/api.config.js';

/**
 * Notification Service
 * Handles all notification-related API calls
 */
const notificationService = {
  /**
   * Get all notifications for a user
   * @param {number|string} userId 
   * @returns {Promise} List of notifications
   */
  async getNotifications(userId) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATION.LIST(userId));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all unread notifications for a user
   * @param {number|string} userId 
   * @returns {Promise} List of unread notifications
   */
  async getUnreadNotifications(userId) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATION.UNREAD(userId));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get unread notification count for a user
   * @param {number|string} userId 
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATION.UNREAD_COUNT(userId));
      // Assuming response.data returns the count directly or in an object like { count: 5 }
      return typeof response.data === 'number' ? response.data : response.data.count || 0;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark a notification as read
   * @param {number|string} id 
   * @returns {Promise}
   */
  async markAsRead(id) {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.NOTIFICATION.MARK_READ(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark all notifications as read for a user
   * @param {number|string} userId 
   * @returns {Promise}
   */
  async markAllAsRead(userId) {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.NOTIFICATION.MARK_ALL_READ(userId));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default notificationService;
