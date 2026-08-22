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
  const [monthIndex, setMonthIndex] = useState<number>(0);
  const months = ['October 2024', 'November 2024', 'December 2024'];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarTiles = [
    { date: 29, isOtherMonth: true, isWeekend: false, status: 'normal' },
    { date: 30, isOtherMonth: true, isWeekend: false, status: 'normal' },
    { date: 1, isOtherMonth: false, isWeekend: false, status: 'normal' },
    { date: 2, isOtherMonth: false, isWeekend: false, status: 'normal' },
    { date: 3, isOtherMonth: false, isWeekend: false, status: 'normal' },
    { date: 4, isOtherMonth: false, isWeekend: false, status: 'normal' },
    { date: 5, isOtherMonth: false, isWeekend: true, status: 'weekend' },

    { date: 6, isOtherMonth: false, isWeekend: true, status: 'weekend' },
    { date: 7, isOtherMonth: false, isWeekend: false, status: 'normal' },
    { date: 8, isOtherMonth: false, isWeekend: false, status: 'normal' },
    { date: 9, isOtherMonth: false, isWeekend: false, status: 'normal' },
    { date: 10, isOtherMonth: false, isWeekend: false, status: 'approved' },
    { date: 11, isOtherMonth: false, isWeekend: false, status: 'approved' },
    { date: 12, isOtherMonth: false, isWeekend: true, status: 'weekend' },

    { date: 13, isOtherMonth: false, isWeekend: true, status: 'weekend' },
    { date: 14, isOtherMonth: false, isWeekend: false, status: 'pending' },
    { date: 15, isOtherMonth: false, isWeekend: false, status: 'normal' },
    { date: 16, isOtherMonth: false, isWeekend: false, status: 'normal' },
    { date: 17, isOtherMonth: false, isWeekend: false, status: 'normal' },
    { date: 18, isOtherMonth: false, isWeekend: false, status: 'normal' },
    { date: 19, isOtherMonth: false, isWeekend: true, status: 'weekend' },

    { date: 20, isOtherMonth: false, isWeekend: true, status: 'weekend' },
  ];

  const handlePrevMonth = () => {
    setMonthIndex((prev) => (prev > 0 ? prev - 1 : months.length - 1));
  };

  const handleNextMonth = () => {
    setMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : 0));
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
              <span>{balance.paidTimeOff.toString().padStart(2, '0')}</span>
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
              <span>{balance.sickTimeOff.toString().padStart(2, '0')}</span>
              <span className="leave-card-subtitle">Days Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View Card */}
      <div className="calendar-card">
        <div className="calendar-header">
          <h2 className="calendar-title">{months[monthIndex]}</h2>
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
              <div className={tileClass} key={idx}>
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
