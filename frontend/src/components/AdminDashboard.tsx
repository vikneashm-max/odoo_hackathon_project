import React, { useState } from 'react';
import { Bell, LayoutDashboard, LogOut, Users, Calendar, CheckSquare, DollarSign } from 'lucide-react';
import { EmployeesView } from './EmployeesView';
import { DailyAttendanceView } from './DailyAttendanceView';
import { AdminApprovalsView } from './AdminApprovalsView';
import { PayrollManagerView } from './PayrollManagerView';
import { ProfileView } from './ProfileView';
import { AddEmployeeModal, ViewProfileModal } from './Modals';
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
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(true);

  const pendingApprovalsCount =
    leaveRequests.filter((r) => r.status === 'Pending').length +
    issues.filter((i) => i.status === 'Pending').length;

  const currentAdminUser = employees.find((e) => e.id === currentUserId) || {
    id: currentUserId,
    loginId: 'ADMIN001',
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
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '10px',
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

          <div
            className="user-avatar-btn"
            title="Administrator Profile"
            onClick={() => {
              setSelectedProfileEmployee(currentAdminUser as Employee);
              setActiveTab('profile');
            }}
          >
            <div className="avatar-circle purple-bg">
              <span>AD</span>
            </div>
            <span className="avatar-status-dot"></span>
          </div>

          <button className="icon-btn" title="Sign Out" onClick={onLogout} style={{ marginLeft: '4px' }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'employees' && (
          <EmployeesView
            employees={employees}
            onAddEmployeeClick={() => setIsAddEmpModalOpen(true)}
            onViewProfileClick={(emp) => {
              setSelectedProfileEmployee(emp);
              setActiveTab('profile');
            }}
            isCheckedIn={isCheckedIn}
            onToggleCheckIn={(status) => setIsCheckedIn(status)}
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
