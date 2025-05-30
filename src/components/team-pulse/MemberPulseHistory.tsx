import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import { User, Frown, Meh, Smile, ChevronDown, ChevronUp, Calendar, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Badge } from '@/components/ui';

interface PulseEntry {
  date: string;
  mood: 'challenging' | 'neutral' | 'good';
  notes?: string;
}

interface MemberPulseHistoryProps {
  memberId: string;
  memberName: string;
  memberAvatar: string;
  pulseHistory?: PulseEntry[];
  className?: string;
}

export default function MemberPulseHistory({ 
  memberId, 
  memberName, 
  memberAvatar, 
  pulseHistory,
  className = '' 
}: MemberPulseHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Generate mock pulse history if none provided
  const history = pulseHistory || generateMockPulseHistory();
  
  // Get the latest mood
  const latestMood = history[0]?.mood || 'neutral';
  
  // Count consecutive days with the same mood
  const consecutiveDays = getConsecutiveDays(history);
  
  // Calculate mood breakdown
  const moodCounts = {
    challenging: history.filter(p => p.mood === 'challenging').length,
    neutral: history.filter(p => p.mood === 'neutral').length,
    good: history.filter(p => p.mood === 'good').length
  };
  
  // Get streak badge text
  const getStreakText = () => {
    if (consecutiveDays === 0) return null;
    
    return `${consecutiveDays} day ${latestMood} streak`;
  };
  
  // Get mood badge style
  const getMoodBadgeStyle = (mood: 'challenging' | 'neutral' | 'good') => {
    switch (mood) {
      case 'challenging':
        return { bg: 'bg-error-100 dark:bg-error-900/30', text: 'text-error' };
      case 'neutral':
        return { bg: 'bg-warning-100 dark:bg-warning-900/30', text: 'text-warning' };
      case 'good':
        return { bg: 'bg-success-100 dark:bg-success-900/30', text: 'text-success' };
    }
  };
  
  // Get mood icon
  const getMoodIcon = (mood: 'challenging' | 'neutral' | 'good', size: number = 4) => {
    switch (mood) {
      case 'challenging':
        return <Frown className={`h-${size} w-${size} text-error`} />;
      case 'neutral':
        return <Meh className={`h-${size} w-${size} text-warning`} />;
      case 'good':
        return <Smile className={`h-${size} w-${size} text-success`} />;
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-4 sm:p-6">
        {/* Member header */}
        <div className="flex items-center gap-3 mb-4">
          <img 
            src={memberAvatar} 
            alt={memberName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
              {memberName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {getMoodIcon(latestMood)}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Last updated {format(new Date(history[0]?.date), 'MMM d, h:mm a')}
              </span>
            </div>
          </div>
          
          {getStreakText() && (
            <Badge
              variant={
                latestMood === 'challenging' ? 'error' : 
                latestMood === 'neutral' ? 'warning' : 
                'success'
              }
            >
              {getStreakText()}
            </Badge>
          )}
        </div>
        
        {/* Mood summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-success/5 dark:bg-success/10 rounded-lg p-3 text-center">
            <Smile className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {moodCounts.good}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Good</p>
          </div>
          
          <div className="bg-warning/5 dark:bg-warning/10 rounded-lg p-3 text-center">
            <Meh className="h-5 w-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {moodCounts.neutral}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Neutral</p>
          </div>
          
          <div className="bg-error/5 dark:bg-error/10 rounded-lg p-3 text-center">
            <Frown className="h-5 w-5 text-error mx-auto mb-1" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {moodCounts.challenging}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Challenging</p>
          </div>
        </div>
        
        {/* Recent pulse history */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent History</h4>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-primary"
            >
              {isExpanded ? (
                <>
                  <span>Show less</span>
                  <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  <span>Show more</span>
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
          
          <div className="space-y-2">
            {history.slice(0, isExpanded ? history.length : 3).map((entry, index) => {
              const moodStyle = getMoodBadgeStyle(entry.mood);
              
              return (
                <div 
                  key={index}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMoodIcon(entry.mood)}
                      <span className={`text-xs font-medium ${moodStyle.text}`}>
                        {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(entry.date), 'MMM d')}
                    </span>
                  </div>
                  
                  {entry.notes && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1">
                      <MessageSquare className="h-3 w-3 mt-0.5 text-gray-400" />
                      <p className="italic">{entry.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Helper function to generate mock pulse history
function generateMockPulseHistory(): PulseEntry[] {
  const entries: PulseEntry[] = [];
  
  for (let i = 0; i < 10; i++) {
    const date = subDays(new Date(), i);
    
    // Generate random mood with some consistency
    let mood: 'challenging' | 'neutral' | 'good';
    if (i === 0) {
      // First entry is random
      mood = ['challenging', 'neutral', 'good'][Math.floor(Math.random() * 3)] as 'challenging' | 'neutral' | 'good';
    } else if (i < 3 && Math.random() < 0.7) {
      // First 3 days have 70% chance to keep same mood for consistency
      mood = entries[i-1].mood;
    } else {
      // Otherwise random
      mood = ['challenging', 'neutral', 'good'][Math.floor(Math.random() * 3)] as 'challenging' | 'neutral' | 'good';
    }
    
    // Only add notes sometimes
    let notes;
    if (Math.random() < 0.3) {
      const notesOptions = [
        'Feeling productive today',
        'Struggling with current workload',
        'Team collaboration is working well',
        'Need more clarity on project requirements',
        'Great meeting with the team'
      ];
      notes = notesOptions[Math.floor(Math.random() * notesOptions.length)];
    }
    
    entries.push({
      date: date.toISOString(),
      mood,
      notes
    });
  }
  
  return entries;
}

// Helper function to count consecutive days of the same mood
function getConsecutiveDays(history: PulseEntry[]): number {
  if (!history.length) return 0;
  
  const firstMood = history[0].mood;
  let count = 1;
  
  for (let i = 1; i < history.length; i++) {
    if (history[i].mood === firstMood) {
      count++;
    } else {
      break;
    }
  }
  
  return count;
}