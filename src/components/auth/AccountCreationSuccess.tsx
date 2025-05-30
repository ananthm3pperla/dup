import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { Link, useNavigate } from 'react-router-dom';
import confetti from '@/lib/utils/confetti';

interface AccountCreationSuccessProps {
  email?: string;
  needsVerification?: boolean;
  onContinue?: () => void;
}

export default function AccountCreationSuccess({ 
  email, 
  needsVerification = true,
  onContinue 
}: AccountCreationSuccessProps) {
  const navigate = useNavigate();
  
  // Trigger confetti effect on mount
  React.useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);
  
  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else if (needsVerification) {
      navigate('/verify-email');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-md p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.2
          }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-6"
        >
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Account Created Successfully!
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {needsVerification ? (
            <div className="mb-8">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We've sent a verification link to{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {email}
                </span>
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      Please check your email
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Click on the verification link in your email to activate your account. It may take a few minutes to arrive.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Your account has been created successfully. You're now ready to start using Hi-Bridge.
            </p>
          )}
          
          <div className="space-y-3">
            <Button 
              className="w-full"
              onClick={handleContinue}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {needsVerification ? "Check My Email" : "Continue to Dashboard"}
            </Button>
            
            {needsVerification && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/dashboard')}
              >
                Continue without Verifying
              </Button>
            )}
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/help/verification" className="text-primary hover:text-primary-dark">
                Need help? Visit our support center
              </Link>
            </div>
          </div>
        </motion.div>
      </Card>
    </div>
  );
}