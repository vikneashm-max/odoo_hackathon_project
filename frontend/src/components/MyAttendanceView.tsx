import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import type { PersonalAttendanceRecord } from '../types';

interface MyAttendanceViewProps {
  personalRecords: PersonalAttendanceRecord[];
}

export const MyAttendanceView: React.FC<MyAttendanceViewProps> = ({ personalRecords }) => {
  const [inOutToggle, setInOutToggle] = useState<'In' | 'Out'>('In');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(0);

  const months = ['October 2023', 'November 2023', 'December 2023'];

  const handlePrevMonth = () => {
    setSelectedMonthIndex((prev) => (prev > 0 ? prev - 1 : months.length - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : 0));
  };

  const presentCount = personalRecords.filter((r) => r.status === 'Present').length;
  const leaveCount = personalRecords.filter((r) => r.status === 'Leave').length;

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

            <span className="date-nav-label" style={{ minWidth: '100px', textAlign: 'center' }}>
              {months[selectedMonthIndex]}
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
          <span className="stat-value">{personalRecords.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg. Work Hours</span>
          <span className="stat-value">{personalRecords.length > 0 ? '8h 15m' : '0h 00m'}</span>
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
              {personalRecords.length > 0 ? (
                personalRecords.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600, color: '#111827' }}>{row.date}</td>
                    <td>
                      {row.status === 'Present' ? (
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
            <button className="page-btn">Prev</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
