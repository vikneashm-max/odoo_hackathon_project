import React, { useState, useEffect, useRef } from 'react';
import { Bell, LayoutDashboard, LogOut, Clock, Calendar, HelpCircle, Plus, User, ChevronRight } from 'lucide-react';
import { MyAttendanceView } from './MyAttendanceView';
import { TimeOffView } from './TimeOffView';
import { ProfileView } from './ProfileView';
import { NewTimeOffModal, NewIssueModal } from './Modals';
import { Avatar } from './Avatar';
import type {
  Employee,
  PersonalAttendanceRecord,
  TimeOffBalance,
  NewTimeOffRequest,
  EmployeeIssue,
  LeaveRequestItem,
} from '../types';

interface EmployeePortalProps {
  currentEmployee: Employee;
  personalRecords?: PersonalAttendanceRecord[];
  timeOffBalance?: TimeOffBalance;
  myLeaveRequests?: LeaveRequestItem[];
  myIssues?: EmployeeIssue[];
  isCheckedIn: boolean;
  onToggleCheckIn: (status: boolean) => void;
  onNewTimeOffRequest: (req: NewTimeOffRequest) => void;
  onNewIssue: (issue: Omit<EmployeeIssue, 'id' | 'submittedAt'>) => void;
  onSaveProfile: (empId: string, updatedData: Partial<Employee>) => Promise<void>;
  onLogout: () => void;
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({
  currentEmployee,
  personalRecords = [],
  timeOffBalance = { paidTimeOff: 14, sickTimeOff: 7 },
  myLeaveRequests = [],
  myIssues = [],
  isCheckedIn,
  onToggleCheckIn: _onToggleCheckIn,
  onNewTimeOffRequest,
  onNewIssue,
  onSaveProfile,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'my_attendance' | 'timeoff_and_issues' | 'profile'>('my_attendance');
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];
      const dateNum = now.getDate();
      setCurrentDate(`${dayName}, ${monthName} ${dateNum}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeLeaveRequests = myLeaveRequests || [];
  const safeIssues = myIssues || [];

  const handleGoToProfile = () => {
    setIsProfileMenuOpen(false);
    setActiveTab('profile');
  };

  const handleSignOutClick = () => {
    setIsProfileMenuOpen(false);
    onLogout();
  };

  return (
    <div className="app-container">
      {/* Employee Navbar */}
      <header className="navbar">
        <div className="nav-left">
          <div className="nav-logo" onClick={() => setActiveTab('my_attendance')}>
            <LayoutDashboard className="nav-logo-icon" size={24} />
            <span>Dayflow Employee</span>
          </div>

          <nav className="nav-links">
            <button
              className={`nav-item ${activeTab === 'my_attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('my_attendance')}
            >
              <Clock size={16} style={{ display: 'inline', marginRight: '6px' }} />
              My Attendance
            </button>
            <button
              className={`nav-item ${activeTab === 'timeoff_and_issues' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeoff_and_issues')}
            >
              <Calendar size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Time Off & HR Help
            </button>
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} style={{ display: 'inline', marginRight: '6px' }} />
              My Profile & Salary
            </button>
          </nav>
        </div>

        <div className="nav-right">
          <button className="icon-btn" title="Notifications">
            <Bell size={18} />
          </button>

          <div className="profile-menu-wrapper" ref={profileMenuRef} style={{ position: 'relative' }}>
            <div
              className="user-avatar-btn"
              title={currentEmployee.fullName || currentEmployee.name || 'User Profile'}
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            >
              <div className="avatar-wrapper">
                <Avatar employee={currentEmployee} size={38} showStatusDot />
              </div>
            </div>

            {isProfileMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: '300px',
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '16px',
                  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
                  overflow: 'hidden',
                  zIndex: 60,
                }}
              >
                {/* Header block with avatar, name, email */}
                <div
                  style={{
                    padding: '28px 20px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    borderBottom: '1px solid #E5E7EB',
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <Avatar employee={currentEmployee} size={64} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                    {currentEmployee.fullName || currentEmployee.name}
                  </span>
                  <span style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                    {currentEmployee.email || 'employee@dayflow.com'}
                  </span>
                </div>

                {/* Menu items */}
                <div style={{ padding: '8px' }}>
                  <button
                    onClick={handleGoToProfile}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 12px',
                      border: 'none',
                      background: 'transparent',
                      color: '#111827',
                      fontSize: '13.5px',
                      fontWeight: 500,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F4F6')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <User size={17} color="#374151" />
                    <span style={{ flex: 1 }}>My Profile & Salary</span>
                    <ChevronRight size={15} color="#9CA3AF" />
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setActiveTab('timeoff_and_issues');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 12px',
                      border: 'none',
                      background: 'transparent',
                      color: '#111827',
                      fontSize: '13.5px',
                      fontWeight: 500,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F3F4F6')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Calendar size={17} color="#374151" />
                    <span style={{ flex: 1 }}>Time Off & HR Help</span>
                    <ChevronRight size={15} color="#9CA3AF" />
                  </button>
                </div>

                {/* Sign out footer */}
                <div style={{ borderTop: '1px solid #E5E7EB', padding: '8px' }}>
                  <button
                    onClick={handleSignOutClick}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 12px',
                      border: 'none',
                      background: 'transparent',
                      color: '#DC2626',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FEE2E2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={17} color="#DC2626" />
                    <span>Sign out of Dayflow HRMS</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Employee Content */}
      <main className="main-content">
        {/* Top Hero Welcome Banner with Embedded Check-In Box */}
        <div className="hero-banner-card">
          <div className="hero-user-info">
            <Avatar employee={currentEmployee} size={58} />
            <div>
              <h1 className="hero-greeting">
                Welcome back, {currentEmployee.fullName || currentEmployee.name || 'Employee'}! 👋
              </h1>
              <div className="hero-meta">
                <span className="code-pill">{currentEmployee.loginId || 'IN-VK-2026-0001'}</span>
                <span>{currentEmployee.jobTitle || 'Staff Member'} • {currentEmployee.department || 'Engineering'}</span>
              </div>
            </div>
          </div>

          {/* Integrated Check-In Status Box */}
          <div className="embedded-checkin-box">
            <div className="checkin-info">
              <div className="checkin-status-badge">
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isCheckedIn ? '#22c55e' : '#ef4444',
                    boxShadow: isCheckedIn ? '0 0 8px rgba(34, 197, 94, 0.6)' : '0 0 8px rgba(239, 68, 68, 0.6)',
                  }}
                ></span>
                <span style={{ color: isCheckedIn ? '#15803d' : '#b91c1c' }}>
                  {isCheckedIn ? 'Checked In' : 'Checked Out'}
                </span>
              </div>
              <div className="checkin-time">{currentTime || '9:57 AM'}</div>
              <div className="checkin-date">{currentDate}</div>
              <div style={{ fontSize: '11.5px', color: '#15803d', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                ⚡ Auto check-in on login & auto check-out on sign out
              </div>
            </div>
          </div>
        </div>

        <div className="tab-content-enter" key={activeTab}>
          {activeTab === 'my_attendance' && (
            <MyAttendanceView personalRecords={personalRecords} />
          )}

          {activeTab === 'timeoff_and_issues' && (
            <div>
              <div className="controls-toolbar" style={{ justifyContent: 'flex-end', gap: '12px', marginBottom: '20px' }}>
                <button
                  className="btn-outline"
                  style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setIsIssueModalOpen(true)}
                >
                  <HelpCircle size={16} color="var(--primary)" />
                  <span>Report Issue / Help</span>
                </button>

                <button className="btn-primary" onClick={() => setIsTimeOffModalOpen(true)}>
                  <Plus size={18} />
                  <span>Request Time Off</span>
                </button>
              </div>

              <TimeOffView
                balance={timeOffBalance}
                leaveRequests={safeLeaveRequests}
                issues={safeIssues}
                onNewRequestClick={() => setIsTimeOffModalOpen(true)}
              />

              {/* Activity Table */}
              <div style={{ marginTop: '32px' }}>
                <h2 className="section-title" style={{ marginBottom: '16px' }}>
                  My Activity & Help Tickets
                </h2>

                <div className="card-container">
                  <div className="table-wrapper">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Subject / Details</th>
                          <th>Submitted At</th>
                          <th>Request Process Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {safeLeaveRequests.map((l) => {
                          const stage = l.status === 'Approved' ? 'accepted' : l.status === 'Rejected' ? 'rejected' : 'sent';
                          return (
                            <tr key={l.id}>
                              <td>
                                <span className="badge badge-ontime">
                                  {l.leaveType === 'paid' ? 'Paid Leave' : 'Sick Leave'}
                                </span>
                              </td>
                              <td>{l.startDate} to {l.endDate} ({l.reason || 'No reason provided'})</td>
                              <td>{l.submittedAt}</td>
                              <td>
                                <span className={`process-badge badge-stage-${stage}`}>
                                  {stage === 'accepted' ? 'Accepted ✓' : stage === 'rejected' ? 'Rejected ✕' : 'Sent ↗'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}

                        {safeIssues.map((issue) => {
                          const stage = issue.status === 'Resolved' ? 'accepted' : issue.status === 'Rejected' ? 'rejected' : issue.status === 'In Progress' ? 'seen' : 'sent';
                          return (
                            <tr key={issue.id}>
                              <td>
                                <span className="badge badge-late">{issue.category}</span>
                              </td>
                              <td>
                                <strong>{issue.subject}</strong> - {issue.description}
                              </td>
                              <td>{issue.submittedAt}</td>
                              <td>
                                <span className={`process-badge badge-stage-${stage}`}>
                                  {stage === 'accepted' ? 'Accepted ✓' : stage === 'rejected' ? 'Rejected ✕' : stage === 'seen' ? 'Seen 👁' : 'Sent ↗'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}

                        {safeLeaveRequests.length === 0 && safeIssues.length === 0 && (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                              No requests or help tickets submitted yet. Click "Request Time Off" or "Report Issue / Help" above.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileView
              employee={currentEmployee}
              currentUserRole="employee"
              currentUserId={currentEmployee.id}
              onSaveProfile={onSaveProfile}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <NewTimeOffModal
        isOpen={isTimeOffModalOpen}
        onClose={() => setIsTimeOffModalOpen(false)}
        onSubmitRequest={onNewTimeOffRequest}
      />

      <NewIssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSubmitIssue={onNewIssue}
      />
    </div>
  );
};