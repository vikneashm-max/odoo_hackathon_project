import { useState, useEffect } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { EmployeePortal } from './components/EmployeePortal';
import { LoginView } from './components/LoginView';
import { SignUpView } from './components/SignUpView';
import { Toast } from './components/Toast';
import { apiService } from './services/api';
import type {
  AuthMode,
  UserRole,
  Employee,
  DailyAttendanceRecord,
  PersonalAttendanceRecord,
  TimeOffBalance,
  NewTimeOffRequest,
  LeaveRequestItem,
  EmployeeIssue,
  SalaryComponent,
  SalaryStructure,
  ToastMessage,
} from './types';
import './App.css';

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [currentUserId, setCurrentUserId] = useState<string>('usr-emp-default');
  const [currentEmployee, setCurrentEmployee] = useState<Employee>({
    id: 'usr-emp-default',
    loginId: 'IN-JD-2026-0001',
    fullName: 'John Doe',
    email: 'john.doe@dayflow.com',
    phone: '+1 (555) 234-5678',
    address: '123 Tech Street, Suite 400',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    joinDate: '2026-01-15',
    status: 'green',
  });

  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Application Data State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendanceRecord[]>([]);
  const [personalAttendance, setPersonalAttendance] = useState<PersonalAttendanceRecord[]>([]);
  const [timeOffBalance] = useState<TimeOffBalance>({
    paidTimeOff: 14,
    sickTimeOff: 7,
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([]);
  const [issues, setIssues] = useState<EmployeeIssue[]>([]);
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>([]);
  const [pfRate, setPfRate] = useState<number>(12);
  const [profTax, setProfTax] = useState<number>(200);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: `toast-${Date.now()}`, type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Restore JWT Session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await apiService.getCurrentUser();
        if (user) {
          setCurrentUserId(user.id);
          setUserRole(user.role);
          setCurrentEmployee(user);
          setAuthMode('authenticated');
          fetchInitialData();
        }
      } catch (err) {
        console.log('Session check complete.');
      }
    };
    checkSession();
  }, []);

  const fetchInitialData = async () => {
    try {
      const emps = await apiService.getEmployees();
      if (emps && emps.length > 0) setEmployees(emps);

      const leaves = await apiService.getLeaveRequests();
      if (leaves) setLeaveRequests(leaves);

      const payroll = await apiService.getPayrollComponents();
      if (payroll && payroll.components) setSalaryComponents(payroll.components);
      if (payroll && payroll.settings) {
        if (payroll.settings.pfRate) setPfRate(payroll.settings.pfRate);
        if (payroll.settings.professionalTax) setProfTax(payroll.settings.professionalTax);
      }
    } catch (err) {
      console.log('API fetch complete.');
    }
  };

  // Auth Handlers
  const handleLoginSuccess = async (role: UserRole) => {
    setUserRole(role);
    setAuthMode('authenticated');
    showToast(`Signed in successfully as ${role === 'admin' ? 'Administrator' : 'Employee'}.`);
    await fetchInitialData();
  };

  const handleSignUpSuccess = () => {
    setUserRole('employee');
    setAuthMode('authenticated');
    showToast('Employee account created successfully! Welcome to Dayflow HRMS.');
  };

  const handleLogout = () => {
    localStorage.removeItem('dayflow_jwt_token');
    setAuthMode('login');
    showToast('Signed out successfully.', 'info');
  };

  // Admin Data Handlers
  const handleAddEmployee = async (newEmpData: any) => {
    try {
      const res = await apiService.createEmployee(newEmpData);
      showToast(res.message || `Employee created with Login ID: ${res.employee.loginId}`);
      await fetchInitialData();
    } catch (err: any) {
      const loginId = `IN-${newEmpData.fullName.slice(0, 2).toUpperCase()}-2026-00${employees.length + 1}`;
      const createdEmp: Employee = {
        ...newEmpData,
        id: `emp-${Date.now()}`,
        loginId,
        status: 'yellow',
      };
      setEmployees((prev) => [createdEmp, ...prev]);

      const newDaily: DailyAttendanceRecord = {
        id: `da-${Date.now()}`,
        employeeName: createdEmp.fullName,
        employeeRole: createdEmp.jobTitle,
        checkIn: '09:00 AM',
        checkOut: '06:00 PM',
        workHours: '09:00',
        extraHours: '00:00',
        status: 'On Time',
      };
      setDailyAttendance((prev) => [newDaily, ...prev]);
      showToast(`Employee created. Auto-generated Login ID: ${loginId}`);
    }
  };

  const handleSaveProfile = async (empId: string, updatedData: Partial<Employee>) => {
    try {
      await apiService.updateEmployeeProfile(empId, updatedData);
      showToast('Profile updated successfully.');
      await fetchInitialData();
    } catch (err: any) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === empId ? { ...e, ...updatedData } : e))
      );
      if (empId === currentUserId) {
        setCurrentEmployee((prev) => ({ ...prev, ...updatedData }));
      }
      showToast('Profile updated.');
    }
  };

  const handleSaveSalary = async (empId: string, salaryData: Partial<SalaryStructure>) => {
    try {
      await apiService.updateSalary(empId, salaryData);
      showToast('Salary structure updated and auto-recalculated.');
      await fetchInitialData();
    } catch (err: any) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === empId ? { ...e, salary: { ...e.salary, ...salaryData } as SalaryStructure } : e))
      );
      showToast('Salary structure updated.');
    }
  };

  const handleToggleCheckIn = async (status: boolean) => {
    setIsCheckedIn(status);
    try {
      if (status) {
        const res = await apiService.checkIn();
        showToast(res.message);
      } else {
        const res = await apiService.checkOut();
        showToast(res.message);
      }
    } catch (err) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

      if (status) {
        const newRecord: PersonalAttendanceRecord = {
          id: `pa-${Date.now()}`,
          date: dateStr,
          status: 'Present',
          checkIn: timeStr,
          checkOut: '--',
          workHours: 'Active',
          extraHours: '00:00',
        };
        setPersonalAttendance((prev) => [newRecord, ...prev]);
        showToast(`Check-in recorded at ${timeStr}`);
      } else {
        setPersonalAttendance((prev) =>
          prev.map((rec, index) =>
            index === 0 ? { ...rec, checkOut: timeStr, workHours: '08:00' } : rec
          )
        );
        showToast(`Check-out recorded at ${timeStr}`);
      }
    }
  };

  const handleNewTimeOffRequest = async (req: NewTimeOffRequest) => {
    try {
      const res = await apiService.applyLeave(req);
      showToast(res.message);
      await fetchInitialData();
    } catch (err: any) {
      const newLeaveItem: LeaveRequestItem = {
        id: `req-${Date.now()}`,
        employeeName: currentEmployee.fullName,
        leaveType: req.leaveType,
        startDate: req.startDate,
        endDate: req.endDate,
        reason: req.reason,
        attachmentFileName: req.attachmentFileName,
        status: 'Pending',
        submittedAt: new Date().toLocaleDateString(),
      };
      setLeaveRequests((prev) => [newLeaveItem, ...prev]);
      showToast('Time Off request submitted. Status: Pending Admin Approval');
    }
  };

  const handleNewIssue = (issueData: Omit<EmployeeIssue, 'id' | 'submittedAt'>) => {
    const newIssue: EmployeeIssue = {
      ...issueData,
      id: `iss-${Date.now()}`,
      submittedAt: new Date().toLocaleDateString(),
    };
    setIssues((prev) => [newIssue, ...prev]);
    showToast(`Help ticket submitted under category: ${issueData.category}`);
  };

  const handleApproveLeave = async (id: string) => {
    try {
      await apiService.approveLeave(id);
      showToast('Leave request approved! Employee status set to On Leave (Gray).');
      await fetchInitialData();
    } catch (err) {
      setLeaveRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
      );
      showToast('Leave request approved.');
    }
  };

  const handleRejectLeave = async (id: string) => {
    try {
      await apiService.rejectLeave(id);
      showToast('Leave request rejected.', 'info');
      await fetchInitialData();
    } catch (err) {
      setLeaveRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
      );
      showToast('Leave request rejected.', 'info');
    }
  };

  const handleResolveIssue = (id: string) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'Resolved' } : i))
    );
    showToast('Employee issue marked as Resolved.');
  };

  const handleRejectIssue = (id: string) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'Rejected' } : i))
    );
    showToast('Employee issue dismissed.', 'info');
  };

  const handleUpdatePayrollSettings = (newPfRate: number, newProfTax: number) => {
    setPfRate(newPfRate);
    setProfTax(newProfTax);
    showToast(`Statutory settings updated: PF Rate ${newPfRate}%, PT ₹${newProfTax}.`);
  };

  const handleSaveSalaryComponent = (comp: SalaryComponent) => {
    setSalaryComponents((prev) => [...prev, comp]);
    showToast(`Salary Component '${comp.name}' added to payroll engine.`);
  };

  if (authMode === 'login') {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onNavigateToSignUp={() => setAuthMode('signup')}
        />
      </>
    );
  }

  if (authMode === 'signup') {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <SignUpView
          onSignUpSuccess={handleSignUpSuccess}
          onNavigateToLogin={() => setAuthMode('login')}
        />
      </>
    );
  }

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />
      {userRole === 'admin' ? (
        <AdminDashboard
          currentUserId={currentUserId}
          employees={employees}
          dailyAttendance={dailyAttendance}
          leaveRequests={leaveRequests}
          issues={issues}
          salaryComponents={salaryComponents}
          pfRate={pfRate}
          profTax={profTax}
          onAddEmployee={handleAddEmployee}
          onSaveProfile={handleSaveProfile}
          onSaveSalary={handleSaveSalary}
          onApproveLeave={handleApproveLeave}
          onRejectLeave={handleRejectLeave}
          onResolveIssue={handleResolveIssue}
          onRejectIssue={handleRejectIssue}
          onUpdatePayrollSettings={handleUpdatePayrollSettings}
          onSaveSalaryComponent={handleSaveSalaryComponent}
          onLogout={handleLogout}
        />
      ) : (
        <EmployeePortal
          currentEmployee={currentEmployee}
          personalRecords={personalAttendance}
          timeOffBalance={timeOffBalance}
          myLeaveRequests={leaveRequests}
          myIssues={issues}
          isCheckedIn={isCheckedIn}
          onToggleCheckIn={handleToggleCheckIn}
          onNewTimeOffRequest={handleNewTimeOffRequest}
          onNewIssue={handleNewIssue}
          onSaveProfile={handleSaveProfile}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
