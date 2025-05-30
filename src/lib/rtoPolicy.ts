import { format } from 'date-fns';
import { RTOPolicy } from '../types';

export function validateWorkSchedule(
  policy: RTOPolicy | null,
  date: Date,
  workType: 'office' | 'remote' | 'flexible'
): { valid: boolean; message?: string } {
  // If no policy exists, allow any work type
  if (!policy) {
    return { valid: true };
  }

  const dayName = format(date, 'EEEE');

  // Check if it's a working day
  if (!policy.allowed_days.includes(dayName)) {
    return { valid: false, message: 'Not a working day' };
  }

  // Check fixed remote days
  if (policy.fixed_remote_days.includes(dayName) && workType === 'office') {
    return { 
      valid: false, 
      message: `${dayName} is a designated remote day` 
    };
  }

  return { valid: true };
}

export function getWeeklyRequirements(policy: RTOPolicy | null): string {
  if (!policy) {
    return 'No RTO policy configured';
  }

  const requirements = [];

  if (policy.min_office_days > 0) {
    requirements.push(`${policy.min_office_days} office days required`);
  }

  if (policy.max_remote_days !== undefined) {
    requirements.push(`Maximum ${policy.max_remote_days} remote days allowed`);
  }

  if (policy.fixed_remote_days.length > 0) {
    requirements.push(
      `${policy.fixed_remote_days.join(', ')} are designated remote days`
    );
  }

  if (policy.core_hours) {
    requirements.push(
      `Core hours: ${policy.core_hours.start} - ${policy.core_hours.end}`
    );
  }

  return requirements.join(' • ');
}