'use client';

import { useNotificationStore } from '@/stores/notification';

const variantLabels: Record<string, string> = {
  success: 'Success',
  info: 'Info',
  warning: 'Warning',
  error: 'Error',
};

export function NotificationToast() {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="toast-viewport">
      {notifications.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.variant}`}>
          <div className="toast-header">
            <span>{variantLabels[toast.variant]}</span>
            <button
              type="button"
              className="toast-close"
              aria-label="Dismiss notification"
              onClick={() => removeNotification(toast.id)}
            >
              ×
            </button>
          </div>
          <strong>{toast.title}</strong>
          <p>{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
