import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export default function OnboardingProgress({ 
  currentStep, 
  totalSteps,
  steps
}: OnboardingProgressProps) {
  return (
    <div className="mb-8">
      {/* Step labels */}
      <div className="hidden sm:flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`text-sm font-medium ${
              index + 1 <= currentStep 
                ? 'text-primary dark:text-primary-light' 
                : 'text-gray-500 dark:text-gray-400'
            } ${index === 0 ? 'text-left' : index === steps.length - 1 ? 'text-right' : 'text-center'}`}
            style={{ width: `${100 / steps.length}%` }}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Mobile step indicator */}
      <div className="sm:hidden flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Step circles */}
      <div className="hidden sm:flex justify-between mt-2 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0" />
        
        {steps.map((_, index) => (
          <motion.div
            key={index}
            className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
              index + 1 < currentStep 
                ? 'bg-primary text-white' 
                : index + 1 === currentStep
                ? 'bg-primary text-white ring-4 ring-primary/20'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}
            initial={{ scale: 0.8 }}
            animate={{ scale: index + 1 === currentStep ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {index + 1 < currentStep ? (
              <Check className="h-5 w-5" />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}