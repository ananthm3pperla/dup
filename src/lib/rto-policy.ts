import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { WorkSchedule } from '@/types';
import { supabase } from './supabase';
import { isDemoMode } from './demo';

/**
 * Validates if a schedule complies with the team's RTO policy
 */
export function validateRtoCompliance(
  schedules: WorkSchedule[],
  requiredOfficeDays: number
): { 
  compliant: boolean; 
  officeDays: number;
  remoteDays: number;
  message?: string;
} {
  // Count office and remote days
  const officeDays = schedules.filter(s => s.work_type === 'office').length;
  const remoteDays = schedules.filter(s => s.work_type === 'remote' || s.work_type === 'flexible').length;
  
  // Check if the schedule meets the required office days
  const compliant = officeDays >= requiredOfficeDays;
  
  // Generate a message based on compliance
  let message;
  if (!compliant) {
    const daysNeeded = requiredOfficeDays - officeDays;
    message = `Need ${daysNeeded} more office ${daysNeeded === 1 ? 'day' : 'days'} to meet policy requirements`;
  }
  
  return { compliant, officeDays, remoteDays, message };
}

/**
 * Gets the anchor days for a team based on the most popular office days
 */
export async function getTeamAnchorDays(
  teamId: string,
  weekStart: Date
): Promise<string[]> {
  try {
    // Check if in demo mode
    if (isDemoMode()) {
      // Return mock anchor days for Tuesday and Thursday
      const tuesday = addDays(weekStart, 1); // Monday is index 0, so Tuesday is index 1
      const thursday = addDays(weekStart, 3); // Thursday is index 3
      return [
        format(tuesday, 'yyyy-MM-dd'),
        format(thursday, 'yyyy-MM-dd')
      ];
    }

    // Get the week's date range
    const start = format(weekStart, 'yyyy-MM-dd');
    const end = format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    
    // FIX: Use direct, simple queries to avoid RLS recursion
    // First, get all team members with a direct query
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId);
      
    if (teamMembersError) {
      console.error('Error fetching team members:', teamMembersError);
      return []; 
    }
    
    if (!teamMembers || teamMembers.length === 0) {
      return [];
    }
    
    // Get all user IDs in this team
    const userIds = teamMembers.map(member => member.user_id);
    
    // Query work schedules directly with user IDs without using joins
    const { data: schedules, error: schedulesError } = await supabase
      .from('work_schedules')
      .select('date, work_type')
      .in('user_id', userIds)
      .gte('date', start)
      .lte('date', end)
      .eq('work_type', 'office');
      
    if (schedulesError) {
      console.error('Error fetching work schedules:', schedulesError);
      return [];
    }
    
    // Count the number of people in office for each day
    const dayCounts: Record<string, number> = {};
    
    // Initialize counts for each weekday
    for (let i = 0; i < 5; i++) {
      const day = format(addDays(weekStart, i), 'yyyy-MM-dd');
      dayCounts[day] = 0;
    }
    
    // Count office days
    schedules?.forEach(schedule => {
      if (dayCounts[schedule.date] !== undefined) {
        dayCounts[schedule.date]++;
      }
    });
    
    // Get team size
    const teamSize = teamMembers.length;
      
    // Determine anchor days (days where more than 50% of the team is in office)
    const anchorDays = Object.entries(dayCounts)
      .filter(([_, count]) => count > (teamSize || 1) / 2)
      .map(([date]) => date);
      
    return anchorDays;
  } catch (error) {
    console.error('Error getting team anchor days:', error);
    return [];
  }
}

/**
 * Gets the team's schedule summary for a week
 */
export async function getTeamScheduleSummary(
  teamId: string,
  weekStart: Date
): Promise<{
  date: string;
  officeMemberCount: number;
  remoteMemberCount: number;
  flexibleMemberCount: number;
}[]> {
  try {
    // Check if in demo mode
    if (isDemoMode()) {
      // Return mock schedule summary
      const summary = [];
      for (let i = 0; i < 5; i++) {
        const day = addDays(weekStart, i);
        const dateStr = format(day, 'yyyy-MM-dd');
        
        // Higher office count on Tuesday and Thursday
        let officeCount = 2; 
        if (i === 1 || i === 3) { // Tuesday or Thursday
          officeCount = 6;
        }
        
        summary.push({
          date: dateStr,
          officeMemberCount: officeCount,
          remoteMemberCount: 8 - officeCount,
          flexibleMemberCount: 1
        });
      }
      return summary;
    }

    // Get the week's date range
    const start = format(weekStart, 'yyyy-MM-dd');
    const end = format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    
    // FIX: Use direct, simple queries to avoid RLS recursion
    // First, get all team members
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId);
      
    if (teamMembersError) {
      console.error('Error fetching team members:', teamMembersError);
      return []; 
    }
    
    if (!teamMembers || teamMembers.length === 0) {
      return [];
    }
    
    // Get all user IDs in this team
    const userIds = teamMembers.map(member => member.user_id);
    
    // Query work schedules directly with user IDs
    const { data: schedules, error: schedulesError } = await supabase
      .from('work_schedules')
      .select('date, work_type')
      .in('user_id', userIds)
      .gte('date', start)
      .lte('date', end);
      
    if (schedulesError) {
      console.error('Error fetching work schedules:', schedulesError);
      return [];
    }
    
    // Initialize summary for each weekday
    const summary = [];
    for (let i = 0; i < 5; i++) {
      const day = addDays(weekStart, i);
      const dateStr = format(day, 'yyyy-MM-dd');
      
      summary.push({
        date: dateStr,
        officeMemberCount: 0,
        remoteMemberCount: 0,
        flexibleMemberCount: 0
      });
    }
    
    // Count work types for each day
    schedules?.forEach(schedule => {
      const dayIndex = summary.findIndex(day => day.date === schedule.date);
      if (dayIndex >= 0) {
        if (schedule.work_type === 'office') {
          summary[dayIndex].officeMemberCount++;
        } else if (schedule.work_type === 'remote') {
          summary[dayIndex].remoteMemberCount++;
        } else if (schedule.work_type === 'flexible') {
          summary[dayIndex].flexibleMemberCount++;
        }
      }
    });
    
    return summary;
  } catch (error) {
    console.error('Error getting team schedule summary:', error);
    return [];
  }
}

/**
 * Gets the team's voted office days for a future week
 */
export async function getTeamVotedDays(
  teamId: string,
  weekStart: Date
): Promise<{
  date: string;
  votes: number;
  isAnchorDay: boolean;
}[]> {
  try {
    // Check if in demo mode
    if (isDemoMode()) {
      // Return mock voted days with Tuesday and Thursday as anchor days
      const voteCounts: Record<string, number> = {};
      
      // Initialize counts for each weekday
      for (let i = 0; i < 5; i++) {
        const day = format(addDays(weekStart, i), 'yyyy-MM-dd');
        if (i === 1 || i === 3) { // Tuesday or Thursday
          voteCounts[day] = 5; // Anchor days with majority votes
        } else {
          voteCounts[day] = Math.floor(Math.random() * 3) + 1; // 1-3 votes for other days
        }
      }
      
      // Format the results
      const result = Object.entries(voteCounts).map(([date, votes]) => ({
        date,
        votes,
        isAnchorDay: votes > 4 // Assuming team size of 8
      }));
      
      // Sort by date
      return result.sort((a, b) => a.date.localeCompare(b.date));
    }

    // Get the week's date range
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    
    // FIX: Use direct, simple queries to avoid RLS recursion
    // First, get all team members
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId);
      
    if (teamMembersError) {
      console.error('Error fetching team members:', teamMembersError);
      return []; 
    }
    
    // Get team size
    const teamSize = teamMembers?.length || 0;
    
    // Query the database for all team votes for this week
    const { data, error } = await supabase
      .from('team_votes')
      .select('voted_days')
      .eq('team_id', teamId)
      .eq('voting_week', weekStartStr);
      
    if (error) {
      console.error('Error fetching team votes:', error);
      return [];
    }
    
    // Initialize vote counts for each weekday
    const voteCounts: Record<string, number> = {};
    
    // Initialize counts for each weekday
    for (let i = 0; i < 5; i++) {
      const day = format(addDays(weekStart, i), 'yyyy-MM-dd');
      voteCounts[day] = 0;
    }
    
    // Count votes for each day
    data?.forEach(vote => {
      (vote.voted_days as string[]).forEach(day => {
        if (voteCounts[day] !== undefined) {
          voteCounts[day]++;
        }
      });
    });
    
    // Format the results
    const result = Object.entries(voteCounts).map(([date, votes]) => ({
      date,
      votes,
      isAnchorDay: votes > (teamSize / 2)
    }));
    
    // Sort by date
    return result.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error getting team voted days:', error);
    return [];
  }
}