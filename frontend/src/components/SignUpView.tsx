import React, { useState } from 'react';
import { UploadCloud, Eye, EyeOff } from 'lucide-react';

interface SignUpViewProps {
  onSignUpSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({
  onSignUpSuccess,
  onNavigateToLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSignUpSuccess();
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card signup-card">
        <div className="auth-box">
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-logo font-serif">Dayflow HRMS</h1>
            <p className="auth-subtitle">Create your employee account</p>
          </div>

          {/* Upload Profile / Badge Photo */}
          <div className="upload-logo-section">
            <label className="upload-logo-circle" htmlFor="logo-upload">
              <UploadCloud size={24} color="#6b7280" />
              <input id="logo-upload" type="file" accept="image/*" style={{ display: 'none' }} />
            </label>
            <span className="upload-logo-label">Upload Profile Photo</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input with-right-icon"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <div className="input-with-icon">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input with-right-icon"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit-btn">
              Create Employee Account
            </button>
          </form>

          <div className="auth-footer-link">
            <span>Already have an account? </span>
            <button type="button" className="link-btn" onClick={onNavigateToLogin}>
              Sign In
            </button>
          </div>
        </div>

        {/* Bottom Note Container */}
        <div className="auto-gen-note-card">
          <span className="note-badge">Note</span>
          <div className="note-content">
            <p className="note-title">Auto-generated Login ID:</p>
            <p className="note-desc">
              The system will automatically generate your unique Employee ID based on the format:
            </p>
            <div className="code-pill">CC-XX-YYYY-####</div>
            <p className="note-example">e.g., 01-JD-2023-0001</p>
          </div>
        </div>
      </div>
    </div>
  );
};
