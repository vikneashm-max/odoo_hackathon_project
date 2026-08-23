import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import type { PersonalAttendanceRecord } from '../types';

interface MyAttendanceViewProps {
  personalRecords: PersonalAttendanceRecord[];
}

export const MyAttendanceView: React.FC<MyAttendanceViewProps> = ({ personalRecords }) => {
  const [inOutToggle, setInOutToggle] = useState<'In' | 'Out'>('In');
  const [monthOffset, setMonthOffset] = useState<number>(0);

  const now = new Date();
  const currentMonthDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const currentMonthLabel = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setMonthOffset((prev) => prev - 1);
  };

  const handleNextMonth = () => {
    setMonthOffset((prev) => prev + 1);
  };

  const safeRecords = personalRecords || [];
  const presentCount = safeRecords.filter((r) => r.status === 'PRESENT' || r.status === 'Present').length;
  const leaveCount = safeRecords.filter((r) => r.status === 'LEAVE' || r.status === 'Leave').length;

  const calculateAvgHours = () => {
    if (safeRecords.length === 0) return '0h 00m';
    const totalMinutes = safeRecords.reduce((acc, r) => {
      if (r.workHours && typeof r.workHours === 'string' && r.workHours.includes(':')) {
        const [h, m] = r.workHours.split(':').map(Number);
        return acc + (h || 0) * 60 + (m || 0);
      } else if (r.workHours && typeof r.workHours === 'string' && r.workHours.includes('h')) {
        const h = parseFloat(r.workHours.replace('h', '')) || 8;
        return acc + h * 60;
      }
      return acc + 480; // default 8h
    }, 0);
    const avgMin = Math.round(totalMinutes / safeRecords.length);
    const hours = Math.floor(avgMin / 60);
    const mins = avgMin % 60;
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  };

  return (
    <div className="my-attendance-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title-group">
          <h1>My Attendance</h1>
          <p>Track your daily working hours and attendance records.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* In / Out Toggle */}
          <div className="view-toggle">
            <button
              className={`toggle-option ${inOutToggle === 'In' ? 'active' : ''}`}
              onClick={() => setInOutToggle('In')}
            >
              In
            </button>
            <button
              className={`toggle-option ${inOutToggle === 'Out' ? 'active' : ''}`}
              onClick={() => setInOutToggle('Out')}
            >
              Out
            </button>
          </div>

          {/* Month Selector */}
          <div className="date-nav-group">
            <button className="date-nav-arrow" onClick={handlePrevMonth} title="Previous Month">
              <ChevronLeft size={16} />
            </button>

            <span className="date-nav-label" style={{ minWidth: '120px', textAlign: 'center' }}>
              {currentMonthLabel}
            </span>

            <button className="date-nav-arrow" onClick={handleNextMonth} title="Next Month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Days Present</span>
          <span className="stat-value">{presentCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Leaves Count</span>
          <span className="stat-value">{leaveCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Working Days</span>
          <span className="stat-value">{safeRecords.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg. Work Hours</span>
          <span className="stat-value">{calculateAvgHours()}</span>
        </div>
      </div>

      {/* History Table */}
      <div className="card-container">
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Hours</th>
                <th>Extra Hours</th>
              </tr>
            </thead>
            <tbody>
              {safeRecords.length > 0 ? (
                safeRecords.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600, color: '#111827' }}>{row.date}</td>
                    <td>
                      {row.status === 'Present' || row.status === 'PRESENT' ? (
                        <span className="badge-dot">
                          <span className="dot-green"></span>
                          <span>Present</span>
                        </span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>Leave</span>
                      )}
                    </td>
                    <td>
                      <span>{row.checkIn}</span>
                      {row.isLate && (
                        <span
                          style={{
                            marginLeft: '8px',
                            fontSize: '11px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            padding: '1px 6px',
                            color: '#6b7280',
                          }}
                        >
                          Late
                        </span>
                      )}
                    </td>
                    <td>{row.checkOut}</td>
                    <td>{row.workHours}</td>
                    <td>{row.extraHours}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: '#9ca3af' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <CalendarCheck size={36} color="#c084fc" />
                      <span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>No Attendance Records</span>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>Clock in using the widget to start recording your daily attendance.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="table-footer">
          <span>Showing {personalRecords.length} of {personalRecords.length} entries</span>
          <div className="pagination">
            <button className="page-btn" disabled>Prev</button>
            <button className="page-btn active">1</button>
            <button className="page-btn" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
