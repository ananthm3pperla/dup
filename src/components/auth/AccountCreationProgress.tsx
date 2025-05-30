import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface AccountCreationProgressProps {
  steps: Step[];
  className?: string;
}

export default function AccountCreationProgress({ steps, className = '' }: AccountCreationProgressProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="overflow-hidden">
        {steps.map((step, stepIdx) => (
          <div key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'pb-8' : ''}`}>
            {stepIdx !== steps.length - 1 ? (
              <div
                className="absolute inset-0 flex items-center justify-center"
                aria-hidden="true"
                style={{ marginTop: '24px', marginLeft: '14px' }}
              >
                <div 
                  className={`h-full w-0.5 ${
                    step.completed ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                  }`} 
                />
              </div>
            ) : null}
            <div className="relative flex items-start group">
              <span className="h-7 flex items-center">
                <motion.span
                  animate={step.completed ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${
                    step.completed 
                      ? 'bg-primary' 
                      : step.current 
                      ? 'border-2 border-primary bg-white dark:bg-gray-800' 
                      : 'border-2 border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600'
                  }`}
                >
                  {step.completed ? (
                    <Check className="h-5 w-5 text-white" aria-hidden="true" />
                  ) : (
                    <span 
                      className={`h-5 w-5 flex items-center justify-center text-sm font-medium ${
                        step.current ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {stepIdx + 1}
                    </span>
                  )}
                </motion.span>
              </span>
              <div className="ml-4 min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {step.name}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}