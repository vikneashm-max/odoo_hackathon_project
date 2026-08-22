export type NavTab = 'employees' | 'attendance' | 'timeoff' | 'empty';
export type AttendanceSubView = 'daily' | 'my';
export type AuthMode = 'login' | 'signup' | 'authenticated';

export type EmployeeStatus = 'active' | 'break' | 'offline' | 'leave';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  joinDate: string;
  avatarUrl?: string;
  avatarInitials?: string;
  status: EmployeeStatus;
}

export interface DailyAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  avatarUrl?: string;
  avatarInitials?: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  extraHours: string;
  status: 'On Time' | 'Late' | 'Leave' | 'Absent';
  isLate?: boolean;
}

export interface PersonalAttendanceRecord {
  id: string;
  date: string;
  status: 'Present' | 'Leave' | 'Absent';
  checkIn: string;
  checkOut: string;
  workHours: string;
  extraHours: string;
  isLate?: boolean;
}

export interface TimeOffBalance {
  paidTimeOff: number;
  sickTimeOff: number;
}

export interface TimeOffCalendarEntry {
  date: number;
  month: number;
  year: number;
  status: 'approved' | 'pending' | 'weekend' | 'normal' | 'other-month';
  leaveType?: 'paid' | 'sick';
  dayName?: string;
}

export interface NewTimeOffRequest {
  leaveType: 'paid' | 'sick';
  startDate: string;
  endDate: string;
  reason: string;
}
