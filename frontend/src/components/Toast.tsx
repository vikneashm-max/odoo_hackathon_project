import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: '10px',
        color: '#ffffff',
        backgroundColor: isSuccess ? '#15803d' : isError ? '#b91c1c' : '#4338ca',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
        animation: 'slideIn 0.2s ease-out',
        maxWidth: '380px',
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      {isSuccess && <CheckCircle2 size={18} />}
      {isError && <AlertCircle size={18} />}
      {!isSuccess && !isError && <Info size={18} />}

      <span style={{ flex: 1 }}>{toast.message}</span>

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
