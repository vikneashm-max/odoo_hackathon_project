import React, { useState } from 'react';
import { X, Mail, Phone, Calendar, Briefcase } from 'lucide-react';
import type { Employee, NewTimeOffRequest } from '../types';

/* Add Employee Modal */
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
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;

    onAddEmployee({
      name,
      role,
      department,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
      phone: phone || '+1 (555) 019-2834',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
    });

    setName('');
    setRole('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add New Employee</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Alex Stanton"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Job Title / Role</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Senior Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
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
              placeholder="alex.stanton@company.com"
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
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{employee.name}</h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>{employee.role}</p>

          <span
            className={`badge ${
              employee.status === 'active'
                ? 'badge-ontime'
                : employee.status === 'break'
                ? 'badge-late'
                : 'badge-leave'
            }`}
            style={{ marginTop: '10px' }}
          >
            {employee.status === 'active' ? 'Active / On duty' : employee.status === 'break' ? 'On Break' : 'Offline / Leave'}
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRequest({
      leaveType,
      startDate,
      endDate,
      reason,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Submit Time Off Request</h3>
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
              <label>Start Date</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
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
            <label>Reason for Leave</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Briefly describe your request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
