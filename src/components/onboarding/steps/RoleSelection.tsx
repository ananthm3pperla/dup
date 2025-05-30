import React from 'react';
import { Users, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { motion } from 'framer-motion';

interface RoleSelectionProps {
  onSelect: (role: 'manager' | 'individual_contributor') => void;
  onBack: () => void;
}

export default function RoleSelection({ onSelect, onBack }: RoleSelectionProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">What's your role?</h2>
      
      <div className="space-y-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-offset-gray-800"
          onClick={() => onSelect('manager')}
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-12 w-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Manager</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                I lead a team and will set up hybrid work policies
              </p>
            </div>
            <div className="ml-auto">
              <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-offset-gray-800"
          onClick={() => onSelect('individual_contributor')}
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-12 w-12 bg-success/10 dark:bg-success/20 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Member</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                I'm part of a team and will follow my team's policies
              </p>
            </div>
            <div className="ml-auto">
              <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </motion.button>
      </div>
      
      <div className="mt-6">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">
          This helps us customize your experience. You can change this later.
        </p>
        
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full"
        >
          Back
        </Button>
      </div>
    </div>
  );
}