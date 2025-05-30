import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import FeedbackDialog from './FeedbackDialog';
import { toast } from 'sonner';

interface FeedbackButtonProps {
  className?: string;
  onSubmit?: (score: number, text: string) => Promise<void>;
  buttonText?: string;
  title?: string;
  description?: string;
  placement?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left' | 'inline';
  variant?: 'primary' | 'outline' | 'floating';
  children?: React.ReactNode;
}

export default function FeedbackButton({ 
  className, 
  onSubmit, 
  buttonText = "Share Feedback",
  title,
  description,
  placement = 'inline',
  variant = 'primary',
  children
}: FeedbackButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async (feedback: string) => {
    try {
      if (onSubmit) {
        await onSubmit(0, feedback);
      }
      toast.success('Thank you for your feedback!');
      return Promise.resolve();
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
      throw error;
    }
  };

  // For floating button styles
  const getFloatingStyles = () => {
    switch (placement) {
      case 'top-right':
        return 'fixed top-4 right-4 z-50';
      case 'bottom-right':
        return 'fixed bottom-16 lg:bottom-4 right-4 z-50';
      case 'bottom-left':
        return 'fixed bottom-16 lg:bottom-4 left-4 z-50';
      case 'top-left':
        return 'fixed top-4 left-4 z-50';
      default:
        return '';
    }
  };

  const getButtonStyles = () => {
    if (variant === 'floating') {
      return `${getFloatingStyles()} rounded-full shadow-lg hover:shadow-xl p-3 text-white bg-primary hover:bg-primary-dark transition-all duration-200`;
    }
    
    if (variant === 'outline') {
      return `inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-primary text-primary hover:bg-primary/10 transition-colors ${className || ''}`;
    }
    
    return `inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${className || 'text-white bg-primary hover:bg-primary-dark'}`;
  };

  return (
    <>
      {variant === 'floating' ? (
        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className={getButtonStyles()}
          aria-label="Open feedback form"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className={getButtonStyles()}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {buttonText}
        </button>
      )}

      <FeedbackDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSubmit={handleSubmit}
        title={title}
        description={description}
      />
    </>
  );
}