// API Configuration
const API_CONFIG = {
  development: {
    baseURL: 'https://capstone-project-registration-tool.onrender.com',
    timeout: 10000,
  },
  staging: {
    baseURL: 'https://capstone-project-registration-tool.onrender.com',
    timeout: 10000,
  },
  production: {
    baseURL: 'https://capstone-project-registration-tool.onrender.com',
    timeout: 10000,
  },
};

// Get current environment
const ENV = import.meta.env.MODE || 'development';

// Export current config
export const apiConfig = API_CONFIG[ENV];

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    CURRENT_USER: '/api/auth/me', // If it exists, otherwise we decode token
    USERS: '/api/auth/users',
    USER_DETAIL: (id) => `/api/auth/users/${id}`,
    USERS_BY_ROLE: (role) => `/api/auth/users/role/${role}`,
    UPDATE_ROLE: (id) => `/api/auth/users/${id}/role`,
    DELETE_USER: (id) => `/api/auth/users/${id}`,
  },

  // Topic endpoints
  THESIS: {
    LIST: '/api/topics',
    CREATE: '/api/topics',
    DETAIL: (id) => `/api/topics/${id}`,
    UPDATE: (id) => `/api/topics/${id}`,
    DELETE: (id) => `/api/topics/${id}`,
    STUDENT_REGISTER: '/api/topics',
    STUDENT_RESUBMIT: (parentTopicId) => `/api/topics/${parentTopicId}/resubmit`,
    BY_SEMESTER: (semesterId) => `/api/topics/semester/${semesterId}`,
    BY_SEMESTER_PASSED: (semesterId) => `/api/topics/semester/${semesterId}/passed`,
    BY_STATUS: (status) => `/api/topics/status/${status}`,
    BY_SUBMITTER: (submitterId) => `/api/topics/submitter/${submitterId}`,
  },

  // Registration Phase endpoints
  PHASES: {
    LIST: '/api/registration-phases',
  },

  // Semester endpoints
  SEMESTER: {
    LIST: '/api/semesters',
  },

  // User endpoints (for future use)
  USERS: {
    LIST: '/users',
    DETAIL: (id) => `/users/${id}`,
  },

  // Notification endpoints
  NOTIFICATION: {
    LIST: (userId) => `/api/notifications/user/${userId}`,
    UNREAD: (userId) => `/api/notifications/user/${userId}/unread`,
    UNREAD_COUNT: (userId) => `/api/notifications/user/${userId}/unread-count`,
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: (userId) => `/api/notifications/user/${userId}/read-all`,
  },
};

export default apiConfig;
