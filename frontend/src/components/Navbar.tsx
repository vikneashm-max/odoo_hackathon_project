import React, { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react';
import type { NavTab, AttendanceSubView } from '../types';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  attendanceSubView: AttendanceSubView;
  setAttendanceSubView: (subView: AttendanceSubView) => void;
  onLogout: () => void;
  userRole?: 'admin' | 'employee' | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  attendanceSubView,
  setAttendanceSubView,
  onLogout,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSignOut = () => {
    setIsProfileMenuOpen(false);
    onLogout();
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <div 
          className="nav-logo" 
          onClick={() => setActiveTab('attendance')}
          title="Dayflow HRMS Home"
        >
          <LayoutDashboard className="nav-logo-icon" size={24} />
          <span>Dayflow HRMS</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            Employees
          </button>
          <button
            className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance
          </button>
          <button
            className={`nav-item ${activeTab === 'timeoff' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeoff')}
          >
            Time Off
          </button>
        </nav>
      </div>

      <div className="nav-right">
        {activeTab === 'attendance' && (
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-subtle)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)', marginRight: '12px' }}>
            <button
              onClick={() => setAttendanceSubView('daily')}
              style={{
                border: 'none',
                background: attendanceSubView === 'daily' ? 'var(--primary)' : 'transparent',
                color: attendanceSubView === 'daily' ? '#FFFFFF' : 'var(--text-secondary)',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Daily (Manager)
            </button>
            <button
              onClick={() => setAttendanceSubView('my')}
              style={{
                border: 'none',
                background: attendanceSubView === 'my' ? 'var(--primary)' : 'transparent',
                color: attendanceSubView === 'my' ? '#FFFFFF' : 'var(--text-secondary)',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              My Attendance
            </button>
          </div>
        )}

        <button className="icon-btn" aria-label="Notifications" title="Notifications">
          <Bell size={18} />
          <span className="bell-badge"></span>
        </button>

        <div className="profile-menu-container" ref={profileMenuRef}>
          <button
            className="user-avatar-btn with-text"
            title="User Account"
            onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
          >
            <div className="avatar-wrapper">
              <div className="avatar-circle purple-bg">
                <span>DF</span>
              </div>
              <span className="avatar-status-dot"></span>
            </div>
            <div className="profile-trigger-details">
              <span className="profile-trigger-name">User Account</span>
              <span className="profile-trigger-role">Portal</span>
            </div>
            <ChevronDown size={14} className={`profile-trigger-chevron ${isProfileMenuOpen ? 'open' : ''}`} />
          </button>

          {isProfileMenuOpen && (
            <div className="profile-dropdown-menu" role="menu" aria-label="Profile menu">
              <div className="profile-menu-user">
                <p className="profile-menu-name">User Account</p>
                <p className="profile-menu-email">user@dayflow.local</p>
              </div>
              <button className="profile-menu-item sign-out" role="menuitem" onClick={handleSignOut}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};