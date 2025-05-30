import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
  timeoutSeconds?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pulse' | 'bounce' | 'waveform';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export default function LoadingState({ 
  message = 'Loading...', 
  timeoutSeconds = 30,
  size = 'md',
  variant = 'default',
  color = 'primary'
}: LoadingStateProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        if (newTime > timeoutSeconds) {
          setShowTimeout(true);
          clearInterval(interval);
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeoutSeconds]);

  const spinnerSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-20 w-20',
  };
  
  const messageSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const colorClasses = {
    primary: 'text-primary border-primary',
    secondary: 'text-secondary border-secondary',
    success: 'text-success border-success',
    warning: 'text-warning border-warning',
    error: 'text-error border-error',
  };

  const pulseVariants: Variants = {
    animate: {
      scale: [1, 1.5, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const bounceVariants: Variants = {
    animate: (i: number) => ({
      y: [0, -10, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut"
      }
    })
  };

  const waveformVariants: Variants = {
    animate: (i: number) => ({
      height: ["20%", "100%", "20%"],
      transition: {
        duration: 1,
        repeat: Infinity,
        delay: i * 0.1,
        ease: "easeInOut"
      }
    })
  };

  const renderSpinner = () => {
    switch(variant) {
      case 'pulse':
        return (
          <div className={`${spinnerSizes[size]}`}>
            <motion.div
              className={`bg-${color} rounded-full`}
              variants={pulseVariants}
              animate="animate"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        );
      case 'bounce':
        return (
          <div className={`flex gap-2 ${spinnerSizes[size]}`}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`bg-${color} rounded-full h-4 w-4`}
                custom={i}
                variants={bounceVariants}
                animate="animate"
                aria-hidden="true"
              />
            ))}
          </div>
        );
      case 'waveform':
        return (
          <div className={`flex items-end gap-1 ${spinnerSizes[size]}`} role="progressbar" aria-label="Loading">
            {[...Array(5)].map((_, i: number) => (
              <motion.div
                key={i}
                className={`w-1.5 bg-${color} rounded-full`}
                custom={i}
                variants={waveformVariants}
                animate="animate"
                style={{ minHeight: '20%' }}
                aria-hidden="true"
              />
            ))}
          </div>
        );
      default:
        return (
          <div 
            className={`${spinnerSizes[size]} rounded-full border-4 border-gray-200 ${colorClasses[color].replace('text-', 'border-t-')} animate-spin`}
            role="progressbar" 
            aria-label="Loading"
          />
        );
    }
  };

  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center p-4 dark:bg-gray-900" role="status">
      <div className="text-center">
        {renderSpinner()}
        <AnimatePresence>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 text-default dark:text-gray-200 ${messageSizes[size]}`}
            aria-live="polite"
          >
            {message}
          </motion.p>
        </AnimatePresence>
        
        {timeElapsed > 5 && (
          <AnimatePresence>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-xs sm:text-sm text-muted dark:text-gray-400"
            >
              Loading for {timeElapsed} seconds...
            </motion.p>
          </AnimatePresence>
        )}
        
        {showTimeout && (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-warning-bg dark:bg-warning/20 rounded-md text-sm text-warning"
              role="alert"
            >
              <p className="font-medium">Loading is taking longer than expected</p>
              <p className="mt-1">This might be due to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Network connectivity issues</li>
                <li>Server is temporarily unavailable</li>
                <li>Browser cache or cookie problems</li>
              </ul>
              <p className="mt-3">Try refreshing the page or clearing your browser cache.</p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}