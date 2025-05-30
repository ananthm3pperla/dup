import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, parseISO } from 'date-fns';
import { Building2, Home, Check, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { Card, Button, Badge } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/demo';

export default function VotingCalendar() {
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const { nextWeek } = useSchedule();
  
  // Voting state
  const [votedDays, setVotedDays] = useState<string[]>(() => {
    const saved = localStorage.getItem('votedOfficeDays');
    return saved ? JSON.parse(saved) : [];
  });
  const [voteSubmitted, setVoteSubmitted] = useState(() => {
    return localStorage.getItem('scheduleVoteSubmitted') === 'true';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate the week after next (for voting)
  const votingWeekStart = React.useMemo(() => {
    return startOfWeek(addWeeks(nextWeek, 1), { weekStartsOn: 1 });
  }, [nextWeek]);
  
  // Get voting week days (Mon-Fri)
  const weekDays = React.useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => addDays(votingWeekStart, i));
  }, [votingWeekStart]);
  
  // Required number of office days from team policy
  const requiredOfficeDays = currentTeam?.rto_policy.required_days || 3;
  
  // Handle vote for office/remote day
  const handleVote = (dateStr: string) => {
    if (voteSubmitted) return;
    
    // Toggle vote status for this day
    if (votedDays.includes(dateStr)) {
      setVotedDays(votedDays.filter(d => d !== dateStr));
    } else {
      // Check if we've reached the limit of required days for office
      if (votedDays.length >= requiredOfficeDays) {
        toast.warning(`You can only select ${requiredOfficeDays} days for office. The remaining days will be remote.`);
        return;
      }
      setVotedDays([...votedDays, dateStr]);
    }
  };
  
  // Submit votes
  const handleSubmitVotes = async () => {
    if (votedDays.length !== requiredOfficeDays) {
      toast.error(`Please select exactly ${requiredOfficeDays} days for office.`);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Store votes in localStorage for demo/persistence
      localStorage.setItem('votedOfficeDays', JSON.stringify(votedDays));
      localStorage.setItem('scheduleVoteSubmitted', 'true');
      
      // In production mode, submit to database
      if (!isDemoMode() && user && currentTeam) {
        // Submit to the team_votes table
        const { error: submitError } = await supabase
          .from('team_votes')
          .upsert({
            user_id: user.id,
            team_id: currentTeam.id,
            voting_week: format(votingWeekStart, 'yyyy-MM-dd'),
            voted_days: votedDays,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,team_id,voting_week'
          });
          
        if (submitError) throw submitError;
      }
      
      setVoteSubmitted(true);
      toast.success('Your office day preferences have been submitted!');
    } catch (err) {
      console.error('Error submitting votes:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit preferences');
      toast.error('Failed to submit preferences');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset votes
  const handleResetVotes = () => {
    localStorage.removeItem('scheduleVoteSubmitted');
    setVoteSubmitted(false);
    setVotedDays([]);
  };
  
  return (
    <div className="space-y-4">
      {/* Voting header */}
      <Card className="p-4 bg-primary/10 border-primary/20 dark:bg-primary/20 dark:border-primary/30">
        <h3 className="text-lg font-medium text-default mb-1">Office Day Voting</h3>
        <p className="text-sm text-muted mb-3">
          Vote for your preferred {requiredOfficeDays} office days for the week of {format(votingWeekStart, 'MMM d, yyyy')}. 
          Days with the most votes become anchor days for team collaboration.
        </p>
        
        {voteSubmitted ? (
          <div className="bg-success/10 dark:bg-success/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-default">Votes submitted!</p>
                <p className="text-sm text-muted mt-1">
                  Your preferred office days have been recorded. The final anchor days will be determined by team vote.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {votedDays.map(day => (
                    <Badge key={day} variant="primary" className="text-xs py-1">
                      {format(parseISO(day), 'EEE, MMM d')}
                    </Badge>
                  ))}
                </div>
                <button 
                  onClick={handleResetVotes}
                  className="mt-3 text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light"
                >
                  Change my votes
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium text-primary">
            Select {requiredOfficeDays} days when you prefer to work from the office
          </p>
        )}
      </Card>
      
      {error && (
        <div className="bg-error/10 text-error p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
        
      <AnimatePresence>
        {!voteSubmitted && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-5 gap-3"
          >
            {weekDays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isOffice = votedDays.includes(dateStr);
              
              return (
                <motion.div
                  key={dateStr}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    rounded-lg border transition-all duration-200 cursor-pointer relative
                    ${isOffice 
                      ? 'border-primary bg-primary/10 dark:bg-primary/20' 
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}
                  `}
                  onClick={() => handleVote(dateStr)}
                >
                  <div className="p-4">
                    {/* Date header */}
                    <div className="text-center mb-3">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {format(day, 'EEEE')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(day, 'MMM d')}
                      </p>
                    </div>
                    
                    {/* Work type display */}
                    <div className="mt-2">
                      <div className={`
                        flex items-center justify-center gap-2 p-2 rounded-lg
                        ${isOffice 
                          ? 'bg-primary/20 text-primary border-primary/20' 
                          : 'bg-success/10 text-success border-success/20'}
                      `}>
                        {isOffice ? (
                          <Building2 className="h-4 w-4" />
                        ) : (
                          <Home className="h-4 w-4" />
                        )}
                        <span className="font-medium capitalize text-sm">
                          {isOffice ? 'Office' : 'Remote'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Office day indicator */}
                    {isOffice && (
                      <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
                        <span className="flex items-center justify-center h-6 w-6 bg-primary text-white rounded-full shadow-md">
                          <Check className="h-4 w-4" />
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      
      {!voteSubmitted && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted">
            {votedDays.length} of {requiredOfficeDays} office days selected
          </div>
          <Button
            onClick={handleSubmitVotes}
            isLoading={isSubmitting}
            disabled={isSubmitting || votedDays.length !== requiredOfficeDays}
            leftIcon={<Calendar className="h-4 w-4" />}
          >
            Submit Office Day Preferences
          </Button>
        </div>
      )}
    </div>
  );
}