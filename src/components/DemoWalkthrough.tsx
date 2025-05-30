import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { DEMO_WALKTHROUGH } from '@/lib/demo';
import { Button } from '@/components/ui';

interface DemoWalkthroughProps {
  onComplete: () => void;
}

export default function DemoWalkthrough({ onComplete }: DemoWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Highlight current element
    const selector = DEMO_WALKTHROUGH[currentStep].element;
    const element = document.querySelector(selector);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-4', 'ring-primary', 'ring-offset-2', 'z-50');
      }, 300);
    }

    return () => {
      // Clean up highlight
      if (element) {
        element.classList.remove('ring-4', 'ring-primary', 'ring-offset-2', 'z-50');
      }
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < DEMO_WALKTHROUGH.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
        >
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 mx-auto">
            <button
              onClick={handleSkip}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                {DEMO_WALKTHROUGH[currentStep].title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                {DEMO_WALKTHROUGH[currentStep].description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {DEMO_WALKTHROUGH.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      index === currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSkip}
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-700"
                >
                  Skip tour
                </button>
                <Button
                  onClick={handleNext}
                  rightIcon={<ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  className="text-white text-xs sm:text-sm"
                  size="sm"
                >
                  {currentStep === DEMO_WALKTHROUGH.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}