import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore.js';
import Input from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [formErrors, setFormErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      let from = location.state?.from?.pathname;
      if (!from || from === '/login' || from === '/') {
        const userRole = useAuthStore.getState().user?.role;
        switch (userRole) {
          case 'ADMIN': from = '/admin'; break;
          case 'LECTURER': from = '/lecturer'; break;
          case 'MODERATOR': from = '/moderator'; break;
          case 'STUDENT': from = '/student'; break;
          default: from = '/home';
        }
      }
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => clearError();
  }, []); // Empty array - only run on mount/unmount


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear field error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email/Username is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';     
    // } else if (formData.password.length < 6) {
    //   errors.password = 'Password must be at least 6 characters';

    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Attempt login
    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      let from = location.state?.from?.pathname;
      if (!from || from === '/login' || from === '/') {
        // get fresh user from store
        const userRole = useAuthStore.getState().user?.role;
        switch (userRole) {
          case 'ADMIN': from = '/admin'; break;
          case 'LECTURER': from = '/lecturer'; break;
          case 'MODERATOR': from = '/moderator'; break;
          case 'STUDENT': from = '/student'; break;
          default: from = '/home';
        }
      }
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-gradient-orb login-orb-1"></div>
        <div className="login-gradient-orb login-orb-2"></div>
        <div className="login-gradient-orb login-orb-3"></div>
      </div>

      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="url(#loginGradient)" />
                <path d="M24 12L33 18V30L24 36L15 30V18L24 12Z" fill="white" />
                <defs>
                  <linearGradient id="loginGradient" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stopColor="hsl(250, 84%, 54%)" />
                    <stop offset="100%" stopColor="hsl(280, 70%, 60%)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="login-title">Hệ Thống Nộp Đề Tài</h1>
            <p className="login-subtitle">Đăng nhập để sử dụng hệ thống quản lý, nộp và xét duyệt đề tài tốt nghiệp</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <Input
              type="text"
              name="email"
              label="Email hoặc Tên đăng nhập"
              placeholder="Nhập email hoặc tên đăng nhập"
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
              required
            />

            <Input
              type="password"
              name="password"
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              required
            />

            <div className="login-options">
              <label className="login-checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="login-forgot">Quên mật khẩu?</a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="login-button"
            >
              Đăng nhập
            </Button>
          </form>

          <div className="login-footer">
            <p>Nếu bạn chưa có tài khoản, vui lòng liên hệ quản trị viên.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
