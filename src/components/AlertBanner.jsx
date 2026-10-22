import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, RefreshCw, X } from 'lucide-react';

const ICONS = { error: AlertTriangle, success: CheckCircle2, info: Info };

/* Dismissible banner. For network errors pass onRetry to render the "Retry" button. */
export default function AlertBanner({ type = 'error', title, message, onRetry, onDismiss, className = '' }) {
  const [visible, setVisible] = useState(true);
  const Icon = ICONS[type];

  // A new message must be seen even if the previous one was dismissed.
  useEffect(() => setVisible(true), [title, message]);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className={`alert alert--${type} ${className}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon size={20} className="alert__icon" aria-hidden="true" />
      <div className="alert__body">
        {title && <strong>{title}</strong>}
        {message && <p>{message}</p>}
      </div>
      {onRetry && (
        <button type="button" className="btn btn--small btn--ghost" onClick={onRetry}>
          <RefreshCw size={14} aria-hidden="true" /> Retry
        </button>
      )}
      <button type="button" className="icon-btn" onClick={dismiss} aria-label="Dismiss message">
        <X size={16} />
      </button>
    </div>
  );
}
