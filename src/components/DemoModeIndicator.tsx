import React from 'react';
import { Beaker } from 'lucide-react';
import { motion } from 'framer-motion';

interface DemoModeIndicatorProps {
  className?: string;
  onClick?: () => void;
}

export default function DemoModeIndicator({ className = '', onClick }: DemoModeIndicatorProps) {
  // This component is now empty as we're removing the demo mode indicator
  return null;
}