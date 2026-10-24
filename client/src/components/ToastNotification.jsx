import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotification = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const Icon = icons[toast.type] || Info;

  return (
    <div className={`toast-container toast-${toast.type || 'info'}`} role="status" aria-live="polite">
      <div className="toast-icon">
        <Icon size={18} />
      </div>
      <div className="toast-content">
        <div className="toast-title">{toast.title || (toast.type === 'error' ? 'Error' : 'Notice')}</div>
        {toast.message && <div className="toast-message">{toast.message}</div>}
      </div>
      <button 
        type="button" 
        className="toast-close-btn" 
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={15} />
      </button>
    </div>
  );
};
