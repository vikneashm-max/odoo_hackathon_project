import React, { useState } from 'react';
import { X, Mail, Phone, Calendar, Briefcase, AlertCircle, Paperclip } from 'lucide-react';
import type { Employee, NewTimeOffRequest, EmployeeIssue } from '../types';

/* Add Employee Modal (Admin Only) */
interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onAddEmployee,
}) => {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('IN');
  const [grossWage, setGrossWage] = useState<number>(60000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !role) return;

    onAddEmployee({
      fullName,
      name: fullName,
      jobTitle: role,
      role,
      department,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
      phone: phone || '+1 (555) 019-2834',
      countryCode,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'yellow', // yellow: absent/checked out
      salary: {
        grossMonthly: grossWage,
        basic: grossWage * 0.5,
        hra: grossWage * 0.2,
        standardAllowance: 5000,
        performanceBonus: grossWage * 0.1,
        lta: 3000,
        fixedAllowance: Math.max(0, grossWage * 0.2 - 8000),
        pfRate: 12,
        professionalTax: 200,
      },
    } as any);

    setFullName('');
    setRole('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Employee (Admin)</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Vikneash K"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Country Code</label>
              <select
                className="form-select"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <option value="IN">IN (India)</option>
                <option value="US">US (United States)</option>
                <option value="UK">UK (United Kingdom)</option>
                <option value="CA">CA (Canada)</option>
                <option value="SG">SG (Singapore)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Job Title / Role *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Senior Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ backgroundColor: '#f3e8ff', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: '#6b21a8' }}>
            <strong>Auto-Generated Login ID Format:</strong> <code>{countryCode}-XX-{new Date().getFullYear()}-####</code>
          </div>

          <div className="form-group">
            <label>Department</label>
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Data & Analytics">Data & Analytics</option>
            </select>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="vikneash@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Initial Gross Monthly Salary (₹)</label>
            <input
              type="number"
              className="form-input"
              value={grossWage}
              onChange={(e) => setGrossWage(Number(e.target.value))}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              style={{ width: 'auto' }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* View Profile Modal */
interface ViewProfileModalProps {
  employee: Employee | null;
  onClose: () => void;
}

export const ViewProfileModal: React.FC<ViewProfileModalProps> = ({ employee, onClose }) => {
  if (!employee) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Employee Profile</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <div
            className="card-avatar"
            style={{ width: '80px', height: '80px', fontSize: '20px', marginBottom: '12px' }}
          >
            {employee.avatarInitials ? (
              <span style={{ fontWeight: 700 }}>{employee.avatarInitials}</span>
            ) : (
              <span>img</span>
            )}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{employee.fullName || employee.name}</h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>{employee.jobTitle || employee.role}</p>

          <span
            className={`badge ${
              employee.status === 'green' || employee.status === 'active'
                ? 'badge-ontime'
                : employee.status === 'gray' || employee.status === 'leave'
                ? 'badge-leave'
                : 'badge-late'
            }`}
            style={{ marginTop: '10px' }}
          >
            {employee.status === 'green' || employee.status === 'active'
              ? '• Present'
              : employee.status === 'gray' || employee.status === 'leave'
              ? '• On Leave'
              : '• Absent'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #f3f0f7', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#374151' }}>
            <Briefcase size={16} color="#6d28d9" />
            <span><strong>Department:</strong> {employee.department}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#374151' }}>
            <Mail size={16} color="#6d28d9" />
            <span><strong>Email:</strong> {employee.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#374151' }}>
            <Phone size={16} color="#6d28d9" />
            <span><strong>Phone:</strong> {employee.phone}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#374151' }}>
            <Calendar size={16} color="#6d28d9" />
            <span><strong>Join Date:</strong> {employee.joinDate}</span>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '24px' }}>
          <button className="btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

/* New Time Off Request Modal */
interface NewTimeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (req: NewTimeOffRequest) => void;
}

export const NewTimeOffModal: React.FC<NewTimeOffModalProps> = ({
  isOpen,
  onClose,
  onSubmitRequest,
}) => {
  const [leaveType, setLeaveType] = useState<'paid' | 'sick'>('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachmentFileName, setAttachmentFileName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRequest({
      leaveType,
      startDate,
      endDate,
      reason,
      attachmentFileName: attachmentFileName || (leaveType === 'sick' ? 'medical_note.pdf' : undefined),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Apply for Time Off</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Leave Category</label>
            <select
              className="form-select"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as 'paid' | 'sick')}
            >
              <option value="paid">Paid Time Off (PTO)</option>
              <option value="sick">Sick Leave</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Remarks / Reason</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Briefly describe your request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            ></textarea>
          </div>

          {leaveType === 'sick' && (
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Paperclip size={14} color="#6d28d9" />
                <span>Medical Attachment (Required for Sick Leave)</span>
              </label>
              <input
                type="file"
                className="form-input"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setAttachmentFileName(e.target.files?.[0]?.name || '')}
              />
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              style={{ width: 'auto' }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Leave Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* New Employee Issue / Help Desk Ticket Modal */
interface NewIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitIssue: (issue: Omit<EmployeeIssue, 'id' | 'submittedAt'>) => void;
}

export const NewIssueModal: React.FC<NewIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmitIssue,
}) => {
  const [category, setCategory] = useState<
    'Attendance Correction' | 'Payroll Query' | 'HR Support' | 'Other'
  >('Attendance Correction');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    onSubmitIssue({
      employeeName: 'John Doe',
      category,
      subject,
      description,
      status: 'Pending',
    });

    setSubject('');
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} color="#6d28d9" />
            Report Issue / HR Help Desk
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Issue Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value as
                    | 'Attendance Correction'
                    | 'Payroll Query'
                    | 'HR Support'
                    | 'Other'
                )
              }
            >
              <option value="Attendance Correction">Attendance Correction</option>
              <option value="Payroll Query">Payroll Query</option>
              <option value="HR Support">HR Support</option>
              <option value="Other">Other Query</option>
            </select>
          </div>

          <div className="form-group">
            <label>Subject / Summary</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Forgot to clock out on 22 Oct"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Detailed Description</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Explain the issue or assistance needed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              style={{ width: 'auto' }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
