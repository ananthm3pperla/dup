import React, { useState } from 'react';
import { Shield, Mail, AlertTriangle } from 'lucide-react';
import { Button, Card, Alert } from '@/components/ui';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AccountVerificationPromptProps {
  onVerify: () => void;
  onSkip?: () => void;
}

export default function AccountVerificationPrompt({ onVerify, onSkip }: AccountVerificationPromptProps) {
  const { user, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleResendEmail = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    setError(null);
    
    try {
      await resendVerificationEmail(user.email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (err) {
      console.error('Error resending verification email:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };
  
  const handleVerifyNow = () => {
    navigate('/verify-email');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 border-l-4 border-l-warning">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-warning/10 rounded-full">
            <Shield className="h-6 w-6 text-warning" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Verify Your Account
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Your email address hasn't been verified yet. Please check your inbox for a verification link or request a new one.
            </p>
            
            {error && (
              <Alert 
                variant="error" 
                title="Error"
                className="mb-4"
                icon={<AlertTriangle className="h-5 w-5" />}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleVerifyNow}
                leftIcon={<Mail className="h-4 w-4" />}
              >
                Verify Now
              </Button>
              
              <Button
                variant="outline"
                onClick={handleResendEmail}
                isLoading={isResending}
                disabled={isResending}
              >
                Resend Email
              </Button>
              
              {onSkip && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Skip for now
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}