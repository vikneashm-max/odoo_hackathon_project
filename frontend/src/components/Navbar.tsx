import React from 'react';
import { Bell, LayoutDashboard, LogOut } from 'lucide-react';
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

        <div className="user-avatar-btn" title="John Doe (Click to Sign Out)" onClick={onLogout}>
          <div className="avatar-circle purple-bg">
            <span>JD</span>
          </div>
          <span className="avatar-status-dot"></span>
        </div>

        <button
          className="icon-btn"
          title="Sign Out / Auth Screens"
          onClick={onLogout}
          style={{ marginLeft: '4px' }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
