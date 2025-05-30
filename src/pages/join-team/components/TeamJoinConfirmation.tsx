import React from 'react';
import { Check, Users } from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';

interface TeamJoinConfirmationProps {
  user: User;
  inviteCode: string;
  teamName?: string;
  onJoin: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export default function TeamJoinConfirmation({
  user,
  inviteCode,
  teamName,
  onJoin,
  onBack,
  isSubmitting
}: TeamJoinConfirmationProps) {
  return (
    <div className="space-y-6">
      <Alert
        variant="success"
        title="Ready to join team"
        className="mb-4"
        icon={<Check className="h-5 w-5" />}
      >
        <p className="mb-2">You're about to join{teamName ? ` "${teamName}"` : ' the team'}</p>
        <p className="text-sm">You're signed in as <strong>{user.email}</strong></p>
      </Alert>

      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Team Details</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {teamName || 'Team'} • Invite Code: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">{inviteCode}</code>
            </p>
          </div>
        </div>
      </div>

      <motion.div 
        className="flex flex-col space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={onJoin}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="w-full"
          leftIcon={<Check className="h-4 w-4" />}
        >
          Join{teamName ? ` ${teamName}` : ' Team'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full"
          disabled={isSubmitting}
        >
          Back to Invite Code
        </Button>
      </motion.div>
    </div>
  );
}