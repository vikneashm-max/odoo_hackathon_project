import React, { useState, useEffect, useRef } from 'react';
import { Bell, LayoutDashboard, LogOut, Users, Calendar, CheckSquare, DollarSign, User, ChevronRight } from 'lucide-react';
import { EmployeesView } from './EmployeesView';
import { DailyAttendanceView } from './DailyAttendanceView';
import { AdminApprovalsView } from './AdminApprovalsView';
import { PayrollManagerView } from './PayrollManagerView';
import { ProfileView } from './ProfileView';
import { AddEmployeeModal, ViewProfileModal } from './Modals';
import { Avatar } from './Avatar';
import type {
  Employee,
  DailyAttendanceRecord,
  LeaveRequestItem,
  EmployeeIssue,
  SalaryComponent,
  SalaryStructure,
} from '../types';

interface AdminDashboardProps {
  currentUserId: string;
  employees: Employee[];
  dailyAttendance: DailyAttendanceRecord[];
  leaveRequests: LeaveRequestItem[];
  issues: EmployeeIssue[];
  salaryComponents: SalaryComponent[];
  pfRate: number;
  profTax: number;
  isCheckedIn: boolean;
  onToggleCheckIn?: (status: boolean) => void;
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  onSaveProfile: (empId: string, updatedData: Partial<Employee>) => Promise<void>;
  onSaveSalary: (empId: string, salaryData: Partial<SalaryStructure>) => Promise<void>;
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  onResolveIssue: (id: string) => void;
  onRejectIssue: (id: string) => void;
  onUpdatePayrollSettings: (pfRate: number, profTax: number) => void;
  onSaveSalaryComponent: (comp: SalaryComponent) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUserId,
  employees,
  dailyAttendance,
  leaveRequests,
  issues,
  salaryComponents,
  pfRate,
  profTax,
  isCheckedIn,
  onToggleCheckIn,
  onAddEmployee,
  onSaveProfile,
  onSaveSalary,
  onApproveLeave,
  onRejectLeave,
  onResolveIssue,
  onRejectIssue,
  onUpdatePayrollSettings,
  onSaveSalaryComponent,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'approvals' | 'payroll' | 'profile'>('employees');
  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<Employee | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pendingApprovalsCount =
    leaveRequests.filter((r) => r.status === 'Pending').length +
    issues.filter((i) => i.status === 'Pending').length;

  const currentAdminUser = employees.find((e) => e.id === currentUserId) || {
    id: currentUserId,
    loginId: 'IN-AD-2026-0001',
    fullName: 'System Administrator',
    email: 'admin@dayflow.com',
    phone: '+91 98765 43210',
    department: 'Human Resources',
    jobTitle: 'HR Director',
    joinDate: '2026-01-01',
    status: 'green',
  };

  return (
    <div className="app-container">
      {/* Admin Navbar */}
      <header className="navbar">
        <div className="nav-left">
          <div className="nav-logo" onClick={() => setActiveTab('employees')}>
            <LayoutDashboard className="nav-logo-icon" size={24} />
            <span>Dayflow Admin</span>
          </div>

          <nav className="nav-links">
            <button
              className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
              onClick={() => setActiveTab('employees')}
            >
              <Users size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Employees Directory
            </button>
            <button
              className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('attendance')}
            >
              <Calendar size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Daily Staff Attendance
            </button>
            <button
              className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
              style={{ position: 'relative' }}
            >
              <CheckSquare size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Approvals & Issues
              {pendingApprovalsCount > 0 && (
                <span
                  style={{
                    marginLeft: '6px',
                    backgroundColor: '#DC2626',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    lineHeight: 1,
                  }}
                >
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
            <button
              className={`nav-item ${activeTab === 'payroll' ? 'active' : ''}`}
              onClick={() => setActiveTab('payroll')}
            >
              <DollarSign size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Payroll & Salary
            </button>
          </nav>
        </div>

        <div className="nav-right">
          <button className="icon-btn" title="Notifications" onClick={() => setActiveTab('approvals')}>
            <Bell size={18} />
            {pendingApprovalsCount > 0 && <span className="bell-badge"></span>}
          </button>

          <div className="profile-menu-wrapper" ref={profileMenuRef} style={{ position: 'relative' }}>
            <div
              className="user-avatar-btn"
              title={currentAdminUser.fullName || 'Admin Profile'}
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            >
              <div className="avatar-wrapper">
                <Avatar employee={currentAdminUser as Employee} size={38} showStatusDot />
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
                    <Avatar employee={currentAdminUser as Employee} size={64} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                    {currentAdminUser.fullName || 'System Administrator'}
                  </span>
                  <span style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                    {currentAdminUser.email || 'admin@dayflow.com'}
                  </span>
                </div>

                {/* Menu items */}
                <div style={{ padding: '8px' }}>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setSelectedProfileEmployee(currentAdminUser as Employee);
                      setActiveTab('profile');
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
                    <User size={17} color="#374151" />
                    <span style={{ flex: 1 }}>My Profile & Settings</span>
                    <ChevronRight size={15} color="#9CA3AF" />
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setActiveTab('employees');
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
                    <Users size={17} color="#374151" />
                    <span style={{ flex: 1 }}>Employees Directory</span>
                    <ChevronRight size={15} color="#9CA3AF" />
                  </button>
                </div>

                {/* Sign out footer */}
                <div style={{ borderTop: '1px solid #E5E7EB', padding: '8px' }}>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
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

      {/* Main Content Area */}
      <main className="main-content">
        <div className="tab-content-enter" key={activeTab}>
          {activeTab === 'employees' && (
            <EmployeesView
              employees={employees}
              onAddEmployeeClick={() => setIsAddEmpModalOpen(true)}
              onViewProfileClick={(emp) => {
                setSelectedProfileEmployee(emp);
                setActiveTab('profile');
              }}
              isCheckedIn={isCheckedIn}
              onToggleCheckIn={(status) => onToggleCheckIn && onToggleCheckIn(status)}
            />
          )}

          {activeTab === 'attendance' && (
            <DailyAttendanceView records={dailyAttendance} />
          )}

          {activeTab === 'approvals' && (
            <AdminApprovalsView
              leaveRequests={leaveRequests}
              issues={issues}
              onApproveLeave={onApproveLeave}
              onRejectLeave={onRejectLeave}
              onResolveIssue={onResolveIssue}
              onRejectIssue={onRejectIssue}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollManagerView
              components={salaryComponents}
              pfRate={pfRate}
              profTax={profTax}
              onUpdateSettings={onUpdatePayrollSettings}
              onSaveComponent={onSaveSalaryComponent}
            />
          )}

          {activeTab === 'profile' && selectedProfileEmployee && (
            <ProfileView
              employee={selectedProfileEmployee}
              currentUserRole="admin"
              currentUserId={currentUserId}
              onSaveProfile={onSaveProfile}
              onSaveSalary={onSaveSalary}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={isAddEmpModalOpen}
        onClose={() => setIsAddEmpModalOpen(false)}
        onAddEmployee={onAddEmployee}
      />

      <ViewProfileModal
        employee={selectedProfileEmployee}
        onClose={() => setSelectedProfileEmployee(null)}
      />
    </div>
  );
};
