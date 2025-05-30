import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Reward } from './RewardCard';

interface RedemptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward | null;
  onConfirm: (rewardId: string) => Promise<void>;
}

export default function RedemptionDialog({ isOpen, onClose, reward, onConfirm }: RedemptionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirm = async () => {
    if (!reward) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onConfirm(reward.id);
      setIsSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error redeeming reward:', err);
      setError(err instanceof Error ? err.message : 'Failed to redeem reward');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && reward && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 mx-4"
          >
            {isSuccess ? (
              <div className="text-center py-6">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Reward Redeemed!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  Your reward has been successfully redeemed. Check your email for details.
                </p>
                <Button onClick={onClose} size="sm">
                  Close
                </Button>
              </div>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                      Redeem Reward
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Confirm your reward redemption
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-error/10 text-error rounded-lg text-xs sm:text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Reward</span>
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white font-semibold">{reward.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Cost</span>
                    <span className="text-xs sm:text-sm text-primary font-semibold">{reward.pointsCost} points</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
                  Are you sure you want to redeem this reward? This action cannot be undone.
                </p>

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
                    onClick={handleConfirm}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    size="sm"
                  >
                    Confirm Redemption
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}