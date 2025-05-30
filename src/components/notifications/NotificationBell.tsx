import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Mail, Mail as MailOff, Settings } from 'lucide-react';
import { useNotificationStore } from '@/lib/store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    emailNotifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    toggleEmailNotifications,
  } = useNotificationStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellIconRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          bellIconRef.current && !bellIconRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'pulse':
        return '🔔';
      case 'schedule':
        return '📅';
      case 'team':
        return '👥';
      default:
        return 'ℹ️';
    }
  };

  const bellAnimation = {
    initial: { rotate: 0 },
    ring: {
      rotate: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      }
    }
  };

  const badgeAnimation = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 15 } }
  };

  return (
    <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
      <motion.button
        ref={bellIconRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        aria-label="View notifications"
        animate={unreadCount > 0 ? "ring" : "initial"}
        variants={bellAnimation}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span 
              className="absolute top-0 right-0 block h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center transform translate-x-1/2 -translate-y-1/2 shadow-sm"
              variants={badgeAnimation}
              initial="initial"
              animate="animate"
              exit={{ scale: 0, opacity: 0 }}
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-full sm:w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-200 dark:border-gray-700"
            style={{ maxWidth: 'calc(100vw - 24px)' }}
          >
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleEmailNotifications}
                    className={`p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                      emailNotifications
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                    title={`${emailNotifications ? 'Disable' : 'Enable'} email notifications`}
                    aria-label={`${emailNotifications ? 'Disable' : 'Enable'} email notifications`}
                  >
                    {emailNotifications ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <MailOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => window.location.href = '/settings/notifications'}
                    className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    title="Notification settings"
                    aria-label="Notification settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        markAllAsRead();
                        clearNotifications();
                      }}
                      className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      aria-label="Clear all notifications"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {notifications.length === 0 ? (
                <motion.div 
                  className="p-6 sm:p-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                    <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No notifications
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    We'll notify you when something requires your attention
                  </p>
                </motion.div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ x: 2, backgroundColor: 'rgba(var(--color-primary), 0.05)' }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 text-xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            {formatDistanceToNow(new Date(notification.timestamp), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <motion.div 
                            className="flex-shrink-0"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                          >
                            <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-primary"></div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg sticky bottom-0">
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-primary hover:text-primary-light dark:text-primary-light dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded p-1"
                    aria-label="Mark all as read"
                  >
                    <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}