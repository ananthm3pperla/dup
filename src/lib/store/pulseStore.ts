import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, isSameDay, subDays } from 'date-fns';
import { useNotificationStore } from './notificationStore';
import { isDemoMode } from '@/lib/demo';

export type Mood = 'challenging' | 'neutral' | 'good';

export interface DailyPulse {
  mood: Mood;
  timestamp: string;
  notes?: string;
}

export interface NotificationPreference {
  consecutiveChallenging: number;
  challengingPerWeek: number;
  enabled: boolean;
  notifyTeamLeader: boolean;
}

interface PulseState {
  pulses: { [date: string]: DailyPulse };
  notificationPreferences: NotificationPreference;
  addPulse: (pulse: DailyPulse) => void;
  updateNotificationPreferences: (prefs: Partial<NotificationPreference>) => void;
  getConsecutiveChallengingDays: () => number;
  getWeeklyChallenging: () => number;
  shouldNotifyManager: () => boolean;
  getLatestPulse: () => DailyPulse | null;
  initialize: () => void;
}

export const usePulseStore = create<PulseState>()(
  persist(
    (set, get) => ({
      pulses: {},
      notificationPreferences: {
        consecutiveChallenging: 3,
        challengingPerWeek: 3,
        enabled: true,
        notifyTeamLeader: true
      },

      addPulse: (pulse) => {
        const date = new Date(pulse.timestamp).toISOString().split('T')[0];
        set((state) => ({
          pulses: {
            ...state.pulses,
            [date]: pulse
          }
        }));

        // Check if we should notify the manager
        const { notificationPreferences } = get();
        if (notificationPreferences.enabled && notificationPreferences.notifyTeamLeader) {
          const consecutiveDays = get().getConsecutiveChallengingDays();
          const weeklyCount = get().getWeeklyChallenging();

          if (pulse.mood === 'challenging') {
            // Add notification for consecutive challenging days
            if (consecutiveDays >= notificationPreferences.consecutiveChallenging) {
              useNotificationStore.getState().addNotification({
                type: 'pulse',
                title: 'Team Member Alert',
                message: `A team member has reported ${consecutiveDays} consecutive challenging days. Consider checking in with them.`,
                data: { consecutiveDays }
              });
            }

            // Add notification for weekly challenging days
            if (weeklyCount >= notificationPreferences.challengingPerWeek) {
              useNotificationStore.getState().addNotification({
                type: 'pulse',
                title: 'Weekly Pulse Alert',
                message: `A team member has reported ${weeklyCount} challenging days this week.`,
                data: { weeklyCount }
              });
            }
          }
        }
      },

      updateNotificationPreferences: (prefs) => {
        set((state) => ({
          notificationPreferences: {
            ...state.notificationPreferences,
            ...prefs
          }
        }));
      },

      getConsecutiveChallengingDays: () => {
        const { pulses } = get();
        let count = 0;
        let currentDate = new Date();

        while (true) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const pulse = pulses[dateStr];

          if (!pulse || pulse.mood !== 'challenging') {
            break;
          }

          count++;
          currentDate = subDays(currentDate, 1);
        }

        return count;
      },

      getWeeklyChallenging: () => {
        const { pulses } = get();
        const today = new Date();
        const weekStart = subDays(today, 6); // Last 7 days
        
        return Object.entries(pulses).reduce((count, [dateStr, pulse]) => {
          const pulseDate = new Date(dateStr);
          if (pulseDate >= weekStart && pulseDate <= today && pulse.mood === 'challenging') {
            return count + 1;
          }
          return count;
        }, 0);
      },

      shouldNotifyManager: () => {
        const { notificationPreferences } = get();
        if (!notificationPreferences.enabled || !notificationPreferences.notifyTeamLeader) {
          return false;
        }

        const consecutiveDays = get().getConsecutiveChallengingDays();
        const weeklyCount = get().getWeeklyChallenging();

        return consecutiveDays >= notificationPreferences.consecutiveChallenging ||
               weeklyCount >= notificationPreferences.challengingPerWeek;
      },

      getLatestPulse: () => {
        const { pulses } = get();
        const today = new Date().toISOString().split('T')[0];
        return pulses[today] || null;
      },

      initialize: () => {
        if (isDemoMode()) {
          try {
            const demoPulseData = sessionStorage.getItem('demoPulseData');
            if (demoPulseData) {
              const data = JSON.parse(demoPulseData);
              set({
                pulses: data.pulses || {},
                notificationPreferences: data.notificationPreferences || {
                  consecutiveChallenging: 3,
                  challengingPerWeek: 3,
                  enabled: true,
                  notifyTeamLeader: true
                }
              });
            } else {
              // Set default demo data
              const today = new Date().toISOString().split('T')[0];
              set({
                pulses: {
                  [today]: {
                    mood: 'good',
                    timestamp: new Date().toISOString(),
                    notes: 'Feeling productive today in demo mode!'
                  }
                }
              });
            }
          } catch (error) {
            console.error('Error loading demo pulse data:', error);
          }
        }
      }
    }),
    {
      name: 'pulse-store',
      partialize: (state) => ({
        pulses: state.pulses,
        notificationPreferences: state.notificationPreferences
      }),
    }
  )
);

// Initialize store when in demo mode
if (isDemoMode()) {
  usePulseStore.getState().initialize();
}