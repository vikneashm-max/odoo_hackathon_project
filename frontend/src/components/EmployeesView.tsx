import React, { useState, useEffect } from 'react';
import { Search, Plus, Users } from 'lucide-react';
import type { Employee } from '../types';

interface EmployeesViewProps {
  employees: Employee[];
  onAddEmployeeClick: () => void;
  onViewProfileClick: (emp: Employee) => void;
  isCheckedIn: boolean;
  onToggleCheckIn: (status: boolean) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  onAddEmployeeClick,
  onViewProfileClick,
  isCheckedIn,
  onToggleCheckIn,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];
      const dateNum = now.getDate();
      setCurrentDate(`${dayName}, ${monthName} ${dateNum}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredEmployees = (employees || []).filter(
    (emp) =>
      (emp.fullName || emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.jobTitle || emp.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="employees-page" style={{ position: 'relative' }}>
      {/* Top Search and Add Toolbar */}
      <div className="controls-toolbar" style={{ marginBottom: '28px' }}>
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={onAddEmployeeClick}>
          <Plus size={18} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Employee Cards Grid or Empty State */}
      {filteredEmployees.length > 0 ? (
        <div className="employees-grid">
          {filteredEmployees.map((emp) => (
            <div className="employee-card" key={emp.id}>
              <span
                className={`card-status-dot ${
                  emp.status === 'green' || emp.status === 'active'
                    ? 'dot-status-active'
                    : emp.status === 'gray' || emp.status === 'leave'
                    ? 'dot-status-offline'
                    : 'dot-status-break'
                }`}
              ></span>

              <div className="card-avatar">
                {emp.avatarUrl ? (
                  <img src={emp.avatarUrl} alt={emp.fullName || emp.name} />
                ) : (
                  <span style={{ fontSize: '18px', fontWeight: 600 }}>
                    {emp.avatarInitials || (emp.fullName || emp.name || 'EP').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <h3 className="card-name">{emp.fullName || emp.name}</h3>
              <p className="card-role">{emp.jobTitle || emp.role}</p>

              <button
                className="btn-outline"
                onClick={() => onViewProfileClick(emp)}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-container" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Users size={48} color="#c084fc" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
            No Employees Found
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            {searchTerm
              ? `No employee records match "${searchTerm}"`
              : 'There are no employees added to the system yet.'}
          </p>
          <button className="btn-primary" onClick={onAddEmployeeClick} style={{ margin: '0 auto' }}>
            <Plus size={18} />
            <span>Add First Employee</span>
          </button>
        </div>
      )}

      {/* Floating Check-In / Check-Out Status Widget */}
      <div className="check-in-widget">
        <div className="widget-header">
          <span className="widget-title">CURRENT STATUS</span>
          <div className="widget-status">
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isCheckedIn ? '#22c55e' : '#ef4444',
              }}
            ></span>
            <span>{isCheckedIn ? 'Checked In' : 'Checked Out'}</span>
          </div>
        </div>

        <div className="widget-time">{currentTime || '9:57 AM'}</div>
        <div className="widget-date">{currentDate || 'Monday, Oct 23'}</div>

        <div className="widget-actions">
          <button
            className={`widget-btn ${!isCheckedIn ? 'btn-checkout-active' : 'btn-checkin-disabled'}`}
            disabled={isCheckedIn}
            onClick={() => onToggleCheckIn(true)}
          >
            Check In
          </button>
          <button
            className={`widget-btn ${isCheckedIn ? 'btn-checkout-active' : 'btn-checkin-disabled'}`}
            disabled={!isCheckedIn}
            onClick={() => onToggleCheckIn(false)}
          >
            Check Out
          </button>
        </div>
      </div>
    </div>
  );
};
