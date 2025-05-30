import React from 'react';
import { MessageSquare, Frown, Meh, Smile, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface TeamMemberPulse {
  id: string;
  name: string;
  avatar: string;
  currentMood: 'challenging' | 'neutral' | 'good';
  lastUpdateTime: string;
  streak?: {
    type: 'challenging' | 'neutral' | 'good';
    count: number;
  };
  requiresAttention?: boolean;
}

interface TeamPulseCardProps {
  teamMembers: TeamMemberPulse[];
  isLeader: boolean;
  className?: string;
}

export default function TeamPulseCard({ teamMembers, isLeader, className = '' }: TeamPulseCardProps) {
  // Filter to only show members needing attention
  const membersNeedingAttention = teamMembers.filter(m => 
    m.requiresAttention || (m.streak?.type === 'challenging' && m.streak?.count >= 2)
  );
  
  // Get icon for mood
  const getMoodIcon = (mood: 'challenging' | 'neutral' | 'good', size: number = 5) => {
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
    <Card className={`p-4 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center dark:bg-primary/20">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Team Pulse</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Team wellbeing monitor</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {isLeader && membersNeedingAttention.length > 0 ? (
          <>
            <div className="bg-warning/10 dark:bg-warning/20 text-warning rounded-lg p-4 mb-2">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning">Team members need attention</h4>
                  <p className="text-sm mt-1">
                    {membersNeedingAttention.length} team member{membersNeedingAttention.length > 1 ? 's' : ''} may need support.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Preview of members needing attention */}
            <div className="space-y-2">
              {membersNeedingAttention.slice(0, 2).map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center gap-3"
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {member.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {getMoodIcon(member.currentMood, 3)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {member.streak && member.streak.count > 1 && (
                          <>{member.streak.count} day streak</>
                        )}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {membersNeedingAttention.length > 2 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  +{membersNeedingAttention.length - 2} more need attention
                </p>
              )}
            </div>
            
            <div className="mt-2 pt-2 text-center">
              <Link 
                to="/team/pulse"
                className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light"
              >
                View team pulse dashboard
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </>
        ) : isLeader ? (
          <div className="text-center py-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
              <Smile className="h-6 w-6 text-success" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Team is doing well</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No immediate attention needed
            </p>
            <div className="mt-4">
              <Link 
                to="/team/pulse"
                className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light"
              >
                View detailed team pulse
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
              <MessageSquare className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Team Pulse Monitor</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Share your daily mood to help your team collaborate better
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}