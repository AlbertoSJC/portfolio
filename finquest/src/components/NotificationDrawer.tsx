'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotificationStore } from '@/stores/notification';

const variantColors: Record<string, string> = {
  success: '#10b981',
  info: '#3b82f6',
  warning: '#f59e0b',
  error: '#ef4444',
};

export function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const history = useNotificationStore((state) => state.history);
  const clearHistory = useNotificationStore((state) => state.clearHistory);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <motion.button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.5, repeat: history.length > 0 ? Infinity : 0, repeatDelay: 3 }}
      >
        🔔
        {history.length > 0 && <span className="notification-badge">{history.length}</span>}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="notification-drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="notification-drawer"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="drawer-header">
                <h3>Notifications</h3>
                <button
                  className="drawer-close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close notifications"
                >
                  ✕
                </button>
              </div>

              {history.length === 0 ? (
                <div className="drawer-empty">
                  <p>No notifications yet</p>
                </div>
              ) : (
                <>
                  <div className="drawer-list">
                    {history.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${notification.variant}`}
                        style={{
                          borderLeftColor: variantColors[notification.variant],
                        }}
                      >
                        <div className="notification-dot" style={{ backgroundColor: variantColors[notification.variant] }} />
                        <div className="notification-content">
                          <div className="notification-header">
                            <strong>{notification.title}</strong>
                            <span className="notification-time">{formatTime(notification.timestamp)}</span>
                          </div>
                          <p>{notification.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="drawer-clear-btn" onClick={clearHistory}>
                    Clear History
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
