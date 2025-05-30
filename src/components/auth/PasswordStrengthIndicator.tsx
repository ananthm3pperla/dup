import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export default function PasswordStrengthIndicator({ password, className = '' }: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let calculatedStrength = 0;
    
    if (password.length >= 8) calculatedStrength += 1;
    if (/[A-Z]/.test(password)) calculatedStrength += 1;
    if (/[0-9]/.test(password)) calculatedStrength += 1;
    if (/[^A-Za-z0-9]/.test(password)) calculatedStrength += 1;
    
    setStrength(calculatedStrength);
  }, [password]);

  const getStrengthText = () => {
    switch (strength) {
      case 0: return { text: 'Very weak', color: 'rgb(239 68 68)' }; // Red
      case 1: return { text: 'Weak', color: 'rgb(234 179 8)' }; // Yellow
      case 2: return { text: 'Fair', color: 'rgb(234 179 8)' }; // Yellow
      case 3: return { text: 'Good', color: 'rgb(59 130 246)' }; // Blue
      case 4: return { text: 'Strong', color: 'rgb(16 185 129)' }; // Green
      default: return { text: 'Very weak', color: 'rgb(239 68 68)' };
    }
  };

  const strengthInfo = getStrengthText();
  
  const requirements = [
    { text: "At least 8 characters", valid: password.length >= 8 },
    { text: "At least one uppercase letter", valid: /[A-Z]/.test(password) },
    { text: "At least one number", valid: /[0-9]/.test(password) },
    { text: "At least one special character", valid: /[^A-Za-z0-9]/.test(password) }
  ];

  if (!password) return null;

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-600 dark:text-gray-400">Password strength:</p>
        <p className="text-xs font-medium" style={{ color: strengthInfo.color }}>
          {strengthInfo.text}
        </p>
      </div>
      
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          className="h-full rounded-full transition-all"
          style={{ backgroundColor: strengthInfo.color }}
          initial={{ width: 0 }}
          animate={{ width: `${(strength / 4) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <ul className="mt-2 space-y-1">
        {requirements.map((req, index) => (
          <li 
            key={index}
            className={`flex items-center text-xs ${req.valid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {req.valid ? (
              <Check className="h-3 w-3 mr-2 text-green-500" />
            ) : (
              <div className="h-3 w-3 mr-2 rounded-full border border-gray-300 dark:border-gray-600" />
            )}
            {req.text}
          </li>
        ))}
      </ul>
    </div>
  );
}