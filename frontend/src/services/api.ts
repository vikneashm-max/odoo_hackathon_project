import type {
  Employee,
  LeaveRequestItem,
  SalaryComponent,
  SalaryStructure,
} from '../types';

export function generateLoginId(countryCode?: string, firstName?: string, lastName?: string, joinYear?: number, serialNum?: number): string {
  const cc = (countryCode || 'IN').toUpperCase().slice(0, 2);
  const f = (firstName || 'E').toUpperCase().charAt(0);
  const l = (lastName || 'M').toUpperCase().charAt(0);
  const initials = `${f}${l}`;
  const year = joinYear || new Date().getFullYear();
  const serial = String(serialNum || 1).padStart(4, '0');
  return `${cc}-${initials}-${year}-${serial}`;
}

const STORAGE_KEYS = {
  TOKEN: 'dayflow_jwt_token',
  CURRENT_USER: 'dayflow_current_user',
  EMPLOYEES: 'dayflow_employees_db',
  LEAVES: 'dayflow_leaves_db',
  ISSUES: 'dayflow_issues_db',
  PAYROLL_SETTINGS: 'dayflow_payroll_settings',
};

const defaultSalaryComponents: SalaryComponent[] = [
  { id: 'sc-1', name: 'Basic Pay', type: 'percentage', value: 50, isDeduction: false, description: '50% of Gross Salary' },
  { id: 'sc-2', name: 'House Rent Allowance (HRA)', type: 'percentage', value: 20, isDeduction: false, description: '20% of Gross Salary' },
  { id: 'sc-3', name: 'Standard Allowance', type: 'fixed', value: 5000, isDeduction: false, description: 'Fixed Standard Allowance' },
  { id: 'sc-4', name: 'Performance Bonus', type: 'percentage', value: 10, isDeduction: false, description: '10% Performance Incentive' },
  { id: 'sc-5', name: 'Leave Travel Allowance (LTA)', type: 'fixed', value: 3000, isDeduction: false, description: 'Travel Allowance' },
  { id: 'sc-6', name: 'Fixed Special Allowance', type: 'fixed', value: 2000, isDeduction: false, description: 'Special Allowance' },
  { id: 'sc-7', name: 'Provident Fund (PF)', type: 'percentage', value: 12, isDeduction: true, description: '12% of Basic Pay' },
  { id: 'sc-8', name: 'Professional Tax (PT)', type: 'fixed', value: 200, isDeduction: true, description: 'Fixed ₹200 Professional Tax' },
];

function getStoredArray<T>(key: string): T[] {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

function setStoredArray<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

const API_BASE_URL = 'http://localhost:8080/api';

export const apiService = {
  registerAdmin: async (data: { companyName: string; name: string; email: string; phone: string; password?: string; countryCode?: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        localStorage.setItem(STORAGE_KEYS.TOKEN, result.token || 'dayflow-jwt-token-admin');
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...result.user, userRole: 'admin' }));
        return result;
      }
    } catch (err) {
      console.warn('Backend API unavailable, using local session fallback.', err);
    }

    const nameParts = (data.name || 'Admin User').trim().split(' ');
    const fName = nameParts[0];
    const lName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'A';
    const joinYear = new Date().getFullYear();
    const loginId = generateLoginId(data.countryCode || 'IN', fName, lName, joinYear, 1);

    const adminUser: Employee = {
      id: '1',
      loginId,
      fullName: data.name,
      name: data.name,
      email: data.email,
      phone: data.phone || '+91 98765 43210',
      address: 'Company Headquarters',
      department: 'Executive Management',
      jobTitle: 'Company Admin / HR Officer',
      role: 'Admin',
      countryCode: data.countryCode || 'IN',
      joinDate: new Date().toISOString().split('T')[0],
      joinYear,
      avatarInitials: data.name.slice(0, 2).toUpperCase(),
      status: 'green',
    };

    localStorage.setItem(STORAGE_KEYS.TOKEN, 'dayflow-jwt-token-admin');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...adminUser, userRole: 'admin' }));

    return {
      message: 'Admin account and company registered successfully.',
      token: 'dayflow-jwt-token-admin',
      user: adminUser,
    };
  },

  login: async (loginIdOrEmail: string, password?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginIdOrEmail, password }),
      });

      if (response.ok) {
        const result = await response.json();
        const role = (result.user?.role || 'employee').toLowerCase();
        localStorage.setItem(STORAGE_KEYS.TOKEN, result.token);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...result.user, userRole: role, role }));
        return {
          token: result.token,
          user: { ...result.user, userRole: role, role },
        };
      } else {
        const errJson = await response.json().catch(() => ({}));
        if (errJson.message) {
          throw new Error(errJson.message);
        }
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      console.warn('Backend server connection fallback to local session.');
    }

    const lower = (loginIdOrEmail || '').trim().toLowerCase();
    const employees = getStoredArray<Employee>(STORAGE_KEYS.EMPLOYEES);

    let foundUser = employees.find(
      (e) => (e.loginId && e.loginId.toLowerCase() === lower) || (e.email && e.email.toLowerCase() === lower)
    );

    if (lower === 'admin001' || lower === 'admin@dayflow.com' || lower.includes('admin')) {
      const adminUser: Employee = {
        id: '1',
        loginId: 'ADMIN001',
        fullName: 'System Administrator',
        name: 'System Administrator',
        email: 'admin@dayflow.com',
        phone: '+91 98765 43210',
        address: 'Company Headquarters',
        department: 'Executive Management',
        jobTitle: 'Company Admin / HR Director',
        role: 'Admin',
        countryCode: 'IN',
        joinDate: '2026-01-01',
        joinYear: 2026,
        avatarInitials: 'AD',
        status: 'green',
      };
      localStorage.setItem(STORAGE_KEYS.TOKEN, 'dayflow-jwt-token-admin');
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...adminUser, userRole: 'admin', role: 'admin' }));

      return {
        token: 'dayflow-jwt-token-admin',
        user: { ...adminUser, role: 'admin', userRole: 'admin' },
      };
    }

    if (!foundUser) {
      throw new Error('Invalid credentials or user not found. Please register or sign in with your generated Login ID / Email.');
    }

    const role = (foundUser.role || 'employee').toLowerCase();
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'dayflow-jwt-token-employee');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...foundUser, userRole: role, role }));

    return {
      token: 'dayflow-jwt-token-employee',
      user: { ...foundUser, role, userRole: role },
    };
  },

  getCurrentUser: async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getEmployees: async (): Promise<Employee[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`);
      if (response.ok) {
        const data = await response.json();
        return data as Employee[];
      }
    } catch (err) {
      console.warn('Backend API getEmployees fallback to local store.');
    }
    return getStoredArray<Employee>(STORAGE_KEYS.EMPLOYEES);
  },

  createEmployee: async (empData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empData),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (err) {
      console.warn('Backend API createEmployee fallback to local store.');
    }

    const employees = getStoredArray<Employee>(STORAGE_KEYS.EMPLOYEES);
    const fullName = empData.fullName || empData.name || 'Employee';
    const nameParts = fullName.trim().split(' ');
    const fName = nameParts[0];
    const lName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'E';
    const joinYear = new Date().getFullYear();
    const serial = employees.length + 1;

    const loginId = generateLoginId(empData.countryCode || 'IN', fName, lName, joinYear, serial);
    const gross = Number(empData.salary?.grossMonthly) || 60000;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      loginId,
      fullName,
      name: fullName,
      email: empData.email || `${fName.toLowerCase()}.${lName.toLowerCase()}@dayflow.com`,
      phone: empData.phone || '',
      address: empData.address || '',
      department: empData.department || 'Engineering',
      jobTitle: empData.jobTitle || empData.role || 'Staff Member',
      role: empData.jobTitle || empData.role || 'Staff Member',
      countryCode: empData.countryCode || 'IN',
      joinDate: new Date().toISOString().split('T')[0],
      joinYear,
      avatarInitials: `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase(),
      status: 'yellow',
      salary: {
        grossMonthly: gross,
        basic: gross * 0.5,
        hra: gross * 0.2,
        standardAllowance: 5000,
        performanceBonus: gross * 0.1,
        lta: 3000,
        fixedAllowance: Math.max(0, gross * 0.2 - 8000),
        pfRate: 12,
        professionalTax: 200,
      },
    };

    employees.unshift(newEmp);
    setStoredArray(STORAGE_KEYS.EMPLOYEES, employees);

    return {
      message: `Employee created. Auto-generated Login ID: ${loginId}`,
      employee: newEmp,
      tempPassword: `Temp@${joinYear}`,
    };
  },

  updateEmployeeProfile: async (id: string, updateData: Partial<Employee>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (err) {
      console.warn('Backend API updateEmployeeProfile fallback.');
    }

    const employees = getStoredArray<Employee>(STORAGE_KEYS.EMPLOYEES);
    const index = employees.findIndex((e) => e.id === id);

    if (index !== -1) {
      employees[index] = { ...employees[index], ...updateData };
      setStoredArray(STORAGE_KEYS.EMPLOYEES, employees);
    }

    return { message: 'Profile updated successfully.', employee: updateData };
  },

  getAttendanceStatus: async (empId?: string): Promise<{ isCheckedIn: boolean; checkInTime?: string }> => {
    try {
      let id = empId;
      if (!id) {
        const user = await apiService.getCurrentUser();
        id = user?.id;
      }
      if (!id) return { isCheckedIn: false };
      const response = await fetch(`${API_BASE_URL}/attendance/status/${id}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Backend API getAttendanceStatus fallback.');
    }
    return { isCheckedIn: false };
  },

  checkIn: async () => {
    try {
      const user = await apiService.getCurrentUser();
      const empId = user && user.id ? user.id : 1;
      const response = await fetch(`${API_BASE_URL}/attendance/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId }),
      });

      if (response.ok) {
        const result = await response.json();
        return { message: result.message, userStatus: 'green' };
      }
    } catch (err) {
      console.warn('Backend API checkIn fallback.');
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { message: `Checked in at ${timeStr}`, userStatus: 'green' };
  },

  checkOut: async () => {
    try {
      const user = await apiService.getCurrentUser();
      const empId = user && user.id ? user.id : 1;
      const response = await fetch(`${API_BASE_URL}/attendance/check-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId }),
      });

      if (response.ok) {
        const result = await response.json();
        return { message: result.message, userStatus: 'yellow' };
      }
    } catch (err) {
      console.warn('Backend API checkOut fallback.');
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { message: `Checked out at ${timeStr}`, userStatus: 'yellow' };
  },

  getAttendanceLogs: async (empId?: string) => {
    try {
      let id = empId;
      if (!id) {
        const user = await apiService.getCurrentUser();
        id = user?.id;
      }
      if (!id) id = '1';
      const response = await fetch(`${API_BASE_URL}/attendance/employee/${id}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Backend API getAttendanceLogs fallback.');
    }
    return { logs: [], payableDaysInfo: { payableDays: 22 } };
  },

  getDailyAttendance: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/daily`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Backend API getDailyAttendance fallback.');
    }
    return [];
  },

  applyLeave: async (data: any) => {
    try {
      const user = await apiService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/timeoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user?.id || 1,
          leaveType: data.leaveType || 'paid',
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason || '',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (err) {
      console.warn('Backend API applyLeave fallback.');
    }

    const leaves = getStoredArray<LeaveRequestItem>(STORAGE_KEYS.LEAVES);
    const currentUser = await apiService.getCurrentUser();
    const newLeave: LeaveRequestItem = {
      id: `leave-${Date.now()}`,
      employeeName: data.employeeName || currentUser?.fullName || 'Employee',
      leaveType: data.leaveType || 'paid',
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason || '',
      attachmentFileName: data.attachmentFileName || null,
      status: 'Pending',
      submittedAt: new Date().toLocaleDateString(),
    };

    leaves.unshift(newLeave);
    setStoredArray(STORAGE_KEYS.LEAVES, leaves);

    return { message: 'Leave request submitted. Status: Pending Admin Approval.', request: newLeave };
  },

  approveLeave: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/timeoff/${id}/approve`, {
        method: 'PUT',
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Backend API approveLeave fallback.');
    }

    const leaves = getStoredArray<LeaveRequestItem>(STORAGE_KEYS.LEAVES);
    const index = leaves.findIndex((l) => l.id === id);
    if (index !== -1) {
      leaves[index].status = 'Approved';
      setStoredArray(STORAGE_KEYS.LEAVES, leaves);
    }
    return { message: 'Leave request approved.' };
  },

  rejectLeave: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/timeoff/${id}/reject`, {
        method: 'PUT',
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Backend API rejectLeave fallback.');
    }

    const leaves = getStoredArray<LeaveRequestItem>(STORAGE_KEYS.LEAVES);
    const index = leaves.findIndex((l) => l.id === id);
    if (index !== -1) {
      leaves[index].status = 'Rejected';
      setStoredArray(STORAGE_KEYS.LEAVES, leaves);
    }
    return { message: 'Leave request rejected.' };
  },

  getLeaveRequests: async (): Promise<LeaveRequestItem[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/timeoff`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Backend API getLeaveRequests fallback.');
    }
    return getStoredArray<LeaveRequestItem>(STORAGE_KEYS.LEAVES);
  },

  getPayrollComponents: async (): Promise<{ components: SalaryComponent[]; settings: any }> => {
    try {
      const user = await apiService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/payroll/structure/${user?.id || 1}`);
      if (response.ok) {
        const data = await response.json();
        return {
          components: data.components || defaultSalaryComponents,
          settings: { pfRate: data.pfRate || 12, professionalTax: data.professionalTax || 200 },
        };
      }
    } catch (err) {
      console.warn('Backend API getPayrollComponents fallback.');
    }

    return {
      components: defaultSalaryComponents,
      settings: { pfRate: 12, professionalTax: 200 },
    };
  },

  updateSalary: async (employeeId: string, salaryData: Partial<SalaryStructure>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payroll/structure/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salaryData),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Backend API updateSalary fallback.');
    }

    const employees = getStoredArray<Employee>(STORAGE_KEYS.EMPLOYEES);
    const index = employees.findIndex((e) => e.id === employeeId);
    if (index !== -1) {
      employees[index].salary = { ...employees[index].salary, ...salaryData } as SalaryStructure;
      setStoredArray(STORAGE_KEYS.EMPLOYEES, employees);
    }
    return { message: 'Salary structure updated.' };
  },

  getNotifications: async (): Promise<{ pendingCount: number; hasUnread: boolean }> => {
    const leaves = await apiService.getLeaveRequests();
    const pendingCount = leaves.filter((l) => (l.status || '').toLowerCase() === 'pending').length;
    return { pendingCount, hasUnread: pendingCount > 0 };
  },
};
