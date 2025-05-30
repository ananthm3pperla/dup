import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccountCreationProgress, SignupForm, SecurityQuestionsForm, AccountSecurity } from '@/components/auth';
import { Button, Card } from '@/components/ui';
import { Building2 } from 'lucide-react';

interface SignupFlowProps {
  onComplete: (userData: {
    name: string;
    email: string;
    password: string;
    securityQuestions?: Array<{ id: string, question: string, answer: string }>;
  }) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
  showSecuritySteps?: boolean;
}

export default function SignupFlow({ 
  onComplete, 
  isSubmitting, 
  error,
  showSecuritySteps = true 
}: SignupFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    securityQuestions: [] as Array<{ id: string, question: string, answer: string }>,
  });

  // Define steps including the security step if enabled
  const steps = [
    { 
      id: 'account', 
      name: 'Create Account', 
      description: 'Basic account information', 
      completed: currentStep > 1, 
      current: currentStep === 1 
    },
    ...(showSecuritySteps ? [
      { 
        id: 'security', 
        name: 'Security', 
        description: 'Set up account recovery', 
        completed: currentStep > 2, 
        current: currentStep === 2 
      }
    ] : []),
    { 
      id: 'complete', 
      name: 'Complete', 
      description: 'Finish setup', 
      completed: false, 
      current: currentStep === (showSecuritySteps ? 3 : 2)
    }
  ];

  const handleAccountSubmit = (name: string, email: string, password: string) => {
    setUserData(prev => ({
      ...prev,
      name,
      email,
      password
    }));
    
    setCurrentStep(showSecuritySteps ? 2 : 3);
  };

  const handleSecurityQuestionsSubmit = async (questions: any[], answers: Record<string, string>) => {
    const securityQuestions = Object.keys(answers).map(questionId => {
      const question = questions.find(q => q.id === questionId);
      return {
        id: questionId,
        question: question?.question || '',
        answer: answers[questionId]
      };
    });
    
    setUserData(prev => ({
      ...prev,
      securityQuestions
    }));
    
    setCurrentStep(3);
  };

  const handleFinalSubmit = async () => {
    await onComplete(userData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SignupForm 
            onSubmit={handleAccountSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
        );
      case 2:
        return showSecuritySteps ? (
          <SecurityQuestionsForm
            onSubmit={handleSecurityQuestionsSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
        ) : (
          <div className="text-center py-8">
            <h3 className="text-xl font-medium text-default mb-4">Your Account is Ready!</h3>
            <p className="text-sm text-muted mb-6">
              You've successfully created your Hi-Bridge account. Click the button below to complete the setup.
            </p>
            <Button
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="w-full"
            >
              Complete Setup
            </Button>
          </div>
        );
      case 3:
        return (
          <div className="text-center py-8">
            <h3 className="text-xl font-medium text-default mb-4">Your Account is Ready!</h3>
            <p className="text-sm text-muted mb-6">
              You've successfully created your Hi-Bridge account. Click the button below to complete the setup.
            </p>
            <Button
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="w-full"
            >
              Complete Setup
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Building2 className="h-12 w-12 text-primary" />
          </motion.div>
        </div>
        <motion.h2 
          className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Create your account
        </motion.h2>
        <motion.p 
          className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Join Hi-Bridge to manage your team's hybrid work schedule
        </motion.p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <AccountCreationProgress steps={steps} className="mb-6" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}