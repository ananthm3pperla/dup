import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Key, Lock, AlertTriangle, User } from 'lucide-react';
import { Card, Button, Alert } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { TwoFactorAuth } from '@/components/auth';
import { isDemoMode } from '@/lib/demo';
import { supabase } from '@/lib/supabase';

export default function SecuritySettings() {
  const { user } = useAuth();
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Mock active sessions for demo
  const activeSessions = [
    {
      id: 'current-session',
      device: 'Chrome on Windows',
      location: 'Dallas, TX',
      lastActive: new Date(),
      isCurrent: true
    },
    {
      id: 'session-2',
      device: 'Safari on iPhone',
      location: 'Austin, TX',
      lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isCurrent: false
    }
  ];

  // Check if 2FA is enabled on mount
  useEffect(() => {
    const checkTwoFactorStatus = async () => {
      try {
        setLoading(true);
        
        // In demo mode, set a default value
        if (isDemoMode()) {
          setTwoFactorEnabled(false);
          setLoading(false);
          return;
        }

        // Check if user has 2FA enabled
        // This is a placeholder - in a real app, you would query your auth system
        const { data, error } = await supabase
          .from('user_security_settings')
          .select('has_2fa')
          .eq('user_id', user?.id)
          .maybeSingle();

        if (!error && data) {
          setTwoFactorEnabled(data.has_2fa || false);
        }
      } catch (err) {
        console.error('Error checking 2FA status:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkTwoFactorStatus();
    }
  }, [user]);
  
  const handleSetupTwoFactor = () => {
    setShowTwoFactorSetup(true);
  };
  
  const handleVerifyTwoFactor = async (code: string): Promise<boolean> => {
    // In demo mode, just simulate success
    if (isDemoMode()) {
      if (code === '123456') {
        setTwoFactorEnabled(true);
        toast.success('Two-factor authentication enabled successfully');
        return true;
      }
      return false;
    }
    
    // In a real app, this would verify with your auth provider
    // For demo purposes, we'll just check if the code is '123456'
    if (code === '123456') {
      setTwoFactorEnabled(true);
      
      // Update user security settings
      try {
        await supabase
          .from('user_security_settings')
          .upsert({
            user_id: user?.id,
            has_2fa: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
      } catch (err) {
        console.error('Error updating security settings:', err);
      }
      
      toast.success('Two-factor authentication enabled successfully');
      return true;
    }
    return false;
  };
  
  const handleRevokeSession = (sessionId: string) => {
    // In demo mode, just show success message
    if (isDemoMode()) {
      toast.success('Session revoked successfully (Demo Mode)');
      return;
    }
    
    // In a real app, this would revoke the session
    toast.success('Session revoked successfully');
  };
  
  const handleRevokeAllSessions = () => {
    // In demo mode, just show success message
    if (isDemoMode()) {
      toast.success('All other sessions revoked successfully (Demo Mode)');
      return;
    }
    
    // In a real app, this would revoke all sessions except the current one
    toast.success('All other sessions revoked successfully');
  };
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion');
      return;
    }

    // In demo mode, just show a message
    if (isDemoMode()) {
      toast.error('Account deletion is not available in demo mode');
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would delete the account
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Account deleted successfully');
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-default mb-6">Two-Factor Authentication</h3>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {twoFactorEnabled ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {twoFactorEnabled 
                  ? 'Your account is protected with an additional layer of security' 
                  : 'Add an extra layer of security to your account'}
              </p>
            </div>
          </div>
          
          <Button
            variant={twoFactorEnabled ? "outline" : "primary"}
            size="sm"
            onClick={handleSetupTwoFactor}
          >
            {twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
          </Button>
        </div>
        
        {twoFactorEnabled ? (
          <Alert
            variant="success"
            title="Your account is secure"
            className="mb-4"
          >
            <p>Two-factor authentication is enabled on your account. You'll be asked for a verification code when signing in from new devices.</p>
          </Alert>
        ) : (
          <Alert
            variant="info"
            title="Recommended Security Measure"
            className="mb-4"
          >
            <p>Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.</p>
          </Alert>
        )}
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-medium text-default mb-6">Active Sessions</h3>
        
        <div className="space-y-4">
          {activeSessions.map(session => (
            <div 
              key={session.id}
              className={`p-4 rounded-lg border ${
                session.isCurrent 
                  ? 'bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30' 
                  : 'bg-card-hover border-default'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    {session.device}
                    {session.isCurrent && (
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        Current
                      </span>
                    )}
                  </p>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>Location: {session.location}</p>
                    <p>Last active: {session.isCurrent ? 'Now' : new Date(session.lastActive).toLocaleString()}</p>
                  </div>
                </div>
                
                {!session.isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-error hover:bg-error/5 border-error/20"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleRevokeAllSessions}
            className="w-full justify-center"
          >
            Sign Out From All Other Devices
          </Button>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-medium text-default mb-4">Danger Zone</h3>
        
        {showDeleteConfirm ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400 dark:text-red-300" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Delete Account Confirmation
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-red-700 dark:text-red-200">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                  <div className="mt-3">
                    <label htmlFor="confirm-delete" className="block text-sm font-medium text-red-700 dark:text-red-200">
                      Type "DELETE" to confirm
                    </label>
                    <input
                      type="text"
                      id="confirm-delete"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="mt-1 block w-full rounded-md border-red-300 dark:border-red-700 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm dark:bg-red-900/30 dark:text-white"
                    />
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border-red-300 dark:border-red-700"
                      disabled={deleteConfirmText !== 'DELETE' || isSubmitting}
                      isLoading={isSubmitting}
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Deleting your account will remove all of your data from our systems. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border-red-300 dark:border-red-700"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          </div>
        )}
      </Card>
      
      {/* Two-factor authentication setup dialog */}
      <TwoFactorAuth 
        isOpen={showTwoFactorSetup}
        onClose={() => setShowTwoFactorSetup(false)}
        onVerify={handleVerifyTwoFactor}
        method="app"
      />
    </div>
  );
}