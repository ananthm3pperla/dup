import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTeam } from './TeamContext';
import { WeeklySchedule, WorkSchedule } from '../types';
import { startOfWeek, endOfWeek, addDays, addWeeks, format } from 'date-fns';
import { isDemoMode, DEMO_STATIC_SCHEDULES } from '@/lib/demo';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ScheduleContextType {
  userSchedule: WorkSchedule[];
  teamSchedule: WeeklySchedule | null;
  currentWeek: Date;
  nextWeek: Date;
  loading: boolean;
  error: Error | null;
  saveSchedule: (date: string, workType: 'office' | 'remote' | 'flexible', notes?: string) => Promise<string>;
  loadUserSchedule: (startDate?: Date, endDate?: Date) => Promise<WorkSchedule[]>;
  loadTeamSchedule: (startDate?: Date, endDate?: Date) => Promise<WeeklySchedule>;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  setCurrentWeekToDate: (date: Date) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const [userSchedule, setUserSchedule] = useState<WorkSchedule[]>([]);
  const [teamSchedule, setTeamSchedule] = useState<WeeklySchedule | null>(null);
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [nextWeek, setNextWeek] = useState<Date>(addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 1));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Save a work schedule for the current user
  const saveSchedule = async (
    date: string, 
    workType: 'office' | 'remote' | 'flexible', 
    notes?: string
  ) => {
    if (!user) throw new Error('User not logged in');
    
    setLoading(true);
    setError(null);
    try {
      // For demo purposes, just update local state
      if (isDemoMode()) {
        const scheduleId = crypto.randomUUID();
        
        // Update local state - replace if exists, otherwise add
        setUserSchedule(prev => {
          const existing = prev.findIndex(s => s.date === date);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = {
              ...updated[existing],
              work_type: workType,
              notes: notes || null,
              updated_at: new Date().toISOString()
            };
            return updated;
          } else {
            return [...prev, {
              id: scheduleId,
              user_id: user.id,
              date,
              work_type: workType,
              notes: notes || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }];
          }
        });
        
        return scheduleId;
      }
      
      // Check if schedule already exists
      const { data: existingSchedule } = await supabase
        .from('work_schedules')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle();
      
      let scheduleId: string;
      
      if (existingSchedule) {
        // Update existing schedule
        const { data, error } = await supabase
          .from('work_schedules')
          .update({
            work_type: workType,
            notes: notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSchedule.id)
          .select()
          .single();
          
        if (error) throw error;
        scheduleId = data.id;
      } else {
        // Insert new schedule
        const { data, error } = await supabase
          .from('work_schedules')
          .insert({
            user_id: user.id,
            date,
            work_type: workType,
            notes: notes || null
          })
          .select()
          .single();
          
        if (error) throw error;
        scheduleId = data.id;
      }
      
      // Update local state
      await loadUserSchedule();
      await loadTeamSchedule();
      
      return scheduleId;
    } catch (err) {
      console.error('Error saving schedule:', err);
      const error = err instanceof Error ? err : new Error('Failed to save schedule');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Load user's schedule for a date range
  const loadUserSchedule = async (
    startDate: Date = currentWeek,
    endDate: Date = addDays(endOfWeek(currentWeek, { weekStartsOn: 1 }), 7)
  ) => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    try {
      const start = format(startDate, 'yyyy-MM-dd');
      const end = format(endDate, 'yyyy-MM-dd');
      
      // For demo mode, use prepared static data
      if (isDemoMode() && DEMO_STATIC_SCHEDULES) {
        const isCurrentWeek = isSameWeekStart(startDate, currentWeek);
        const scheduleKey = isCurrentWeek ? 'current_week' : 'next_week';
        
        // Ensure the property exists and is an array before mapping
        const scheduleData = DEMO_STATIC_SCHEDULES[scheduleKey] || [];
        
        // Transform to expected format
        const staticSchedule = scheduleData.map(item => ({
          id: `${item.date}-${item.work_type}`,
          user_id: user.id,
          date: item.date,
          work_type: item.work_type,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        setUserSchedule(staticSchedule);
        return staticSchedule;
      }
      
      // Get user schedules from API
      try {
        const response = await fetch(`/api/schedules?user_id=${user.id}&start=${start}&end=${end}`);
        const data = await response.json();
        const error = !response.ok ? new Error(data.error) : null;
          .eq('user_id', user.id)
          .gte('date', start)
          .lte('date', end)
          .order('date');
          
        if (error) throw error;
        
        setUserSchedule(data || []);
        return data || [];
      } catch (fetchError) {
        console.error('Error fetching user schedule:', fetchError);
        
        // Create fallback schedule data to ensure UI still works
        const fallbackSchedule = [];
        
        // Create entries for each weekday in the requested range
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          // Only create entries for weekdays (Mon-Fri)
          const dayOfWeek = currentDate.getDay();
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            fallbackSchedule.push({
              id: `fallback-${format(currentDate, 'yyyy-MM-dd')}`,
              user_id: user.id,
              date: format(currentDate, 'yyyy-MM-dd'),
              // Alternate office and remote
              work_type: dayOfWeek === 2 || dayOfWeek === 4 ? 'office' : 'remote',
              notes: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
          
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        setUserSchedule(fallbackSchedule);
        toast.error("Using fallback schedule data. Some features may be limited.");
        
        // Return our fallback data
        return fallbackSchedule;
      }
    } catch (err) {
      console.error('Error loading user schedule:', err);
      const error = err instanceof Error ? err : new Error('Failed to load user schedule');
      setError(error);
      // Return empty array to prevent UI breaking
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load team schedule for a date range
  const loadTeamSchedule = async (
    startDate: Date = currentWeek,
    endDate: Date = addDays(endOfWeek(currentWeek, { weekStartsOn: 1 }), 7)
  ) => {
    if (!currentTeam?.id) {
      return {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        days: []
      };
    }
    
    setLoading(true);
    setError(null);
    try {
      const start = format(startDate, 'yyyy-MM-dd');
      const end = format(endDate, 'yyyy-MM-dd');
      
      // For demo mode, use prepared static data
      if (isDemoMode() && DEMO_STATIC_SCHEDULES) {
        // Ensure teamSummary exists before accessing it
        const teamSummary = DEMO_STATIC_SCHEDULES.team_summary || {
          Monday: { office: 0, remote: 0 },
          Tuesday: { office: 0, remote: 0 },
          Wednesday: { office: 0, remote: 0 },
          Thursday: { office: 0, remote: 0 },
          Friday: { office: 0, remote: 0 }
        };
        
        const days = Array.from({ length: 5 }, (_, i) => {
          const day = addDays(startDate, i);
          const dayName = format(day, 'EEEE') as keyof typeof teamSummary;
          // Provide default values if the day doesn't exist in the summary
          const summary = teamSummary[dayName] || { office: 0, remote: 0 };
          
          return {
            date: format(day, 'yyyy-MM-dd'),
            schedules: [],
            officeMemberCount: summary.office || 0,
            remoteMemberCount: summary.remote || 0,
            flexibleMemberCount: 0
          };
        });
        
        const schedule = { startDate: start, endDate: end, days };
        setTeamSchedule(schedule);
        return schedule;
      }
      
      // Get team schedule using a simpler approach to avoid RLS issues
      // First, get all team members
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', currentTeam.id);
        
      if (membersError) throw membersError;
      
      // If we have team members, get their schedules
      let scheduleData: any[] = [];
      if (members && members.length > 0) {
        const userIds = members.map(member => member.user_id);
        
        const { data, error } = await supabase
          .from('work_schedules')
          .select(`
            id,
            user_id,
            date,
            work_type,
            notes
          `)
          .in('user_id', userIds)
          .gte('date', start)
          .lte('date', end)
          .order('date');
          
        if (error) throw error;
        scheduleData = data || [];
      }
      
      // Organize schedules by date
      const schedulesByDate = scheduleData.reduce((acc, schedule) => {
        const date = schedule.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(schedule);
        return acc;
      }, {} as Record<string, any[]>);
      
      // Create a date range from start to end
      const daysDiff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
      
      const days = Array.from({ length: daysDiff + 1 }, (_, i) => {
        const day = addDays(new Date(start), i);
        const dateStr = format(day, 'yyyy-MM-dd');
        const daySchedules = schedulesByDate[dateStr] || [];
        
        // Count schedule types
        const officeMemberCount = daySchedules.filter(s => s.work_type === 'office').length;
        const remoteMemberCount = daySchedules.filter(s => s.work_type === 'remote').length;
        const flexibleMemberCount = daySchedules.filter(s => s.work_type === 'flexible').length;
        
        return {
          date: dateStr,
          schedules: daySchedules,
          officeMemberCount,
          remoteMemberCount,
          flexibleMemberCount
        };
      });
      
      const schedule = { startDate: start, endDate: end, days };
      setTeamSchedule(schedule);
      return schedule;
    } catch (err) {
      console.error('Error loading team schedule:', err);
      const error = err instanceof Error ? err : new Error('Failed to load team schedule');
      setError(error);
      
      // Return a valid but empty schedule object
      const emptySchedule = {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        days: []
      };
      setTeamSchedule(emptySchedule);
      return emptySchedule;
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if two dates are in the same week
  function isSameWeekStart(date1: Date, date2: Date): boolean {
    const week1 = startOfWeek(date1, { weekStartsOn: 1 });
    const week2 = startOfWeek(date2, { weekStartsOn: 1 });
    return format(week1, 'yyyy-MM-dd') === format(week2, 'yyyy-MM-dd');
  }

  // Navigation helpers
  const goToNextWeek = () => {
    const newWeek = addWeeks(currentWeek, 1);
    setCurrentWeek(newWeek);
    setNextWeek(addWeeks(newWeek, 1));
  };

  const goToPrevWeek = () => {
    const newWeek = addWeeks(currentWeek, -1);
    setCurrentWeek(newWeek);
    setNextWeek(addWeeks(newWeek, 1));
  };

  const setCurrentWeekToDate = (date: Date) => {
    const newWeek = startOfWeek(date, { weekStartsOn: 1 });
    setCurrentWeek(newWeek);
    setNextWeek(addWeeks(newWeek, 1));
  };

  // Load schedules when user or team changes
  useEffect(() => {
    // Only load schedules if we're on a page that needs them
    if (window.location.pathname === '/login' || 
        window.location.pathname === '/signup' ||
        window.location.pathname === '/forgot-password') {
      return;
    }

    const loadInitialData = async () => {
      try {
        if (user) {
          await loadUserSchedule().catch(err => {
            console.error('Failed to load user schedule:', err);
            // Don't rethrow to prevent cascading errors
          });
        }
        if (user && currentTeam) {
          await loadTeamSchedule().catch(err => {
            console.error('Failed to load team schedule:', err);
            // Don't rethrow to prevent cascading errors
          });
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };
    
    if (user) {
      loadInitialData();
    }
  }, [user?.id, currentTeam?.id]);

  const value = {
    userSchedule,
    teamSchedule,
    currentWeek,
    nextWeek,
    loading,
    error,
    saveSchedule,
    loadUserSchedule,
    loadTeamSchedule,
    goToNextWeek,
    goToPrevWeek,
    setCurrentWeekToDate
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}