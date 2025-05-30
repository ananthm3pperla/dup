import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { toast } from 'sonner';
import TextareaAutosize from 'react-textarea-autosize';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (feedback: string) => Promise<void>;
  title?: string;
  description?: string;
  placeholder?: string;
}

export default function FeedbackDialog({ 
  isOpen, 
  onClose, 
  onSubmit,
  title = "Share Feedback with Your Manager",
  description = "Your feedback helps improve team collaboration and work arrangements.",
  placeholder = "Share your thoughts on team collaboration, work arrangements, or any concerns you'd like to discuss..."
}: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<string>('general');
  const [rating, setRating] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(feedback);
      } else {
        // Simulated API call if no onSubmit provided
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast.success('Thank you for your feedback!');
      setFeedback('');
      setFeedbackCategory('general');
      setRating(null);
      onClose();
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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

  const renderStarRating = () => (
    <div className="space-y-2">
      <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Rating</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl ${
              (rating && star <= rating) 
                ? 'text-yellow-400' 
                : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
            } transition-colors`}
          >
            ★
          </button>
        ))}
        {rating && (
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {rating === 1 ? 'Poor' : 
             rating === 2 ? 'Fair' : 
             rating === 3 ? 'Good' : 
             rating === 4 ? 'Very Good' : 
             'Excellent'}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center"
          onClick={handleBackdropClick}
        >
          <div className="px-4 text-center w-full max-w-3xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="relative w-full max-w-3xl p-4 sm:p-8 mx-auto text-left bg-white dark:bg-gray-800 rounded-xl shadow-xl transform transition-all border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <motion.div 
                    initial={{ rotate: -30, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    className="p-2 sm:p-3 bg-primary/10 dark:bg-primary/20 rounded-lg"
                  >
                    <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-base sm:text-xl font-medium text-gray-900 dark:text-gray-100">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-8">
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Feedback Category
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {['general', 'ui/ux', 'feature', 'bug'].map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setFeedbackCategory(category)}
                        className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                          feedbackCategory === category
                            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light border-primary/20'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {renderStarRating()}

                <div>
                  <TextareaAutosize
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={placeholder}
                    className="block w-full min-h-[120px] sm:min-h-[150px] rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 p-3 sm:p-4 transition-colors"
                    minRows={3}
                    maxRows={8}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 gap-4">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Your response will be anonymous
                  </p>
                  <div className="flex gap-3 ml-auto">
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
                      disabled={!feedback.trim() || isSubmitting}
                      className="text-white"
                      size="sm"
                    >
                      Submit Feedback
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}