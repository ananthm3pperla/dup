import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isDemoMode } from "@/lib/demo";

export interface Notification {
  id: string;
  type: "pulse" | "schedule" | "team" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  emailNotifications: boolean;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  toggleEmailNotifications: () => void;
  initialize: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      emailNotifications: true,

      addNotification: (notification) => {
        const newNotification: Notification = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          read: false,
          ...notification,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));

        // If email notifications are enabled and it's a pulse notification,
        // trigger email notification
        if (get().emailNotifications && notification.type === "pulse") {
          // In a real app, this would call an API endpoint to send the email
          console.log("Sending email notification:", notification);
        }
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      clearNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },

      toggleEmailNotifications: () => {
        set((state) => ({
          emailNotifications: !state.emailNotifications,
        }));
      },

      initialize: () => {
        // Add demo notifications if in demo mode
        if (isDemoMode()) {
          const demoNotifications: Notification[] = [
            {
              id: "1",
              type: "pulse",
              title: "Team Member Pulse Alert",
              message:
                "Sarah Chen has reported 3 consecutive challenging days. Consider checking in.",
              timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
              read: false,
            },
            {
              id: "2",
              type: "schedule",
              title: "Schedule Update",
              message:
                "The team anchor days for next week have been set to Tuesday and Thursday.",
              timestamp: new Date(
                Date.now() - 1000 * 60 * 60 * 2,
              ).toISOString(), // 2 hours ago
              read: true,
            },
            {
              id: "3",
              type: "team",
              title: "New Team Member",
              message: "Michael Zhang has joined the Engineering Team.",
              timestamp: new Date(
                Date.now() - 1000 * 60 * 60 * 24,
              ).toISOString(), // 1 day ago
              read: true,
            },
          ];

          set({
            notifications: demoNotifications,
            unreadCount: demoNotifications.filter((n) => !n.read).length,
          });
        }
      },
    }),
    {
      name: "notification-store",
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        emailNotifications: state.emailNotifications,
      }),
    },
  ),
);

// Initialize store when in demo mode
if (isDemoMode()) {
  useNotificationStore.getState().initialize();
}
