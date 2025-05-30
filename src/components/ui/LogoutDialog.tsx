import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
  isDemo?: boolean;
}

export default function LogoutDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false,
  isDemo = false
}: LogoutDialogProps) {
  const navigate = useNavigate();
  
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleConfirm = async () => {
    await onConfirm();
    // After signing out, navigate to landing page
    navigate('/');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        {/* Background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black"
          onClick={onClose}
        />

        {/* This element centers the modal contents. */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-card dark:bg-gray-800 rounded-lg shadow-xl transform transition-all border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-error-bg dark:bg-error/20 flex items-center justify-center">
              <LogOut className="h-6 w-6 text-error dark:text-error-light" />
            </div>
            <div>
              <h3 className="text-lg font-medium leading-6 text-default">
                Sign out
              </h3>
              <p className="mt-2 text-sm text-muted">
                {isDemo 
                  ? "Are you sure you want to exit demo mode? You'll return to the landing page."
                  : "Are you sure you want to sign out? You'll need to sign in again to access your account."}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              isLoading={isLoading}
              className="text-white"
              leftIcon={<LogOut className="h-4 w-4" />}
              size="sm"
            >
              {isDemo ? "Exit Demo" : "Sign out"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}