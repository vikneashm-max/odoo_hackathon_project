export type NavTab = 'employees' | 'attendance' | 'timeoff' | 'payroll' | 'empty';
export type AttendanceSubView = 'daily' | 'my';
export type AuthMode = 'login' | 'signup' | 'authenticated';
export type UserRole = 'admin' | 'employee';

export type AdminTab = 'employees' | 'attendance' | 'payroll' | 'approvals';
export type EmployeeTab = 'dashboard' | 'my_attendance' | 'profile' | 'timeoff_and_issues';

export type EmployeeStatus = 'green' | 'gray' | 'yellow' | 'active' | 'break' | 'offline' | 'leave';

export interface SalaryStructure {
  grossMonthly: number;
  basic: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  lta: number;
  fixedAllowance: number;
  pfRate: number;
  professionalTax: number;
}

export interface Employee {
  id: string;
  loginId: string;
  fullName: string;
  name?: string; // alias
  email: string;
  phone: string;
  address?: string;
  department: string;
  jobTitle: string;
  role?: string; // alias
  countryCode?: string;
  joinDate: string;
  joinYear?: number;
  avatarUrl?: string;
  avatarInitials?: string;
  status: EmployeeStatus; // green: present, gray: on leave, yellow: absent
  salary?: SalaryStructure;
}

export interface DailyAttendanceRecord {
  id: string;
  userId?: string;
  employeeId?: string;
  employeeName: string;
  employeeRole: string;
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

export interface NewTimeOffRequest {
  leaveType: 'paid' | 'sick';
  startDate: string;
  endDate: string;
  reason: string;
  attachmentFileName?: string;
}

export interface LeaveRequestItem {
  id: string;
  userId?: string;
  employeeName: string;
  leaveType: 'paid' | 'sick';
  startDate: string;
  endDate: string;
  reason: string;
  attachmentFileName?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
}

export interface EmployeeIssue {
  id: string;
  employeeName: string;
  category: 'Attendance Correction' | 'Payroll Query' | 'HR Support' | 'Other';
  subject: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  submittedAt: string;
}

export interface SalaryComponent {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  isDeduction: boolean;
  description: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
