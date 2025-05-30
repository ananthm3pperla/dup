import React from 'react';
import { motion } from 'framer-motion';
import { X as XIcon } from 'lucide-react';

interface XProps {
  onClick?: () => void;
  className?: string;
}

// A reusable close button component with animations
export default function X({ onClick, className = '' }: XProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${className}`}
      aria-label="Close"
    >
      <XIcon className="h-5 w-5" />
    </motion.button>
  );
}