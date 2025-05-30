import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
          ...state,
          selectedDays: state.selectedDays.includes(date) 
            ? state.selectedDays 
            : [...state.selectedDays, date]
        })),

      removeSelectedDay: (date) =>
        set((state) => ({
          ...state,
          selectedDays: state.selectedDays.filter((d) => d !== date)
        })),

      setSelectedDays: (dates) =>
        set((state) => ({
          ...state,
          selectedDays: dates
        })),

      submitSchedule: (weekStart, schedules) =>
        set((state) => ({
          ...state,
          submittedSchedules: {
            ...state.submittedSchedules,
            [format(new Date(weekStart), 'yyyy-MM-dd')]: schedules.map((s) => s.date)
          },
          isSubmitted: true,
          isEditing: false
        })),

      startEditing: () =>
        set((state) => ({
          ...state,
          isEditing: true
        })),

      cancelEditing: () =>
        set((state) => ({
          ...state,
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        submittedSchedules: state.submittedSchedules
      })
    }
  )
);