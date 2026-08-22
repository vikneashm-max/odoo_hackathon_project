import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DailyAttendanceRecord } from '../types';

interface DailyAttendanceViewProps {
  records: DailyAttendanceRecord[];
}

export const DailyAttendanceView: React.FC<DailyAttendanceViewProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'Day' | 'Month'>('Day');
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);

  const dates = ['22 October 2024', '23 October 2024', '24 October 2024'];

  const filteredRecords = (records || []).filter(
    (rec) =>
      (rec.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.employeeRole || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrevDate = () => {
    setSelectedDateIndex((prev) => (prev > 0 ? prev - 1 : dates.length - 1));
  };

  const handleNextDate = () => {
    setSelectedDateIndex((prev) => (prev < dates.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="daily-attendance-page">
      {/* Page Title Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Daily Attendance</h1>
          <p>Monitor and manage employee daily check-ins.</p>
        </div>
      </div>

      {/* Controls Toolbar */}
      <div className="controls-toolbar">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="toolbar-right">
          {/* Date Navigator */}
          <div className="date-nav-group">
            <button className="date-nav-arrow" onClick={handlePrevDate} title="Previous Day">
              <ChevronLeft size={16} />
            </button>
            <span className="date-nav-label">{dates[selectedDateIndex]}</span>
            <button className="date-nav-arrow" onClick={handleNextDate} title="Next Day">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={`toggle-option ${viewMode === 'Day' ? 'active' : ''}`}
              onClick={() => setViewMode('Day')}
            >
              Day
            </button>
            <button
              className={`toggle-option ${viewMode === 'Month' ? 'active' : ''}`}
              onClick={() => setViewMode('Month')}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-container">
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Hours</th>
                <th>Extra Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="employee-cell">
                        <div className="avatar-box purple-bg">
                          <span style={{ color: '#ffffff' }}>
                            {record.employeeName ? record.employeeName.slice(0, 2).toUpperCase() : 'EP'}
                          </span>
                        </div>
                        <div className="emp-info">
                          <span className="emp-name">{record.employeeName}</span>
                          <span className="emp-role">{record.employeeRole}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={record.isLate ? 'text-late' : ''}>
                        {record.checkIn}
                      </span>
                    </td>
                    <td>{record.checkOut}</td>
                    <td>
                      <span className={record.workHours === '00:00' ? 'text-italic-muted' : ''}>
                        {record.workHours}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          record.extraHours !== '00:00' && record.extraHours !== '00:05'
                            ? 'text-extra'
                            : record.extraHours === '00:00'
                            ? 'text-italic-muted'
                            : ''
                        }
                      >
                        {record.extraHours}
                      </span>
                    </td>
                    <td>
                      {record.status === 'On Time' && (
                        <span className="badge badge-ontime">On Time</span>
                      )}
                      {record.status === 'Late' && (
                        <span className="badge badge-late">Late</span>
                      )}
                      {record.status === 'Leave' && (
                        <span className="badge badge-leave">Leave</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                    No employee attendance records found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="table-footer">
          <span>Showing {filteredRecords.length} of {filteredRecords.length} employees</span>
          <div className="pagination">
            <button className="page-btn">Prev</button>
            <button className="page-btn active">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
