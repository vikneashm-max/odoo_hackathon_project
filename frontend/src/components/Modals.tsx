import React, { useState, useRef } from 'react';
import { X, Mail, Phone, Calendar, Briefcase, AlertCircle, Paperclip } from 'lucide-react';
import { Avatar } from './Avatar';
import type { Employee, NewTimeOffRequest, EmployeeIssue } from '../types';

/* Formatted Date Input showing DD-MM-YYYY */
interface FormattedDateInputProps {
  value: string;
  onChange: (val: string) => void;
  min?: string;
  required?: boolean;
}

export const FormattedDateInput: React.FC<FormattedDateInputProps> = ({
  value,
  onChange,
  min,
  required,
}) => {
  const hiddenPickerRef = useRef<HTMLInputElement>(null);

  const toDisplay = (str: string) => {
    if (!str) return '';
    if (str.includes('-') && str.split('-')[0].length === 2) return str;
    const parts = str.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return str;
  };

  const toIso = (str: string) => {
    if (!str) return '';
    const parts = str.split('-');
    if (parts.length === 3 && parts[0].length === 2) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return str;
  };

  const displayVal = toDisplay(value);

  const handleOpenPicker = () => {
    if (hiddenPickerRef.current) {
      try {
        if ('showPicker' in (hiddenPickerRef.current as any)) {
          (hiddenPickerRef.current as any).showPicker();
        } else {
          (hiddenPickerRef.current as any)?.focus();
        }
      } catch (e) {
        hiddenPickerRef.current.click();
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        className="form-input"
        placeholder="DD-MM-YYYY"
        value={displayVal}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{ paddingRight: '40px', fontWeight: 600, letterSpacing: '0.02em' }}
      />
      <button
        type="button"
        onClick={handleOpenPicker}
        style={{
          position: 'absolute',
          right: '8px',
          background: 'transparent',
          border: 'none',
          color: 'var(--primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          borderRadius: '6px',
        }}
        title="Open Calendar Picker"
      >
        <Calendar size={18} />
      </button>
      <input
        type="date"
        ref={hiddenPickerRef}
        value={toIso(value)}
        min={min ? toIso(min) : undefined}
        onChange={(e) => {
          if (e.target.value) {
            onChange(e.target.value);
          }
        }}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

/* New Time Off Request Modal */
interface NewTimeOffModalProps {
  isOpen: boolean;
  initialDate?: string;
  onClose: () => void;
  onSubmitRequest: (req: NewTimeOffRequest) => void;
}

export const NewTimeOffModal: React.FC<NewTimeOffModalProps> = ({
  isOpen,
  initialDate,
  onClose,
  onSubmitRequest,
}) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [leaveType, setLeaveType] = useState<'paid' | 'sick'>('paid');
  const [startDate, setStartDate] = useState(initialDate || getTodayStr());
  const [endDate, setEndDate] = useState(initialDate || getTodayStr());
  const [reason, setReason] = useState('');
  const [attachmentFileName, setAttachmentFileName] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      const defaultDate = initialDate || getTodayStr();
      setStartDate(defaultDate);
      setEndDate(defaultDate);
      setReason('');
      setAttachmentFileName('');
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRequest({
      leaveType,
      startDate: startDate || getTodayStr(),
      endDate: endDate || startDate || getTodayStr(),
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

          {/* Quick Date Selection Presets */}
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Quick Selection Presets:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ padding: '4px 10px', fontSize: '12px', height: 'auto', minWidth: 'unset' }}
                onClick={() => {
                  const today = getTodayStr();
                  setStartDate(today);
                  setEndDate(today);
                }}
              >
                Today
              </button>
              <button
                type="button"
                className="btn-outline"
                style={{ padding: '4px 10px', fontSize: '12px', height: 'auto', minWidth: 'unset' }}
                onClick={() => {
                  const tom = new Date();
                  tom.setDate(tom.getDate() + 1);
                  const tomStr = tom.toISOString().split('T')[0];
                  setStartDate(tomStr);
                  setEndDate(tomStr);
                }}
              >
                Tomorrow
              </button>
              <button
                type="button"
                className="btn-outline"
                style={{ padding: '4px 10px', fontSize: '12px', height: 'auto', minWidth: 'unset' }}
                onClick={() => {
                  const s = getTodayStr();
                  const e = new Date();
                  e.setDate(e.getDate() + 2);
                  setStartDate(s);
                  setEndDate(e.toISOString().split('T')[0]);
                }}
              >
                Next 3 Days
              </button>
              <button
                type="button"
                className="btn-outline"
                style={{ padding: '4px 10px', fontSize: '12px', height: 'auto', minWidth: 'unset' }}
                onClick={() => {
                  const s = getTodayStr();
                  const e = new Date();
                  e.setDate(e.getDate() + 6);
                  setStartDate(s);
                  setEndDate(e.toISOString().split('T')[0]);
                }}
              >
                Next 7 Days
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Start Date (DD-MM-YYYY) *</label>
              <FormattedDateInput
                value={startDate}
                onChange={(newStart) => {
                  setStartDate(newStart);
                  if (!endDate || newStart > endDate) {
                    setEndDate(newStart);
                  }
                }}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date (DD-MM-YYYY) *</label>
              <FormattedDateInput
                value={endDate}
                min={startDate}
                onChange={(newEnd) => setEndDate(newEnd)}
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
          <div style={{ marginBottom: '12px' }}>
            <Avatar employee={employee} size={80} />
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-primary)' }}>
            <Briefcase size={20} color="var(--primary)" />
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>DEPARTMENT</span>
              <strong>{employee.department || 'Engineering'}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-primary)' }}>
            <Calendar size={20} color="var(--primary)" />
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>JOIN DATE</span>
              <strong>{employee.joinDate || '2026-01-01'}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-primary)', gridColumn: 'span 2' }}>
            <Mail size={20} color="var(--primary)" />
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>EMAIL ADDRESS</span>
              <strong>{employee.email || 'employee@dayflow.com'}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-primary)', gridColumn: 'span 2' }}>
            <Phone size={20} color="var(--primary)" />
            <div>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>PHONE NUMBER</span>
              <strong>{employee.phone || '+91 98765 43210'}</strong>
            </div>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    onSubmitIssue({
      employeeName: 'Employee',
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
