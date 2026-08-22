import React, { useState } from 'react';
import { User, Eye, EyeOff, Lock, LayoutDashboard } from 'lucide-react';
import { apiService } from '../services/api';

interface LoginViewProps {
  onLoginSuccess: (type: 'employee' | 'admin', user: any) => void;
  onNavigateToSignUp: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigateToSignUp,
}) => {
  const [loginType, setLoginType] = useState<'employee' | 'admin'>('employee');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (type: 'employee' | 'admin') => {
    setLoginType(type);
    setLoginId('');
    setPassword('');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await apiService.login(loginId, password);
      const role = (res.user?.role || res.user?.userRole || loginType).toLowerCase();
      onLoginSuccess(role as 'employee' | 'admin', res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = loginId.trim().length > 0 && password.trim().length > 0 && !isLoading;

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124, 58, 237, 0.12)', padding: '12px', borderRadius: '16px', color: '#6d28d9', marginBottom: '14px', border: '1px solid rgba(167, 139, 250, 0.3)', boxShadow: '0 8px 20px rgba(109, 40, 217, 0.12)' }}>
            <LayoutDashboard size={32} />
          </div>
          <h1 className="auth-logo font-serif">Dayflow HRMS</h1>
          <p className="auth-subtitle">Welcome back. Please sign in to your account.</p>
        </div>

        {/* Auth Inner Box */}
        <div className="auth-box">
          {/* Segmented Tab Switcher: Employee Login vs Admin Login */}
          <div className="auth-tabs-container">
            <button
              className={`auth-tab ${loginType === 'employee' ? 'active' : ''}`}
              onClick={() => handleTabChange('employee')}
              type="button"
            >
              Employee Login
            </button>
            <button
              className={`auth-tab ${loginType === 'admin' ? 'active' : ''}`}
              onClick={() => handleTabChange('admin')}
              type="button"
            >
              Admin Login
            </button>
          </div>

          {errorMsg && (
            <div
              style={{
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>{loginType === 'admin' ? 'Admin ID / Email' : 'Login ID / Email'}</label>
              <div className="input-with-icon">
                <User className="input-icon-left" size={18} />
                <input
                  type="text"
                  className="form-input with-left-icon"
                  placeholder={loginType === 'admin' ? 'e.g. ADMIN001' : 'Enter your ID or email'}
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon-left" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input with-left-icon with-right-icon"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary auth-submit-btn"
              disabled={!isFormValid}
              style={{ opacity: isFormValid ? 1 : 0.6, cursor: isFormValid ? 'pointer' : 'not-allowed' }}
            >
              {isLoading ? 'Signing In...' : `Sign In as ${loginType === 'admin' ? 'Admin' : 'Employee'}`}
            </button>
          </form>

          {/* Only Employees can sign up */}
          {loginType === 'employee' && (
            <div className="auth-footer-link">
              <span>Don't have an account? </span>
              <button type="button" className="link-btn" onClick={onNavigateToSignUp}>
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};