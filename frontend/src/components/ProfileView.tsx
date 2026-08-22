import React, { useState } from 'react';
import { User, Briefcase, DollarSign, Lock, Save, ShieldAlert } from 'lucide-react';
import type { Employee, SalaryStructure, UserRole } from '../types';

interface ProfileViewProps {
  employee: Employee;
  currentUserRole: UserRole;
  currentUserId: string;
  onSaveProfile: (empId: string, updatedData: Partial<Employee>) => Promise<void>;
  onSaveSalary?: (empId: string, salaryData: Partial<SalaryStructure>) => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  employee,
  currentUserRole,
  currentUserId,
  onSaveProfile,
  onSaveSalary,
}) => {
  const isSelf = currentUserId === employee.id;
  const isAdmin = currentUserRole === 'admin';

  // Tabs: 'personal' | 'job' | 'salary'
  const [activeTab, setActiveTab] = useState<'personal' | 'job' | 'salary'>('personal');

  // Form State
  const [fullName, setFullName] = useState(employee.fullName || employee.name || '');
  const [email, setEmail] = useState(employee.email || '');
  const [phone, setPhone] = useState(employee.phone || '');
  const [address, setAddress] = useState(employee.address || '123 Tech Park, Suite 400');
  const [avatarUrl, setAvatarUrl] = useState(employee.avatarUrl || '');
  const [department, setDepartment] = useState(employee.department || 'Engineering');
  const [jobTitle, setJobTitle] = useState(employee.jobTitle || employee.role || 'Senior Developer');

  // Salary Form State
  const salary: SalaryStructure = employee.salary || {
    grossMonthly: 60000,
    basic: 30000,
    hra: 12000,
    standardAllowance: 5000,
    performanceBonus: 6000,
    lta: 3000,
    fixedAllowance: 4000,
    pfRate: 12,
    professionalTax: 200,
  };

  const [grossWage, setGrossWage] = useState<number>(salary.grossMonthly);
  const [pfRate] = useState<number>(salary.pfRate || 12);
  const [profTax] = useState<number>(salary.professionalTax || 200);

  // Auto-computed percentage components
  const basicPay = Math.round(grossWage * 0.5);
  const hraPay = Math.round(grossWage * 0.2);
  const bonusPay = Math.round(grossWage * 0.1);
  const stdAllowance = salary.standardAllowance || 5000;
  const ltaPay = salary.lta || 3000;
  const fixedAllowancePay = Math.max(0, grossWage - (basicPay + hraPay + stdAllowance + bonusPay + ltaPay));
  const pfDeduction = Math.round(basicPay * (pfRate / 100));
  const netPayable = Math.max(0, grossWage - (pfDeduction + profTax));

  // Determine if Salary tab should be shown
  const canViewSalary = isAdmin || isSelf;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin && !isSelf) {
      alert('Permission Denied: You cannot edit another user profile.');
      return;
    }

    if (isAdmin) {
      await onSaveProfile(employee.id, {
        fullName,
        email,
        phone,
        address,
        avatarUrl,
        department,
        jobTitle,
      });
    } else {
      await onSaveProfile(employee.id, {
        phone,
        address,
        avatarUrl,
      });
    }
  };

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Permission Denied: Only Admins can modify salary structures.');
      return;
    }

    if (onSaveSalary) {
      await onSaveSalary(employee.id, {
        grossMonthly: grossWage,
        basic: basicPay,
        hra: hraPay,
        standardAllowance: stdAllowance,
        performanceBonus: bonusPay,
        lta: ltaPay,
        fixedAllowance: fixedAllowancePay,
        pfRate,
        professionalTax: profTax,
      });
    }
  };

  return (
    <div className="profile-page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Employee Profile</h1>
          <p>
            {isAdmin
              ? 'Admin Profile Management — Full Edit Access Enabled'
              : isSelf
              ? 'My Profile — Edit Address, Phone & Picture'
              : 'Viewing Employee Profile (Read-Only)'}
          </p>
        </div>
      </div>

      {/* Header Profile Badge Card */}
      <div className="card-container" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="avatar-box" style={{ width: '72px', height: '72px', fontSize: '20px', fontWeight: 700 }}>
          {employee.avatarUrl ? (
            <img src={employee.avatarUrl} alt={employee.fullName || employee.name} />
          ) : (
            <span>{employee.avatarInitials || 'EP'}</span>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
            {employee.fullName || employee.name}
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            {employee.jobTitle || employee.role} • {employee.department}
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="code-pill">{employee.loginId || 'IN-VK-2026-0001'}</span>
            <span
              className={`badge ${
                employee.status === 'green' || employee.status === 'active'
                  ? 'badge-ontime'
                  : employee.status === 'gray' || employee.status === 'leave'
                  ? 'badge-leave'
                  : 'badge-late'
              }`}
            >
              {employee.status === 'green' || employee.status === 'active'
                ? '• Present'
                : employee.status === 'gray' || employee.status === 'leave'
                ? '• On Leave'
                : '• Absent'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="auth-tabs-container" style={{ maxWidth: '480px', marginBottom: '24px' }}>
        <button
          className={`auth-tab ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <User size={15} style={{ display: 'inline', marginRight: '6px' }} />
          Personal Info
        </button>
        <button
          className={`auth-tab ${activeTab === 'job' ? 'active' : ''}`}
          onClick={() => setActiveTab('job')}
        >
          <Briefcase size={15} style={{ display: 'inline', marginRight: '6px' }} />
          Job Details
        </button>
        {canViewSalary && (
          <button
            className={`auth-tab ${activeTab === 'salary' ? 'active' : ''}`}
            onClick={() => setActiveTab('salary')}
          >
            <DollarSign size={15} style={{ display: 'inline', marginRight: '6px' }} />
            Salary Info
          </button>
        )}
      </div>

      {/* Tab 1: Personal Info */}
      {activeTab === 'personal' && (
        <div className="card-container" style={{ padding: '28px' }}>
          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Full Name {!isAdmin && <Lock size={12} color="#9ca3af" />}</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>

              <div className="form-group">
                <label>Email Address {!isAdmin && <Lock size={12} color="#9ca3af" />}</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>

              <div className="form-group">
                <label>Phone Number (Editable)</label>
                <input
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isSelf && !isAdmin}
                />
              </div>

              <div className="form-group">
                <label>Profile Picture URL (Editable)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://example.com/photo.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  disabled={!isSelf && !isAdmin}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Residential Address (Editable)</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isSelf && !isAdmin}
              ></textarea>
            </div>

            {(isSelf || isAdmin) && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  <span>Save Personal Details</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Tab 2: Job Details */}
      {activeTab === 'job' && (
        <div className="card-container" style={{ padding: '28px' }}>
          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Employee Login ID {!isAdmin && <Lock size={12} color="#9ca3af" />}</label>
                <input type="text" className="form-input" value={employee.loginId || 'IN-VK-2026-0001'} disabled />
              </div>

              <div className="form-group">
                <label>Department {!isAdmin && <Lock size={12} color="#9ca3af" />}</label>
                <input
                  type="text"
                  className="form-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>

              <div className="form-group">
                <label>Job Title / Role {!isAdmin && <Lock size={12} color="#9ca3af" />}</label>
                <input
                  type="text"
                  className="form-input"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>

              <div className="form-group">
                <label>Date of Joining</label>
                <input type="text" className="form-input" value={employee.joinDate || '2026-01-01'} disabled />
              </div>
            </div>

            {isAdmin && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  <span>Save Job Attributes</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Tab 3: Salary Info */}
      {activeTab === 'salary' && canViewSalary && (
        <div className="card-container" style={{ padding: '28px' }}>
          {!isAdmin && (
            <div style={{ backgroundColor: '#f3f4f6', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} color="#6b7280" />
              <span>Your salary structure is displayed in read-only mode. Only HR/Admin can modify compensation components.</span>
            </div>
          )}

          <form onSubmit={handleSalarySubmit}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                Gross Monthly Wage Engine
              </h3>
              <div className="form-group" style={{ maxWidth: '320px' }}>
                <label>Gross Monthly Salary (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={grossWage}
                  onChange={(e) => setGrossWage(Number(e.target.value))}
                  disabled={!isAdmin}
                  style={{ fontSize: '18px', fontWeight: 700, color: '#6d28d9' }}
                />
              </div>
            </div>

            {/* Salary Components Table */}
            <div className="table-wrapper" style={{ marginBottom: '24px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Salary Component</th>
                    <th>Computation Rule</th>
                    <th style={{ textAlign: 'right' }}>Monthly Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Basic Pay</strong></td>
                    <td>50% of Gross Wage</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{basicPay.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>House Rent Allowance (HRA)</strong></td>
                    <td>20% of Gross Wage</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{hraPay.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>Standard Allowance</strong></td>
                    <td>Fixed Amount</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{stdAllowance.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>Performance Bonus</strong></td>
                    <td>10% Performance Incentive</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{bonusPay.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>Leave Travel Allowance (LTA)</strong></td>
                    <td>Fixed Amount</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{ltaPay.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>Fixed Special Allowance</strong></td>
                    <td>Balance Auto-allocated</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{fixedAllowancePay.toLocaleString()}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#fef2f2' }}>
                    <td><strong style={{ color: '#991b1b' }}>Provident Fund (PF Deduction)</strong></td>
                    <td>{pfRate}% of Basic Pay</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#991b1b' }}>-₹{pfDeduction.toLocaleString()}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#fef2f2' }}>
                    <td><strong style={{ color: '#991b1b' }}>Professional Tax (PT)</strong></td>
                    <td>Fixed State Statutory Tax</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#991b1b' }}>-₹{profTax.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Net Take-Home Pay Box */}
            <div style={{ backgroundColor: '#f3e8ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b21a8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Estimated Monthly Take-Home Net Salary
                </span>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  (Gross Wage - PF Deduction - Professional Tax)
                </p>
              </div>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#6d28d9' }}>
                ₹{netPayable.toLocaleString()}
              </span>
            </div>

            {isAdmin && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  <span>Update & Auto-Recalculate Compensation</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
