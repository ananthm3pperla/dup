import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { Theme } from '@/lib/utils/themeUtils';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function ThemeToggle({ size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const sizes = {
    sm: 'h-8 w-8 p-1.5',
    md: 'h-10 w-10 p-2',
    lg: 'h-12 w-12 p-2.5'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const modes: Theme[] = ['light', 'dark', 'system'];
  const currentIndex = modes.indexOf(theme);

  const cycleTheme = () => {
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex]);
  };

  // Get the appropriate icon based on theme
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <motion.button
      onClick={cycleTheme}
      className={`${sizes[size]} rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      aria-label={`Toggle theme, current theme is ${theme}`}
      aria-pressed={theme === 'dark' ? 'true' : 'false'} // Indicate pressed state for screen readers
    >
      <motion.div
        key={theme}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className={`${iconSizes[size]} text-gray-700 dark:text-gray-200`} aria-hidden="true" />
      </motion.div>
    </motion.button>
  );
}