import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { isTwoFactorEnabled, getUserSecurityPreferences, detectSecurityRisks } from '@/lib/auth/securityUtils';

interface SecurityMonitorProps {
  className?: string;
  onAction?: (action: 'enable2fa' | 'verifyEmail' | 'setupRecovery') => void;
}

export default function SecurityMonitor({ className = '', onAction }: SecurityMonitorProps) {
  const { user } = useAuth();
  const [securityScore, setSecurityScore] = useState(0);
  const [securityChecks, setSecurityChecks] = useState({
    emailVerified: false,
    twoFactorEnabled: false,
    strongPassword: true,
    recoveryMethodSet: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSecurityStatus = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get security information
        const has2fa = await isTwoFactorEnabled(user.id);
        const preferences = await getUserSecurityPreferences(user.id);
        const risks = detectSecurityRisks(user);
        
        // Update security checks
        setSecurityChecks({
          emailVerified: !!user.email_confirmed_at,
          twoFactorEnabled: has2fa,
          strongPassword: !risks.includes('Weak password'),
          recoveryMethodSet: preferences.hasSecurityQuestions || preferences.hasRecoveryEmail
        });
        
        // Calculate security score (0-100)
        let score = 0;
        if (user.email_confirmed_at) score += 25;
        if (has2fa) score += 35;
        if (!risks.includes('Weak password')) score += 20;
        if (preferences.hasSecurityQuestions || preferences.hasRecoveryEmail) score += 20;
        
        setSecurityScore(score);
      } catch (error) {
        console.error('Error loading security status:', error);
        toast.error('Failed to load security information');
      } finally {
        setLoading(false);
      }
    };
    
    loadSecurityStatus();
  }, [user]);

  const handleAction = (action: 'enable2fa' | 'verifyEmail' | 'setupRecovery') => {
    if (onAction) {
      onAction(action);
    } else {
      switch (action) {
        case 'enable2fa':
          toast.info('Navigate to Security Settings to enable two-factor authentication');
          break;
        case 'verifyEmail':
          toast.info('Check your email for a verification link');
          break;
        case 'setupRecovery':
          toast.info('Navigate to Security Settings to set up account recovery options');
          break;
      }
    }
  };

  const getScoreColor = () => {
    if (securityScore >= 80) return 'text-success';
    if (securityScore >= 50) return 'text-warning';
    return 'text-error';
  };

  if (loading) {
    return (
      <Card className={`p-4 animate-pulse ${className}`}>
        <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Account Security
          </h3>
        </div>
        
        <div className={`text-sm font-medium ${getScoreColor()}`}>
          {securityScore}/100
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full rounded-full ${
              securityScore >= 80 ? 'bg-success' : 
              securityScore >= 50 ? 'bg-warning' : 
              'bg-error'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${securityScore}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
        
        <ul className="space-y-2">
          {Object.entries(securityChecks).map(([key, value]) => {
            let label = '';
            let action = null;
            
            switch (key) {
              case 'emailVerified':
                label = 'Email verification';
                if (!value) action = 'verifyEmail';
                break;
              case 'twoFactorEnabled':
                label = 'Two-factor authentication';
                if (!value) action = 'enable2fa';
                break;
              case 'strongPassword':
                label = 'Strong password';
                break;
              case 'recoveryMethodSet':
                label = 'Recovery options';
                if (!value) action = 'setupRecovery';
                break;
            }
            
            return (
              <li key={key} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {value ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-warning" />
                  )}
                  <span className="text-gray-700 dark:text-gray-300">{label}</span>
                </div>
                
                {!value && action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary text-xs hover:bg-primary/5"
                    onClick={() => handleAction(action as any)}
                  >
                    Setup
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="text-xs text-muted">
        Secure your account by completing all security recommendations
      </div>
    </Card>
  );
}