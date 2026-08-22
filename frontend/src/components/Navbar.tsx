import React, { useState, useRef, useEffect } from 'react';
import { Bell, LayoutDashboard, LogOut, User } from 'lucide-react';
import type { NavTab, AttendanceSubView } from '../types';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  attendanceSubView: AttendanceSubView;
  setAttendanceSubView: (subView: AttendanceSubView) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  attendanceSubView,
  setAttendanceSubView,
  onLogout,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <div style={{ display: 'flex', gap: '4px', background: '#F3E8FF', padding: '3px', borderRadius: '8px', marginRight: '12px' }}>
            <button
              onClick={() => setAttendanceSubView('daily')}
              style={{
                border: 'none',
                background: attendanceSubView === 'daily' ? '#6D28D9' : 'transparent',
                color: attendanceSubView === 'daily' ? '#FFFFFF' : '#6B21A8',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Daily (Manager)
            </button>
            <button
              onClick={() => setAttendanceSubView('my')}
              style={{
                border: 'none',
                background: attendanceSubView === 'my' ? '#6D28D9' : 'transparent',
                color: attendanceSubView === 'my' ? '#FFFFFF' : '#6B21A8',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
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

        <div className="profile-menu-wrapper" ref={profileRef} style={{ position: 'relative' }}>
          <div
            className="user-avatar-btn"
            title="John Doe"
            onClick={() => setIsProfileOpen((prev) => !prev)}
          >
            <div className="avatar-circle purple-bg">
              <span>JD</span>
            </div>
            <span className="avatar-status-dot"></span>
          </div>

          {isProfileOpen && (
            <div
              className="profile-dropdown"
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                width: '200px',
                overflow: 'hidden',
                zIndex: 50,
              }}
            >
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div className="avatar-circle purple-bg" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                  <span>JD</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>John Doe</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Employee</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <User size={15} />
                View Profile
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onLogout();
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  borderTop: '1px solid #F1F5F9',
                  background: 'transparent',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#DC2626',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};