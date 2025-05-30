import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, addDays, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, startOfMonth, endOfMonth } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get array of dates between start and end dates
export function getDaysBetweenDates(start: Date, numDays: number): Date[] {
  return Array.from({ length: numDays }, (_, i) => addDays(start, i));
}

// Get days for a month view calendar (including days from prev/next months to fill grid)
export function getMonthViewDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start: startDate, end: endDate });
}

// Get days for a week view calendar
export function getWeekViewDays(date: Date): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

// Navigate to previous period (week or month)
export function getPreviousPeriod(date: Date, view: 'week' | 'month'): Date {
  if (view === 'week') {
    return addDays(date, -7);
  } else {
    return addMonths(date, -1);
  }
}

// Navigate to next period (week or month)
export function getNextPeriod(date: Date, view: 'week' | 'month'): Date {
  if (view === 'week') {
    return addDays(date, 7);
  } else {
    return addMonths(date, 1);
  }
}

// Check if a user is meeting their team's RTO policy
export function calculateRtoCompliance(
  schedule: { date: string; work_type: string }[],
  requiredDaysInOffice: number
): boolean {
  // Count office days in current week
  const officeDays = schedule.filter(day => day.work_type === 'office').length;
  return officeDays >= requiredDaysInOffice;
}