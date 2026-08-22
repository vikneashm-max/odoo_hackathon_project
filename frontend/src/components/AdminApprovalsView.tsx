import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { LeaveRequestItem, EmployeeIssue } from '../types';

interface AdminApprovalsViewProps {
  leaveRequests: LeaveRequestItem[];
  issues: EmployeeIssue[];
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  onResolveIssue: (id: string) => void;
  onRejectIssue: (id: string) => void;
}

export const AdminApprovalsView: React.FC<AdminApprovalsViewProps> = ({
  leaveRequests,
  issues,
  onApproveLeave,
  onRejectLeave,
  onResolveIssue,
  onRejectIssue,
}) => {
  const pendingLeaves = leaveRequests.filter((r) => r.status === 'Pending');
  const pendingIssues = issues.filter((i) => i.status === 'Pending');

  return (
    <div className="admin-approvals-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Leave & Issue Approvals</h1>
          <p>Review and resolve pending employee leave requests and help desk issues.</p>
        </div>
      </div>

      {/* Leave Requests Queue */}
      <div style={{ marginBottom: '36px' }}>
        <h2 className="font-serif" style={{ fontSize: '20px', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="#6d28d9" />
          <span>Pending Leave Requests ({pendingLeaves.length})</span>
        </h2>

        <div className="card-container">
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((req) => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 600, color: '#111827' }}>{req.employeeName}</td>
                      <td>
                        <span
                          className={`badge ${
                            req.leaveType === 'paid' ? 'badge-ontime' : 'badge-late'
                          }`}
                        >
                          {req.leaveType === 'paid' ? 'Paid Time Off' : 'Sick Leave'}
                        </span>
                      </td>
                      <td>{req.startDate} to {req.endDate}</td>
                      <td style={{ maxWidth: '240px', color: '#4b5563' }}>{req.reason || 'N/A'}</td>
                      <td>
                        {req.status === 'Pending' && (
                          <span className="badge badge-leave">Pending</span>
                        )}
                        {req.status === 'Approved' && (
                          <span className="badge badge-ontime">Approved</span>
                        )}
                        {req.status === 'Rejected' && (
                          <span className="badge badge-late">Rejected</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {req.status === 'Pending' ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => onApproveLeave(req.id)}
                              style={{
                                background: '#166534',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>
                            <button
                              onClick={() => onRejectLeave(req.id)}
                              style={{
                                background: '#ffffff',
                                color: '#991b1b',
                                border: '1px solid #fca5a5',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#9ca3af' }}>
                      No leave requests submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employee Help Desk Issues Queue */}
      <div>
        <h2 className="font-serif" style={{ fontSize: '20px', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} color="#db2777" />
          <span>Employee Help Tickets & Issues ({pendingIssues.length})</span>
        </h2>

        <div className="card-container">
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Category</th>
                  <th>Subject & Details</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.length > 0 ? (
                  issues.map((issue) => (
                    <tr key={issue.id}>
                      <td style={{ fontWeight: 600, color: '#111827' }}>{issue.employeeName}</td>
                      <td>
                        <span className="badge badge-leave">{issue.category}</span>
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ fontWeight: 600, color: '#111827', fontSize: '13px' }}>{issue.subject}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{issue.description}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: '#6b7280' }}>{issue.submittedAt}</td>
                      <td>
                        {issue.status === 'Pending' && <span className="badge badge-late">Pending</span>}
                        {issue.status === 'Resolved' && <span className="badge badge-ontime">Resolved</span>}
                        {issue.status === 'Rejected' && <span className="badge badge-late">Rejected</span>}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {issue.status === 'Pending' ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => onResolveIssue(issue.id)}
                              style={{
                                background: '#6d28d9',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => onRejectIssue(issue.id)}
                              style={{
                                background: '#ffffff',
                                color: '#6b7280',
                                border: '1px solid #e5e7eb',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                              }}
                            >
                              Dismiss
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#9ca3af' }}>
                      No employee help tickets or issues reported.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
