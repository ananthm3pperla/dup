import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { database } from '../lib/database';
import { toast } from 'sonner';

interface ScheduleEntry {
  id: string;
  user_id: string;
  date: string;
  work_location: 'office' | 'remote' | 'hybrid';
  is_anchor_day?: boolean;
  created_at: string;
  updated_at: string;
}

interface ScheduleContextType {
  scheduleEntries: ScheduleEntry[];
  loading: boolean;
  error: string | null;
  fetchSchedule: (startDate: string, endDate: string) => Promise<void>;
  updateScheduleEntry: (date: string, workLocation: 'office' | 'remote' | 'hybrid') => Promise<void>;
  deleteScheduleEntry: (date: string) => Promise<void>;
  refreshSchedule: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}

interface ScheduleProviderProps {
  children: ReactNode;
}

export function ScheduleProvider({ children }: ScheduleProviderProps) {
  const { user } = useAuth();
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async (startDate: string, endDate: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch schedule entries from database
      const scheduleKeys = await database.list();
      const userScheduleKeys = scheduleKeys.filter(key => 
        key.startsWith(`schedule:${user.id}:`) &&
        key >= `schedule:${user.id}:${startDate}` &&
        key <= `schedule:${user.id}:${endDate}`
      );

      const entries: ScheduleEntry[] = [];
      for (const key of userScheduleKeys) {
        try {
          const entry = await database.get(key);
          if (entry) {
            entries.push(entry as ScheduleEntry);
          }
        } catch (err) {
          console.error(`Error fetching schedule entry ${key}:`, err);
        }
      }

      // Sort entries by date
      entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setScheduleEntries(entries);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Failed to fetch schedule entries');
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const updateScheduleEntry = async (date: string, workLocation: 'office' | 'remote' | 'hybrid') => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      const entryKey = `schedule:${user.id}:${date}`;
      const existingEntry = await database.get(entryKey);

      const entry: ScheduleEntry = {
        id: existingEntry?.id || `schedule_${user.id}_${date}_${Date.now()}`,
        user_id: user.id,
        date,
        work_location: workLocation,
        is_anchor_day: existingEntry?.is_anchor_day || false,
        created_at: existingEntry?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await database.set(entryKey, entry);

      // Update local state
      setScheduleEntries(prev => {
        const filtered = prev.filter(e => e.date !== date);
        return [...filtered, entry].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      });

      toast.success('Schedule updated successfully');
    } catch (err) {
      console.error('Error updating schedule entry:', err);
      setError('Failed to update schedule entry');
      toast.error('Failed to update schedule');
    }
  };

  const deleteScheduleEntry = async (date: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      const entryKey = `schedule:${user.id}:${date}`;
      await database.delete(entryKey);

      // Update local state
      setScheduleEntries(prev => prev.filter(entry => entry.date !== date));
      toast.success('Schedule entry deleted');
    } catch (err) {
      console.error('Error deleting schedule entry:', err);
      setError('Failed to delete schedule entry');
      toast.error('Failed to delete schedule entry');
    }
  };

  const refreshSchedule = async () => {
    if (scheduleEntries.length > 0) {
      const dates = scheduleEntries.map(entry => entry.date);
      const startDate = dates.reduce((min, date) => date < min ? date : min);
      const endDate = dates.reduce((max, date) => date > max ? date : max);
      await fetchSchedule(startDate, endDate);
    }
  };

  // Load initial schedule data when user changes
  useEffect(() => {
    if (user) {
      // Load current month by default
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];

      fetchSchedule(startDate, endDate);
    } else {
      setScheduleEntries([]);
      setError(null);
    }
  }, [user]);

  const value: ScheduleContextType = {
    scheduleEntries,
    loading,
    error,
    fetchSchedule,
    updateScheduleEntry,
    deleteScheduleEntry,
    refreshSchedule
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}