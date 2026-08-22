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

export const apiService = {
  registerAdmin: async (data: { companyName: string; name: string; email: string; phone: string; password?: string; countryCode?: string }) => {
    const nameParts = (data.name || 'Admin User').trim().split(' ');
    const fName = nameParts[0];
    const lName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'A';
    const joinYear = new Date().getFullYear();
    const loginId = generateLoginId(data.countryCode || 'IN', fName, lName, joinYear, 1);

    const adminUser: Employee = {
      id: `usr-admin-${Date.now()}`,
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
      salary: {
        grossMonthly: 120000,
        basic: 60000,
        hra: 24000,
        standardAllowance: 10000,
        performanceBonus: 12000,
        lta: 7000,
        fixedAllowance: 7000,
        pfRate: 12,
        professionalTax: 200,
      },
    };

    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock-jwt-token-admin');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...adminUser, userRole: 'admin' }));

    return {
      message: 'Admin account and company registered successfully.',
      token: 'mock-jwt-token-admin',
      user: adminUser,
    };
  },

  login: async (loginIdOrEmail: string, _password?: string) => {
    const lower = (loginIdOrEmail || '').trim().toLowerCase();
    const employees = getStoredArray<Employee>(STORAGE_KEYS.EMPLOYEES);

    let foundUser = employees.find(
      (e) => (e.loginId && e.loginId.toLowerCase() === lower) || (e.email && e.email.toLowerCase() === lower)
    );

    if (lower === 'admin001' || lower === 'admin@dayflow.com' || lower.includes('admin')) {
      const adminUser: Employee = {
        id: 'usr-admin-001',
        loginId: 'ADMIN001',
        fullName: 'System Administrator',
        name: 'System Administrator',
        email: 'admin@dayflow.com',
        phone: '+91 98765 43210',
        address: 'Company Headquarters',
        department: 'Executive Management',
        jobTitle: 'Company Admin / HR Officer',
        role: 'Admin',
        countryCode: 'IN',
        joinDate: '2026-01-01',
        joinYear: 2026,
        avatarInitials: 'AD',
        status: 'green',
      };
      localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock-jwt-token-admin');
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...adminUser, userRole: 'admin' }));

      return {
        token: 'mock-jwt-token-admin',
        user: { ...adminUser, role: 'admin' },
      };
    }

    if (!foundUser) {
      foundUser = {
        id: 'usr-emp-001',
        loginId: 'IN-JD-2026-0001',
        fullName: 'John Doe',
        name: 'John Doe',
        email: lower || 'john.doe@dayflow.com',
        phone: '+1 (555) 234-5678',
        address: '123 Tech Street, Suite 400',
        department: 'Engineering',
        jobTitle: 'Software Engineer',
        role: 'Employee',
        countryCode: 'IN',
        joinDate: '2026-01-15',
        joinYear: 2026,
        avatarInitials: 'JD',
        status: 'green',
      };
    }

    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock-jwt-token-employee');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...foundUser, userRole: 'employee' }));

    return {
      token: 'mock-jwt-token-employee',
      user: { ...foundUser, role: 'employee' },
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
    return getStoredArray<Employee>(STORAGE_KEYS.EMPLOYEES);
  },

  createEmployee: async (empData: any) => {
    const employees = getStoredArray<Employee>(STORAGE_KEYS.EMPLOYEES);
    const fullName = empData.fullName || empData.name || 'New Employee';
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
      phone: empData.phone || '+1 (555) 000-1234',
      address: empData.address || '123 Tech Park',
      department: empData.department || 'Engineering',
      jobTitle: empData.jobTitle || empData.role || 'Senior Developer',
      role: empData.jobTitle || empData.role || 'Senior Developer',
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
    const employees = getStoredArray<Employee>(STORAGE_KEYS.EMPLOYEES);
    const index = employees.findIndex((e) => e.id === id);

    if (index !== -1) {
      employees[index] = { ...employees[index], ...updateData };
      setStoredArray(STORAGE_KEYS.EMPLOYEES, employees);
    }

    return { message: 'Profile updated successfully.', employee: updateData };
  },

  checkIn: async () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { message: `Checked in at ${timeStr}`, userStatus: 'green' };
  },

  checkOut: async () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { message: `Checked out at ${timeStr}`, userStatus: 'yellow' };
  },

  getAttendanceLogs: async () => {
    return { logs: [], payableDaysInfo: { payableDays: 22 } };
  },

  applyLeave: async (data: any) => {
    const leaves = getStoredArray<LeaveRequestItem>(STORAGE_KEYS.LEAVES);
    const newLeave: LeaveRequestItem = {
      id: `leave-${Date.now()}`,
      employeeName: 'John Doe',
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
    const leaves = getStoredArray<LeaveRequestItem>(STORAGE_KEYS.LEAVES);
    const index = leaves.findIndex((l) => l.id === id);
    if (index !== -1) {
      leaves[index].status = 'Approved';
      setStoredArray(STORAGE_KEYS.LEAVES, leaves);
    }
    return { message: 'Leave request approved.' };
  },

  rejectLeave: async (id: string) => {
    const leaves = getStoredArray<LeaveRequestItem>(STORAGE_KEYS.LEAVES);
    const index = leaves.findIndex((l) => l.id === id);
    if (index !== -1) {
      leaves[index].status = 'Rejected';
      setStoredArray(STORAGE_KEYS.LEAVES, leaves);
    }
    return { message: 'Leave request rejected.' };
  },

  getLeaveRequests: async (): Promise<LeaveRequestItem[]> => {
    return getStoredArray<LeaveRequestItem>(STORAGE_KEYS.LEAVES);
  },

  getPayrollComponents: async (): Promise<{ components: SalaryComponent[]; settings: any }> => {
    return {
      components: defaultSalaryComponents,
      settings: { pfRate: 12, professionalTax: 200 },
    };
  },

  updateSalary: async (employeeId: string, salaryData: Partial<SalaryStructure>) => {
    const employees = getStoredArray<Employee>(STORAGE_KEYS.EMPLOYEES);
    const index = employees.findIndex((e) => e.id === employeeId);
    if (index !== -1) {
      employees[index].salary = { ...employees[index].salary, ...salaryData } as SalaryStructure;
      setStoredArray(STORAGE_KEYS.EMPLOYEES, employees);
    }
    return { message: 'Salary structure updated.' };
  },

  getNotifications: async (): Promise<{ pendingCount: number; hasUnread: boolean }> => {
    const leaves = getStoredArray<LeaveRequestItem>(STORAGE_KEYS.LEAVES);
    const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
    return { pendingCount, hasUnread: pendingCount > 0 };
  },
};
