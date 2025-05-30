import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import type { WorkSchedule } from '../types';

interface ScheduleState {
  selectedDays: string[];
  submittedSchedules: { [weekStart: string]: string[] };
  isSubmitted: boolean;
  isEditing: boolean;
  addSelectedDay: (date: string) => void;
  removeSelectedDay: (date: string) => void;
  setSelectedDays: (dates: string[]) => void;
  submitSchedule: (weekStart: string, schedules: WorkSchedule[]) => void;
  startEditing: () => void;
  cancelEditing: () => void;
  resetState: () => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      selectedDays: [],
      submittedSchedules: {},
      isSubmitted: false,
      isEditing: false,

      addSelectedDay: (date) =>
        set((state) => ({
          selectedDays: state.selectedDays.includes(date) 
            ? state.selectedDays 
            : [...state.selectedDays, date]
        })),

      removeSelectedDay: (date) =>
        set((state) => ({
          selectedDays: state.selectedDays.filter((d) => d !== date)
        })),

      setSelectedDays: (dates) =>
        set(() => ({
          selectedDays: dates
        })),

      submitSchedule: (weekStart, schedules) =>
        set((state) => ({
          submittedSchedules: {
            ...state.submittedSchedules,
            [format(new Date(weekStart), 'yyyy-MM-dd')]: schedules.map((s) => ({
              date: s.date,
              id: s.id
            }))
          },
          isSubmitted: true,
          isEditing: false
        })),

      startEditing: () =>
        set(() => ({
          isEditing: true
        })),

      cancelEditing: () =>
        set(() => ({
          isEditing: false
        })),

      resetState: () =>
        set(() => ({
          selectedDays: [],
          submittedSchedules: {},
          isSubmitted: false,
          isEditing: false
        }))
    }),
    {
      name: 'schedule-store',
      partialize: (state) => ({
        submittedSchedules: state.submittedSchedules
      })
    }
  )
);