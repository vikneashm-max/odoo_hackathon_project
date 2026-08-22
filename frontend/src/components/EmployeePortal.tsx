import React, { useState, useEffect } from 'react';
import { Bell, LayoutDashboard, LogOut, Clock, Calendar, HelpCircle, Plus, User } from 'lucide-react';
import { MyAttendanceView } from './MyAttendanceView';
import { TimeOffView } from './TimeOffView';
import { ProfileView } from './ProfileView';
import { NewTimeOffModal, NewIssueModal } from './Modals';
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
  onToggleCheckIn,
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

  const safeLeaveRequests = myLeaveRequests || [];
  const safeIssues = myIssues || [];

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

          <div
            className="user-avatar-btn"
            title={`${currentEmployee.fullName} (Click to View Profile)`}
            onClick={() => setActiveTab('profile')}
          >
            <div className="avatar-circle">
              <span>{currentEmployee.avatarInitials || 'JD'}</span>
            </div>
            <span className="avatar-status-dot"></span>
          </div>

          <button className="icon-btn" title="Sign Out" onClick={onLogout} style={{ marginLeft: '4px' }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Employee Content */}
      <main className="main-content">
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
                <HelpCircle size={16} color="#6d28d9" />
                <span>Report Issue / Help</span>
              </button>

              <button className="btn-primary" onClick={() => setIsTimeOffModalOpen(true)}>
                <Plus size={18} />
                <span>Request Time Off</span>
              </button>
            </div>

            <TimeOffView
              balance={timeOffBalance}
              onNewRequestClick={() => setIsTimeOffModalOpen(true)}
            />

            {/* Activity Table */}
            <div style={{ marginTop: '32px' }}>
              <h2 className="font-serif" style={{ fontSize: '20px', color: '#111827', marginBottom: '16px' }}>
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
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeLeaveRequests.map((l) => (
                        <tr key={l.id}>
                          <td>
                            <span className="badge badge-ontime">
                              {l.leaveType === 'paid' ? 'Paid Leave' : 'Sick Leave'}
                            </span>
                          </td>
                          <td>{l.startDate} to {l.endDate} ({l.reason || 'No reason provided'})</td>
                          <td>{l.submittedAt}</td>
                          <td>
                            <span
                              className={`badge ${
                                l.status === 'Approved'
                                  ? 'badge-ontime'
                                  : l.status === 'Rejected'
                                  ? 'badge-late'
                                  : 'badge-leave'
                              }`}
                            >
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {safeIssues.map((issue) => (
                        <tr key={issue.id}>
                          <td>
                            <span className="badge badge-late">{issue.category}</span>
                          </td>
                          <td>
                            <strong>{issue.subject}</strong> - {issue.description}
                          </td>
                          <td>{issue.submittedAt}</td>
                          <td>
                            <span
                              className={`badge ${
                                issue.status === 'Resolved'
                                  ? 'badge-ontime'
                                  : issue.status === 'Rejected'
                                  ? 'badge-late'
                                  : 'badge-leave'
                              }`}
                            >
                              {issue.status}
                            </span>
                          </td>
                        </tr>
                      ))}

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
      </main>

      {/* Floating Check-In / Check-Out Widget */}
      <div className="check-in-widget">
        <div className="widget-header">
          <span className="widget-title">MY CHECK-IN STATUS</span>
          <div className="widget-status">
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isCheckedIn ? '#22c55e' : '#ef4444',
              }}
            ></span>
            <span>{isCheckedIn ? 'Checked In' : 'Checked Out'}</span>
          </div>
        </div>

        <div className="widget-time">{currentTime || '9:57 AM'}</div>
        <div className="widget-date">{currentDate || 'Monday, Oct 23'}</div>

        <div className="widget-actions">
          <button
            className={`widget-btn ${!isCheckedIn ? 'btn-checkout-active' : 'btn-checkin-disabled'}`}
            disabled={isCheckedIn}
            onClick={() => onToggleCheckIn(true)}
          >
            Check In
          </button>
          <button
            className={`widget-btn ${isCheckedIn ? 'btn-checkout-active' : 'btn-checkin-disabled'}`}
            disabled={!isCheckedIn}
            onClick={() => onToggleCheckIn(false)}
          >
            Check Out
          </button>
        </div>
      </div>

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
