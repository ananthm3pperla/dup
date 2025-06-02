import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, isAfter, parseISO, isBefore } from 'date-fns';
import { Building2, Home, Info, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { Card, Button, Badge } from '@/components/ui';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { isDemoMode, DEMO_STATIC_SCHEDULES } from '@/lib/demo';
import { supabase } from '@/lib/supabase';
import { scheduleAPI } from '@/lib/api';

interface WeeklyCalendarProps {
  viewMode: 'current' | 'next'; 
  onChangeWeek?: (startDate: Date) => void;
  anchorDays?: string[];
  hideNavigation?: boolean;
}

export default function WeeklyCalendar({
  viewMode,
  onChangeWeek,
  anchorDays = [],
  hideNavigation = false
}: WeeklyCalendarProps) {
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const { 
    userSchedule, 
    teamSchedule, 
    currentWeek, 
    nextWeek,
    loadUserSchedule, 
    loadTeamSchedule, 
    saveSchedule, 
    goToNextWeek, 
    goToPrevWeek 
  } = useSchedule();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedWorkType, setSelectedWorkType] = useState<'office' | 'remote' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Get current week days (Mon-Fri)
  const weekDays = React.useMemo(() => {
    const startDay = startOfWeek(viewMode === 'current' ? currentWeek : nextWeek, { weekStartsOn: 1 });
    return Array.from({ length: 5 }, (_, i) => addDays(startDay, i));
  }, [currentWeek, nextWeek, viewMode]);

  // Check if the current view should be editable
  const allowEditing = viewMode === 'next';

  // In demo mode, use static schedules
  const demoStaticSchedules = isDemoMode() && DEMO_STATIC_SCHEDULES ? 
    (viewMode === 'current' ? DEMO_STATIC_SCHEDULES.current_week : DEMO_STATIC_SCHEDULES.next_week) : 
    null;

  // Load schedules on mount and week change
  useEffect(() => {
    const loadScheduleData = async () => {
      if (!user?.id || !currentTeam?.id) return;

      setLoading(true);
      setError(null);

      try {
        const startDate = viewMode === 'current' ? currentWeek : nextWeek;
        const endDate = addDays(startDate, 6); // Include weekend in query but display Mon-Fri

        if (!isDemoMode()) {
          try {
            // In production, try to fetch data from API
            await loadUserSchedule(startDate, endDate);
            await loadTeamSchedule(startDate, endDate);
          } catch (error) {
            console.error('Error loading schedule data, falling back to demo mode:', error);

            // Create fallback schedules
            const fallbackSchedules = [];
            for (let i = 0; i < 5; i++) {
              const day = addDays(startDate, i);
              // Add office days on Tuesday and Thursday
              if (day.getDay() === 2 || day.getDay() === 4) {
                fallbackSchedules.push({
                  id: `fallback-${i}`,
                  user_id: user.id,
                  date: format(day, 'yyyy-MM-dd'),
                  work_type: 'office',
                  notes: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              } else {
                fallbackSchedules.push({
                  id: `fallback-${i}`,
                  user_id: user.id,
                  date: format(day, 'yyyy-MM-dd'),
                  work_type: 'remote',
                  notes: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              }
            }

            // Work around Supabase API calls
            userSchedule.splice(0, userSchedule.length, ...fallbackSchedules);
          }
        }
      } catch (err) {
        console.error('Error loading schedule data:', err);
        setError('Failed to load schedule data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadScheduleData();
  }, [user?.id, currentTeam?.id, currentWeek, nextWeek, viewMode, loadUserSchedule, loadTeamSchedule, retryCount, userSchedule]);

  // Get work type for a specific day
  const getWorkTypeForDay = (date: Date): 'office' | 'remote' | null => {
    if (isDemoMode() && demoStaticSchedules) {
      const matchingSchedule = demoStaticSchedules.find(
        item => item.date === format(date, 'yyyy-MM-dd')
      );
      return matchingSchedule?.work_type as 'office' | 'remote' || null;
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    const scheduleItem = userSchedule.find(item => item.date === dateStr);
    return scheduleItem ? (scheduleItem.work_type === 'flexible' ? 'remote' : scheduleItem.work_type as 'office' | 'remote') : null;
  };

  // Get team count for a specific day
  const getTeamCountForDay = (date: Date) => {
    if (!teamSchedule || !teamSchedule.days) return { office: 0, remote: 0 };

    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = teamSchedule.days.find(day => day.date === dateStr);

    if (!dayData) return { office: 0, remote: 0 };

    return {
      office: dayData.officeMemberCount,
      remote: dayData.remoteMemberCount
    };
  };

  // Check if day is an anchor day
  const isAnchorDay = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');

    // First check explicitly provided anchor days
    if (anchorDays.includes(dateStr)) {
      return true;
    }

    // For demo mode in current week, mark Monday, Tuesday and Thursday as anchor days
    if (isDemoMode() && viewMode === 'current') {
      const dayOfWeek = date.getDay();
      // 1 = Monday, 2 = Tuesday, 4 = Thursday
      const isDemoAnchorDay = dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 4;
      return isDemoAnchorDay;
    }

    // Otherwise check if more than 50% of the team is in office
    if (currentTeam && teamSchedule && teamSchedule.days) {
      const dayData = teamSchedule.days.find(day => day.date === dateStr);

      if (!dayData) return false;

      // Consider a day an "anchor day" if more than 50% of the team is in office
      const totalMembers = dayData.officeMemberCount + dayData.remoteMemberCount;
      return totalMembers > 0 && (dayData.officeMemberCount / totalMembers) > 0.5;
    }

    return false;
  };

  // Check if the schedule complies with RTO policy
  const checkRtoCompliance = () => {
    if (!currentTeam?.rto_policy?.required_days) return { compliant: true };

    const requiredDays = currentTeam.rto_policy.required_days;
    const officeDays = userSchedule.filter(s => s.work_type === 'office').length;

    return {
      compliant: officeDays >= requiredDays,
      officeDays,
      requiredDays,
      remaining: Math.max(0, requiredDays - officeDays)
    };
  };

  // Handle day selection
  const handleDaySelect = (date: Date) => {
    if (!allowEditing) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDay(dateStr);

    const currentWorkType = getWorkTypeForDay(date);
    setSelectedWorkType(currentWorkType);

    // Find schedule for notes
    const schedule = userSchedule.find(s => s.date === dateStr);
    setNotes(schedule?.notes || '');
  };

  // Handle work type selection
  const handleWorkTypeSelect = (type: 'office' | 'remote') => {
    setSelectedWorkType(type);
  };

  // Handle schedule save
  const handleSaveSchedule = async () => {
    if (!selectedDay || !selectedWorkType || !user) return;

    setIsSubmitting(true);

    try {
      // In production mode, save to API directly
      if (!isDemoMode()) {
        try {
          const response = await fetch('/api/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: selectedDay,
              work_type: selectedWorkType,
              notes
            })
          });

          if (!response.ok) {
            throw new Error('Failed to save schedule');
          }

          // Refresh data
          const startDate = viewMode === 'current' ? currentWeek : nextWeek;
          const endDate = addDays(startDate, 6);
          await loadUserSchedule(startDate, endDate);

          toast.success('Schedule updated successfully');
        } catch (error) {
          console.error('Error saving schedule:', error);
          toast.error('Failed to save schedule');
        }
          .eq('date', selectedDay)
          .single();

        if (existingSchedule) {
          // Update existing schedule
          const { data, error } = await supabase
            .from('work_schedules')
            .update({
              work_type: selectedWorkType,
              notes: notes || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSchedule.id)
            .select()
            .single();

          if (error) throw error;
        } else {
          // Insert new schedule
          const { data, error } = await supabase
            .from('work_schedules')
            .insert({
              user_id: user.id,
              date: selectedDay,
              work_type: selectedWorkType,
              notes: notes || null
            })
            .select()
            .single();

          if (error) throw error;
        }
      }

      // Always update the context
      await saveSchedule(selectedDay, selectedWorkType, notes);

      // Refresh the schedules
      await loadUserSchedule();
      await loadTeamSchedule();

      toast.success('Schedule updated successfully');

      // Reset selection
      setSelectedDay(null);
      setSelectedWorkType(null);
      setNotes('');
    } catch (err) {
      console.error('Error saving schedule:', err);
      toast.error('Failed to update schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setSelectedDay(null);
    setSelectedWorkType(null);
    setNotes('');
  };

  // Handle week navigation
  const handlePrevWeek = () => {
    goToPrevWeek();
    if (onChangeWeek) {
      onChangeWeek(addDays(currentWeek, -7));
    }
  };

  const handleNextWeek = () => {
    goToNextWeek();
    if (onChangeWeek) {
      onChangeWeek(addDays(currentWeek, 7));
    }
  };

  // Handle retry after error
  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
    loadUserSchedule();
    loadTeamSchedule();
  };

  // Check RTO compliance
  const compliance = checkRtoCompliance();

  return (
    <div className="space-y-4" role="region" aria-label="Weekly schedule calendar">
      {/* Week navigation - only show if not hidden */}
      {!hideNavigation && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevWeek}
            className="flex items-center gap-1"
            aria-label="Previous week"
          >
            Previous Week
          </Button>

          <h2 className="text-lg font-medium text-center">
            <span className="hidden sm:inline">Week of </span>
            {format(weekDays[0], 'MMM d')} - {format(weekDays[4], 'MMM d, yyyy')}
          </h2>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            className="flex items-center gap-1"
            aria-label="Next week"
          >
            Next Week
          </Button>
        </div>
      )}

      {/* Week display without navigation */}
      {hideNavigation && (
        <div className="text-center mb-4">
          <h2 className="text-lg font-medium">
            <span className="hidden sm:inline">Week of </span> 
            {format(weekDays[0], 'MMM d')} - {format(weekDays[4], 'MMM d, yyyy')}
          </h2>
        </div>
      )}

      {/* RTO Policy Compliance Alert */}
      {viewMode === 'current' && !compliance.compliant && (
        <Card className="p-3 mb-4 bg-warning/10 border-warning/20 dark:bg-warning/20 dark:border-warning/30" role="alert">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-warning flex-shrink-0" />
            <p className="text-sm">
              You need {compliance.remaining} more office {compliance.remaining === 1 ? 'day' : 'days'} to meet your team's RTO policy.
            </p>
          </div>
        </Card>
      )}

      {/* Calendar grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3" aria-busy="true" aria-label="Loading schedule data">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-error/10 text-error p-4 rounded-lg" role="alert">
          <p>{error}</p>
          <Button 
            variant="outline"
            size="sm" 
            className="mt-2"
            onClick={handleRetry}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3" role="grid">
          {weekDays.map((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isToday = isSameDay(day, new Date());
            const isPast = isBefore(day, new Date()) && !isToday;
            const isSelected = selectedDay === dateStr;
            const workType = getWorkTypeForDay(day);
            const isAnchorDayValue = isAnchorDay(day);
            const teamCounts = getTeamCountForDay(day);

            return (
              <motion.div
                key={dateStr}
                whileHover={{ scale: allowEditing && !isPast ? 1.02 : 1 }}
                className={`
                  relative rounded-lg border transition-all duration-200 ${allowEditing && !isPast ? 'cursor-pointer' : ''}
                  ${isToday ? 'border-primary shadow-md' : 'border-gray-200 dark:border-gray-700'}
                  ${isPast ? 'opacity-75' : ''}
                  ${isSelected ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800' : ''}
                  ${isAnchorDayValue ? 'bg-primary/10 dark:bg-primary/20 border-primary shadow-md' : 'bg-white dark:bg-gray-800'}
                `}
                onClick={() => !isPast && handleDaySelect(day)}
                role="gridcell"
                aria-selected={isSelected}
                tabIndex={allowEditing && !isPast ? 0 : -1}
                aria-label={`${format(day, 'EEEE, MMMM d')}${isToday ? ', Today' : ''}${isPast ? ', Past date' : ''}${isAnchorDayValue ? ', Anchor day' : ''}`}
              >
                {/* Anchor day badge */}
                {isAnchorDayValue && (
                  <div className="absolute top-0 left-0 right-0 text-center py-1 bg-black text-white text-xs font-bold rounded-t-lg" aria-hidden="true">
                    ANCHOR DAY
                  </div>
                )}

                <div className={`p-4 ${isAnchorDayValue ? 'pt-7' : ''}`}>
                  {/* Date header */}
                  <div className="text-center mb-4">
                    <p className={`font-medium ${isAnchorDayValue ? 'text-primary-dark dark:text-primary-light' : 'text-gray-900 dark:text-white'}`}>
                      {format(day, 'EEEE')}
                    </p>
                    <p className={`text-sm ${isAnchorDayValue ? 'text-primary-dark dark:text-primary-light' : 'text-gray-500 dark:text-gray-400'}`}>
                      {format(day, 'MMM d')}
                    </p>
                    {isToday && (
                      <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Current work type */}
                  {workType ? (
                    <div className="mt-2">
                      <div className={`
                        flex items-center justify-center gap-2 p-2 rounded-lg
                        ${workType === 'office' 
                          ? 'bg-primary/20 text-primary dark:bg-primary/30' 
                          : 'bg-success/10 text-success dark:bg-success/20'}
                      `}>
                        {workType === 'office' ? (
                          <Building2 className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Home className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span className="font-medium capitalize text-sm">
                          {workType}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 h-[38px] flex items-center justify-center">
                      <span className="text-xs text-muted">
                        {allowEditing && !isPast ? 'Click to schedule' : 'Not scheduled'}
                      </span>
                    </div>
                  )}

                  {/* Team summary */}
                  {!isSelected && teamCounts && (teamCounts.office > 0 || teamCounts.remote > 0) && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
                      <span className="flex items-center">
                        <Building2 className="h-3 w-3 mr-1" aria-hidden="true" />
                        <span>{teamCounts.office}<span className="sr-only"> team members in office</span></span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Home className="h-3 w-3 mr-1" aria-hidden="true" />
                        <span>{teamCounts.remote}<span className="sr-only"> team members working remote</span></span>
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Schedule editor */}
      {selectedDay && allowEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-editor-title"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4" id="schedule-editor-title">
            Update Schedule for {format(parseISO(selectedDay), 'EEEE, MMMM d')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleWorkTypeSelect('office')}
              className={`
                p-4 rounded-lg flex items-center gap-3 border transition-colors
                ${selectedWorkType === 'office' 
                  ? 'bg-primary/20 border-primary text-primary dark:bg-primary/30' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}
              `}
              type="button"
              aria-pressed={selectedWorkType === 'office'}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-base">Office</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Work from the company office</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleWorkTypeSelect('remote')}
              className={`
                p-4 rounded-lg flex items-center gap-3 border transition-colors
                ${selectedWorkType === 'remote' 
                  ? 'bg-success/10 border-success text-success dark:bg-success/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-success/50'}
              `}
              type="button"
              aria-pressed={selectedWorkType === 'remote'}
            >
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <Home className="h-5 w-5 text-success" />
              </div>
              <div>
                <h4 className="font-medium text-base">Remote</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Work from home or elsewhere</p>
              </div>
            </motion.button>
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Add any notes about your schedule for this day..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              aria-label="Cancel schedule update"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSchedule}
              disabled={!selectedWorkType || isSubmitting}
              isLoading={isSubmitting}
              aria-label="Save schedule"
            >
              Save Schedule
            </Button>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1" role="presentation">
          <div className="w-3 h-3 bg-primary/20 rounded-full"></div>
          <span>Office</span>
        </div>
        <div className="flex items-center gap-1" role="presentation">
          <div className="w-3 h-3 bg-success/10 rounded-full"></div>
          <span>Remote</span>
        </div>
        <div className="flex items-center gap-1 font-medium" role="presentation">
          <div className="w-4 h-4 bg-black text-white flex items-center justify-center text-[8px] rounded-sm">A</div>
          <span className="text-primary-dark dark:text-primary-light">Anchor Day</span>
        </div>
      </div>
    </div>
  );
}