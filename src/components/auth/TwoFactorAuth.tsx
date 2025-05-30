import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, X, Check, AlertTriangle } from 'lucide-react';
import { Button, Alert } from '@/components/ui';

interface TwoFactorAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<boolean>;
  method?: 'email' | 'sms' | 'app';
  destination?: string;
}

export default function TwoFactorAuth({
  isOpen,
  onClose,
  onVerify,
  method = 'email',
  destination
}: TwoFactorAuthProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [success, setSuccess] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Focus first input on mount
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Countdown timer
  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, isOpen]);
  
  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCode(['', '', '', '', '', '']);
      setError(null);
      setCountdown(30);
      setSuccess(false);
    }
  }, [isOpen]);
  
  // Handle input change
  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    // Update code
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Clear error
    if (error) setError(null);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle key down
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // If current input is empty, focus previous input
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Only allow numbers
    if (!/^\d+$/.test(pastedData)) return;
    
    // Fill inputs with pasted data
    const digits = pastedData.split('').slice(0, 6);
    const newCode = [...code];
    
    digits.forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
      }
    });
    
    setCode(newCode);
    
    // Focus last filled input or last input
    const lastIndex = Math.min(digits.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();
  };
  
  // Handle submit
  const handleSubmit = async () => {
    // Check if code is complete
    if (code.some(digit => !digit)) {
      setError('Please enter all digits');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const fullCode = code.join('');
      const isValid = await onVerify(fullCode);
      
      if (isValid) {
        setSuccess(true);
        // Close after a delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle resend
  const handleResend = () => {
    // In a real app, this would call an API to resend the code
    toast.success(`Verification code resent to your ${method}`);
    setCountdown(30);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 mx-4"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          disabled={isSubmitting}
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-medium text-gray-900 dark:text-gray-100">
              Two-Factor Verification
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {method === 'email' && `Enter the 6-digit code sent to ${destination || 'your email'}`}
              {method === 'sms' && `Enter the 6-digit code sent to ${destination || 'your phone'}`}
              {method === 'app' && 'Enter the 6-digit code from your authenticator app'}
            </p>
          </div>
        </div>
        
        {/* Success state */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-6"
          >
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Verification Successful</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You have been successfully verified.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Error message */}
            {error && (
              <Alert 
                variant="error" 
                title="Verification Failed"
                className="mb-4"
                icon={<AlertTriangle className="h-5 w-5" />}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            
            {/* Code input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Verification Code
              </label>
              <div className="flex justify-between gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white"
                    disabled={isSubmitting}
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Didn't receive a code? 
                <button 
                  className={`ml-1 text-primary hover:text-primary-dark dark:hover:text-primary-light ${countdown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleResend}
                  disabled={countdown > 0}
                  type="button"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                </button>
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={isSubmitting || code.some(digit => !digit)}
                size="sm"
              >
                Verify
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}