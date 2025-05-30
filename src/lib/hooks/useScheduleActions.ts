import { useCallback, useState } from 'react';
import { useScheduleStore } from '../store';
import { useAuth } from '@/contexts/AuthContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function useScheduleActions() {
  const { user } = useAuth();
  const { saveSchedule, loadSchedules } = useSchedule();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    selectedDays,
    isSubmitted,
    isEditing,
    addSelectedDay,
    removeSelectedDay,
    submitSchedule,
    startEditing,
    cancelEditing,
  } = useScheduleStore();

  const handleDayToggle = useCallback(
    (dateStr: string) => {
      if (!user || (!isEditing && isSubmitted)) return;

      if (selectedDays.includes(dateStr)) {
        removeSelectedDay(dateStr);
      } else {
        addSelectedDay(dateStr);
      }
    },
    [user, isEditing, isSubmitted, selectedDays, addSelectedDay, removeSelectedDay]
  );

  const handleSubmit = useCallback(
    async (weekStart: Date) => {
      if (!user || selectedDays.length === 0 || isSubmitting) return;

      setIsSubmitting(true);
      try {
        // Save schedule for each selected day
        const savedSchedules = await Promise.all(
          selectedDays.map((date) =>
            saveSchedule(date, 'office', 'Scheduled office day')
          )
        );

        // Update store with submitted schedules
        submitSchedule(format(weekStart, 'yyyy-MM-dd'), savedSchedules);

        // Show success message
        toast.success('Schedule updated successfully');

        // Reload schedules to get updated data
        await loadSchedules();
      } catch (err) {
        console.error('Error saving schedule:', err);
        toast.error('Failed to update schedule');
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, selectedDays, isSubmitting, saveSchedule, submitSchedule, loadSchedules]
  );

  return {
    selectedDays,
    isSubmitted,
    isEditing,
    isSubmitting,
    handleDayToggle,
    handleSubmit,
    startEditing,
    cancelEditing,
  };
}