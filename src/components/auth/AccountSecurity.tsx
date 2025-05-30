import React, { useState } from 'react';
import { Shield, Key, AlertTriangle } from 'lucide-react';
import { Card, Button, Alert } from '@/components/ui';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TwoFactorAuth, SecurityQuestionsForm } from '@/components/auth';
import { DEFAULT_SECURITY_QUESTIONS } from './SecurityQuestionsForm';
import { toast } from 'sonner';

interface AccountSecurityProps {
  userId: string;
  hasTwoFactor?: boolean;
  hasSecurityQuestions?: boolean;
  onComplete?: () => void;
}

export default function AccountSecurity({ 
  userId, 
  hasTwoFactor = false, 
  hasSecurityQuestions = false,
  onComplete 
}: AccountSecurityProps) {
  const navigate = useNavigate();
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showSecurityQuestions, setShowSecurityQuestions] = useState(false);
  const [twoFactorComplete, setTwoFactorComplete] = useState(hasTwoFactor);
  const [questionsComplete, setQuestionsComplete] = useState(hasSecurityQuestions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSetupTwoFactor = () => {
    setShowTwoFactorSetup(true);
  };
  
  const handleSetupSecurityQuestions = () => {
    setShowSecurityQuestions(true);
  };
  
  const handleVerifyTwoFactor = async (code: string): Promise<boolean> => {
    // In a real app, this would verify with your auth provider
    // For demo purposes, we'll just check if the code is '123456'
    if (code === '123456') {
      setTwoFactorComplete(true);
      toast.success('Two-factor authentication enabled successfully');
      return true;
    }
    return false;
  };
  
  const handleSaveSecurityQuestions = async (questions: any[], answers: Record<string, string>) => {
    // In a real app, this would save the security questions
    await new Promise(resolve => setTimeout(resolve, 1000));
    setQuestionsComplete(true);
    toast.success('Security questions saved successfully');
    setShowSecurityQuestions(false);
  };
  
  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate('/dashboard');
    }
  };
  
  const isComplete = twoFactorComplete && questionsComplete;

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">Secure Your Account</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Set up additional security measures to protect your account
        </p>
      </div>
      
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`p-4 border ${twoFactorComplete ? 'border-success' : 'border-warning'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${twoFactorComplete ? 'bg-success/10' : 'bg-warning/10'}`}>
                  <Key className={`h-5 w-5 ${twoFactorComplete ? 'text-success' : 'text-warning'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {twoFactorComplete 
                      ? 'Your account is protected with 2FA' 
                      : 'Add an extra layer of security'}
                  </p>
                </div>
              </div>
              
              <Button
                size="sm"
                variant={twoFactorComplete ? "outline" : "primary"}
                onClick={handleSetupTwoFactor}
              >
                {twoFactorComplete ? 'Manage' : 'Setup'}
              </Button>
            </div>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className={`p-4 border ${questionsComplete ? 'border-success' : 'border-warning'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${questionsComplete ? 'bg-success/10' : 'bg-warning/10'}`}>
                  <AlertTriangle className={`h-5 w-5 ${questionsComplete ? 'text-success' : 'text-warning'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Security Questions
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {questionsComplete 
                      ? 'Recovery questions configured' 
                      : 'Set up account recovery options'}
                  </p>
                </div>
              </div>
              
              <Button
                size="sm"
                variant={questionsComplete ? "outline" : "primary"}
                onClick={handleSetupSecurityQuestions}
              >
                {questionsComplete ? 'Update' : 'Setup'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          disabled={isSubmitting}
        >
          Skip for now
        </Button>
        
        <Button
          size="sm"
          disabled={!isComplete}
          onClick={() => onComplete?.()}
        >
          Continue
        </Button>
      </div>
      
      {/* Dialogs */}
      <TwoFactorAuth
        isOpen={showTwoFactorSetup}
        onClose={() => setShowTwoFactorSetup(false)}
        onVerify={handleVerifyTwoFactor}
        method="app"
      />
      
      {showSecurityQuestions && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Security Questions
                </h3>
                <button
                  onClick={() => setShowSecurityQuestions(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <Alert variant="info">
                  <p>Security questions help you recover your account if you forget your password or lose access to your 2FA method.</p>
                </Alert>
              </div>
              
              <SecurityQuestionsForm
                onSubmit={handleSaveSecurityQuestions}
                availableQuestions={DEFAULT_SECURITY_QUESTIONS}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}