import React, { useState } from 'react';
import type { Employee } from '../types';

interface AvatarProps {
  employee?: Partial<Employee> | null;
  name?: string;
  avatarUrl?: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  showStatusDot?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  employee,
  name,
  avatarUrl,
  size = 38,
  className = '',
  style = {},
  showStatusDot = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const displayName = employee?.fullName || employee?.name || name || 'Employee';
  const url = avatarUrl !== undefined ? avatarUrl : employee?.avatarUrl;

  const getInitials = () => {
    if (employee?.avatarInitials) return employee.avatarInitials;
    const parts = displayName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase() || 'EP';
  };

  const initials = getInitials();
  const numSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 38;

  const hasValidImage = url && !imgError;

  return (
    <div
      className={`avatar-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${numSize}px`,
        height: `${numSize}px`,
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        className="avatar-circle purple-bg"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
        }}
      >
        {hasValidImage ? (
          <img
            src={url}
            alt=""
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <span
            style={{
              userSelect: 'none',
              lineHeight: 1,
              fontWeight: 700,
              fontSize: `${Math.max(10, Math.round(numSize * 0.42))}px`,
              color: '#ffffff',
            }}
          >
            {initials}
          </span>
        )}
      </div>

      {showStatusDot && (
        <span
          className="avatar-status-dot"
          style={{
            position: 'absolute',
            bottom: '0px',
            right: '0px',
            width: `${Math.max(8, Math.round(numSize * 0.26))}px`,
            height: `${Math.max(8, Math.round(numSize * 0.26))}px`,
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            border: '2px solid #ffffff',
            boxShadow: '0 0 6px rgba(34, 197, 94, 0.6)',
            zIndex: 4,
          }}
        ></span>
      )}
    </div>
  );
};
