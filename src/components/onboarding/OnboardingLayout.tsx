import React from 'react';
import { Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import OnboardingProgress from './OnboardingProgress';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  description?: string;
  steps: string[];
}

export default function OnboardingLayout({ 
  children, 
  currentStep, 
  totalSteps, 
  title,
  description,
  steps
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Building2 className="h-12 w-12 text-primary" />
          </motion.div>
        </div>
        <motion.h2 
          className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {title}
        </motion.h2>
        {description && (
          <motion.p 
            className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {description}
          </motion.p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <OnboardingProgress 
          currentStep={currentStep} 
          totalSteps={totalSteps}
          steps={steps}
        />

        <motion.div 
          className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}