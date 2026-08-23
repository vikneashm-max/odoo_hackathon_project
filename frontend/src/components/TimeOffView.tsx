import React, { useState } from 'react';
import { Plus, Plane, BriefcaseMedical, ChevronLeft, ChevronRight, CheckCircle2, Clock, Eye, XCircle, FileText } from 'lucide-react';
import type { TimeOffBalance, LeaveRequestItem, EmployeeIssue } from '../types';

interface TimeOffViewProps {
  balance: TimeOffBalance;
  leaveRequests?: LeaveRequestItem[];
  issues?: EmployeeIssue[];
  onNewRequestClick: () => void;
}

export type ProcessStage = 'sent' | 'seen' | 'accepted' | 'rejected';

export interface CalendarTileData {
  date: number;
  fullDateStr?: string;
  isOtherMonth: boolean;
  isWeekend: boolean;
  requestItem?: {
    type: 'leave' | 'issue';
    title: string;
    stage: ProcessStage;
    details?: string;
  };
}

export const TimeOffView: React.FC<TimeOffViewProps> = ({
  balance,
  leaveRequests = [],
  issues = [],
  onNewRequestClick,
}) => {
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [selectedTileRequest, setSelectedTileRequest] = useState<{
    dateStr: string;
    title: string;
    stage: ProcessStage;
    type: string;
  } | null>(null);

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

  const calendarTiles: CalendarTileData[] = [];

  // Helper to match dates
  const isDateMatch = (targetDateStr: string, startDateStr: string, endDateStr?: string) => {
    try {
      const target = new Date(targetDateStr).getTime();
      const start = new Date(startDateStr).getTime();
      const end = endDateStr ? new Date(endDateStr).getTime() : start;
      return target >= start && target <= end;
    } catch (e) {
      return targetDateStr === startDateStr;
    }
  };

  // Helper to map leave status to process stage
  const getLeaveStage = (status: string): ProcessStage => {
    if (status === 'Approved') return 'accepted';
    if (status === 'Rejected') return 'rejected';
    return 'sent';
  };

  // Helper to map issue status to process stage
  const getIssueStage = (status: string): ProcessStage => {
    if (status === 'Resolved') return 'accepted';
    if (status === 'Rejected') return 'rejected';
    if (status === 'In Progress') return 'seen';
    return 'sent';
  };

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarTiles.push({
      date: prevMonthDays - i,
      isOtherMonth: true,
      isWeekend: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month, d);
    const dayOfWeek = dayDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const fullDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // Find matching leave request
    const matchingLeave = leaveRequests.find((l) => isDateMatch(fullDateStr, l.startDate, l.endDate));
    // Find matching issue
    const matchingIssue = issues.find((iss) => isDateMatch(fullDateStr, iss.submittedAt));

    let requestItem: CalendarTileData['requestItem'];

    if (matchingLeave) {
      requestItem = {
        type: 'leave',
        title: matchingLeave.leaveType === 'paid' ? 'Paid Leave' : 'Sick Leave',
        stage: getLeaveStage(matchingLeave.status),
        details: matchingLeave.reason,
      };
    } else if (matchingIssue) {
      requestItem = {
        type: 'issue',
        title: matchingIssue.category,
        stage: getIssueStage(matchingIssue.status),
        details: matchingIssue.subject,
      };
    }

    calendarTiles.push({
      date: d,
      fullDateStr,
      isOtherMonth: false,
      isWeekend,
      requestItem,
    });
  }

  // Next month leading days to complete grid
  const remaining = 42 - calendarTiles.length;
  for (let i = 1; i <= remaining; i++) {
    calendarTiles.push({
      date: i,
      isOtherMonth: true,
      isWeekend: false,
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
          <h1>Time Off & Leave Requests</h1>
          <p>View your leave balances, calendar schedule, and request status timeline</p>
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

      {/* Request Process Lifecycle Tracker Banner */}
      {selectedTileRequest && (
        <div className="request-tracker-card">
          <div className="tracker-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--primary)" />
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                Request Process Timeline: {selectedTileRequest.title} ({selectedTileRequest.dateStr})
              </span>
            </div>
            <button className="btn-ghost" onClick={() => setSelectedTileRequest(null)} style={{ padding: '2px 8px' }}>
              ✕ Close
            </button>
          </div>

          <div className="process-stepper-container">
            {/* Step 1: Sent */}
            <div className={`stepper-step ${['sent', 'seen', 'accepted', 'rejected'].includes(selectedTileRequest.stage) ? 'completed' : ''}`}>
              <div className="stepper-icon">
                <Clock size={16} />
              </div>
              <div className="stepper-labels">
                <span className="stepper-title">1. Sent</span>
                <span className="stepper-desc">Request submitted</span>
              </div>
            </div>

            <div className={`stepper-line ${['seen', 'accepted', 'rejected'].includes(selectedTileRequest.stage) ? 'active' : ''}`} />

            {/* Step 2: Seen */}
            <div className={`stepper-step ${['seen', 'accepted', 'rejected'].includes(selectedTileRequest.stage) ? 'completed' : ''}`}>
              <div className="stepper-icon">
                <Eye size={16} />
              </div>
              <div className="stepper-labels">
                <span className="stepper-title">2. Seen</span>
                <span className="stepper-desc">Under HR review</span>
              </div>
            </div>

            <div className={`stepper-line ${['accepted', 'rejected'].includes(selectedTileRequest.stage) ? 'active' : ''}`} />

            {/* Step 3: Accepted or Rejected */}
            <div className={`stepper-step ${selectedTileRequest.stage === 'accepted' ? 'accepted' : selectedTileRequest.stage === 'rejected' ? 'rejected' : ''}`}>
              <div className="stepper-icon">
                {selectedTileRequest.stage === 'rejected' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
              </div>
              <div className="stepper-labels">
                <span className="stepper-title">
                  {selectedTileRequest.stage === 'rejected' ? '3. Rejected' : '3. Accepted'}
                </span>
                <span className="stepper-desc">
                  {selectedTileRequest.stage === 'rejected' ? 'Declined by Admin' : 'Approved by Admin'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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

        {/* 7-Column Calendar Grid */}
        <div className="calendar-grid">
          {weekDays.map((day) => (
            <div className="calendar-day-header" key={day}>
              {day}
            </div>
          ))}

          {calendarTiles.map((tile, idx) => {
            let tileClass = 'calendar-tile';
            if (tile.isOtherMonth) tileClass += ' other-month';
            else if (tile.isWeekend) tileClass += ' weekend-tile';
            if (tile.requestItem) tileClass += ` tile-has-request stage-${tile.requestItem.stage}`;

            return (
              <div 
                className={tileClass} 
                key={idx}
                onClick={() => {
                  if (tile.requestItem && tile.fullDateStr) {
                    setSelectedTileRequest({
                      dateStr: tile.fullDateStr,
                      title: tile.requestItem.title,
                      stage: tile.requestItem.stage,
                      type: tile.requestItem.type,
                    });
                  } else if (!tile.isOtherMonth) {
                    onNewRequestClick();
                  }
                }}
                style={{ cursor: tile.isOtherMonth ? 'default' : 'pointer' }}
                title={
                  tile.requestItem
                    ? `${tile.requestItem.title} - Process Status: ${tile.requestItem.stage.toUpperCase()}`
                    : !tile.isOtherMonth
                    ? `Click to request time off starting ${tile.fullDateStr}`
                    : ''
                }
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                  <span>{tile.date}</span>

                  {tile.requestItem && (
                    <span className={`process-badge badge-stage-${tile.requestItem.stage}`}>
                      {tile.requestItem.stage === 'sent' && 'Sent ↗'}
                      {tile.requestItem.stage === 'seen' && 'Seen 👁'}
                      {tile.requestItem.stage === 'accepted' && 'Accepted ✓'}
                      {tile.requestItem.stage === 'rejected' && 'Rejected ✕'}
                    </span>
                  )}
                </div>

                {tile.requestItem && (
                  <div className="tile-request-details">
                    <span className="tile-request-title">{tile.requestItem.title}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Calendar Legend Footer with Process Stages */}
        <div className="calendar-legend">
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginRight: '8px' }}>Request Process Stages:</span>
          <div className="legend-item">
            <span className="legend-badge badge-stage-sent">Sent ↗</span>
            <span>Submitted</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge badge-stage-seen">Seen 👁</span>
            <span>Under Review</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge badge-stage-accepted">Accepted ✓</span>
            <span>Approved</span>
          </div>
          <div className="legend-item">
            <span className="legend-badge badge-stage-rejected">Rejected ✕</span>
            <span>Declined</span>
          </div>
        </div>
      </div>
    </div>
  );
};
