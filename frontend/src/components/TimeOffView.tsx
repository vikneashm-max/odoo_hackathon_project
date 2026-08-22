import React, { useState } from 'react';
import { Plus, Plane, BriefcaseMedical, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TimeOffBalance } from '../types';

interface TimeOffViewProps {
  balance: TimeOffBalance;
  onNewRequestClick: () => void;
}

export const TimeOffView: React.FC<TimeOffViewProps> = ({
  balance,
  onNewRequestClick,
}) => {
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const now = new Date();
  
  const currentMonthDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Dynamic calendar calculation
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarTiles = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarTiles.push({
      date: prevMonthDays - i,
      isOtherMonth: true,
      isWeekend: false,
      status: 'normal',
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month, d);
    const dayOfWeek = dayDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let status = 'normal';
    if (isWeekend) {
      status = 'weekend';
    }

    calendarTiles.push({
      date: d,
      fullDateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isOtherMonth: false,
      isWeekend,
      status,
    });
  }

  // Next month leading days to complete grid
  const remaining = 42 - calendarTiles.length;
  for (let i = 1; i <= remaining; i++) {
    calendarTiles.push({
      date: i,
      isOtherMonth: true,
      isWeekend: false,
      status: 'normal',
    });
  }

  const handlePrevMonth = () => {
    setMonthOffset((prev) => prev - 1);
  };

  const handleNextMonth = () => {
    setMonthOffset((prev) => prev + 1);
  };

  return (
    <div className="time-off-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Time Off Overview</h1>
        </div>

        <button className="btn-primary" onClick={onNewRequestClick}>
          <Plus size={18} />
          <span>New Request</span>
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="leave-cards-grid">
        <div className="leave-card">
          <div className="icon-bubble purple">
            <Plane size={24} />
          </div>
          <div className="leave-card-info">
            <span className="leave-card-title">Paid Time Off</span>
            <div className="leave-card-value">
              <span>{(balance.paidTimeOff || 14).toString().padStart(2, '0')}</span>
              <span className="leave-card-subtitle">Days Available</span>
            </div>
          </div>
        </div>

        <div className="leave-card">
          <div className="icon-bubble pink">
            <BriefcaseMedical size={24} />
          </div>
          <div className="leave-card-info">
            <span className="leave-card-title">Sick Time Off</span>
            <div className="leave-card-value">
              <span>{(balance.sickTimeOff || 7).toString().padStart(2, '0')}</span>
              <span className="leave-card-subtitle">Days Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View Card */}
      <div className="calendar-card">
        <div className="calendar-header">
          <h2 className="calendar-title">{monthName}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="calendar-nav-btn" onClick={handlePrevMonth} title="Previous Month">
              <ChevronLeft size={18} />
            </button>
            <button className="calendar-nav-btn" onClick={handleNextMonth} title="Next Month">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {weekDays.map((day) => (
            <div className="calendar-day-header" key={day}>
              {day}
            </div>
          ))}

          {calendarTiles.map((tile, idx) => {
            let tileClass = 'calendar-tile';
            if (tile.isOtherMonth) tileClass += ' other-month';
            else if (tile.status === 'approved') tileClass += ' approved-tile';
            else if (tile.status === 'pending') tileClass += ' pending-tile';
            else if (tile.isWeekend) tileClass += ' weekend-tile';

            return (
              <div 
                className={tileClass} 
                key={idx}
                onClick={() => {
                  if (!tile.isOtherMonth) {
                    onNewRequestClick();
                  }
                }}
                style={{ cursor: tile.isOtherMonth ? 'default' : 'pointer' }}
                title={!tile.isOtherMonth ? `Click to request time off starting ${tile.fullDateStr}` : ''}
              >
                <span>{tile.date}</span>
                {(tile.status === 'approved' || tile.status === 'pending') && (
                  <span className="tile-dot"></span>
                )}
              </div>
            );
          })}
        </div>

        {/* Calendar Footer Legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot-approved"></span>
            <span>Approved</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot-pending"></span>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
};
