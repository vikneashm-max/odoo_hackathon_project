import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DailyAttendanceView } from './components/DailyAttendanceView';
import { EmployeesView } from './components/EmployeesView';
import { MyAttendanceView } from './components/MyAttendanceView';
import { TimeOffView } from './components/TimeOffView';
import { LoginView } from './components/LoginView';
import { SignUpView } from './components/SignUpView';
import {
  AddEmployeeModal,
  ViewProfileModal,
  NewTimeOffModal,
} from './components/Modals';
import type {
  NavTab,
  AttendanceSubView,
  AuthMode,
  Employee,
  DailyAttendanceRecord,
  PersonalAttendanceRecord,
  TimeOffBalance,
  NewTimeOffRequest,
} from './types';
import './App.css';

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('authenticated');
  const [activeTab, setActiveTab] = useState<NavTab>('attendance');
  const [attendanceSubView, setAttendanceSubView] = useState<AttendanceSubView>('daily');
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);

  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<Employee | null>(null);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);

  // Clean state initialized to empty (no mock data)
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendanceRecord[]>([]);
  const [personalAttendance, setPersonalAttendance] = useState<PersonalAttendanceRecord[]>([]);
  const [timeOffBalance, setTimeOffBalance] = useState<TimeOffBalance>({
    paidTimeOff: 0,
    sickTimeOff: 0,
  });

  const handleAddEmployee = (newEmp: Omit<Employee, 'id'>) => {
    const createdEmp: Employee = {
      ...newEmp,
      id: `emp-${Date.now()}`,
    };
    setEmployees((prev) => [createdEmp, ...prev]);

    // Also automatically create a daily attendance entry for the new employee
    const newDailyRecord: DailyAttendanceRecord = {
      id: `da-${Date.now()}`,
      employeeId: createdEmp.id,
      employeeName: createdEmp.name,
      employeeRole: createdEmp.role,
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      workHours: '09:00',
      extraHours: '00:00',
      status: 'On Time',
    };
    setDailyAttendance((prev) => [newDailyRecord, ...prev]);
  };

  const handleToggleCheckIn = (status: boolean) => {
    setIsCheckedIn(status);
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    if (status) {
      alert(`Check-in successful at ${timeStr}`);
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
    } else {
      alert(`Check-out successful at ${timeStr}`);
      setPersonalAttendance((prev) =>
        prev.map((rec, index) =>
          index === 0 ? { ...rec, checkOut: timeStr, workHours: '08:00' } : rec
        )
      );
    }
  };

  const handleNewTimeOffRequest = (req: NewTimeOffRequest) => {
    alert(
      `Time Off request submitted for ${req.leaveType === 'paid' ? 'Paid Time Off' : 'Sick Leave'} (${req.startDate} to ${req.endDate}). Status: Pending Approval`
    );
    if (req.leaveType === 'paid') {
      setTimeOffBalance((prev) => ({ ...prev, paidTimeOff: prev.paidTimeOff + 1 }));
    } else {
      setTimeOffBalance((prev) => ({ ...prev, sickTimeOff: prev.sickTimeOff + 1 }));
    }
  };

  if (authMode === 'login') {
    return (
      <LoginView
        onLoginSuccess={() => setAuthMode('authenticated')}
        onNavigateToSignUp={() => setAuthMode('signup')}
      />
    );
  }

  if (authMode === 'signup') {
    return (
      <SignUpView
        onSignUpSuccess={() => setAuthMode('authenticated')}
        onNavigateToLogin={() => setAuthMode('login')}
      />
    );
  }

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        attendanceSubView={attendanceSubView}
        setAttendanceSubView={setAttendanceSubView}
        onLogout={() => setAuthMode('login')}
      />

      <main className="main-content">
        {activeTab === 'employees' && (
          <EmployeesView
            employees={employees}
            onAddEmployeeClick={() => setIsAddEmpModalOpen(true)}
            onViewProfileClick={(emp) => setSelectedProfileEmployee(emp)}
            isCheckedIn={isCheckedIn}
            onToggleCheckIn={handleToggleCheckIn}
          />
        )}

        {activeTab === 'attendance' && (
          <>
            {attendanceSubView === 'daily' ? (
              <DailyAttendanceView records={dailyAttendance} />
            ) : (
              <MyAttendanceView personalRecords={personalAttendance} />
            )}
          </>
        )}

        {activeTab === 'timeoff' && (
          <TimeOffView
            balance={timeOffBalance}
            onNewRequestClick={() => setIsTimeOffModalOpen(true)}
          />
        )}

        {activeTab === 'empty' && (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <h2 className="font-serif" style={{ fontSize: '28px', color: '#6d28d9', marginBottom: '8px' }}>
              Dayflow HRMS Dashboard
            </h2>
            <p>Select a section from the navigation bar above to view details.</p>
          </div>
        )}
      </main>

      <AddEmployeeModal
        isOpen={isAddEmpModalOpen}
        onClose={() => setIsAddEmpModalOpen(false)}
        onAddEmployee={handleAddEmployee}
      />

      <ViewProfileModal
        employee={selectedProfileEmployee}
        onClose={() => setSelectedProfileEmployee(null)}
      />

      <NewTimeOffModal
        isOpen={isTimeOffModalOpen}
        onClose={() => setIsTimeOffModalOpen(false)}
        onSubmitRequest={handleNewTimeOffRequest}
      />
    </div>
  );
}

export default App;
