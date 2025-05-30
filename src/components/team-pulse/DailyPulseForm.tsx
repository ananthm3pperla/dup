import React, { useState } from 'react';
import { Frown, Meh, Smile, MessageSquare, Send } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { usePulseStore, type Mood } from '@/lib/store/pulseStore';

interface DailyPulseFormProps {
  className?: string;
  onComplete?: () => void;
}

interface MoodOption {
  value: Mood;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export default function DailyPulseForm({ className = '', onComplete }: DailyPulseFormProps) {
  const { addPulse, getLatestPulse } = usePulseStore();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const latestPulse = getLatestPulse();
  
  const moodOptions: MoodOption[] = [
    {
      value: 'challenging',
      label: 'Challenging',
      description: 'Feeling overwhelmed or stressed',
      icon: Frown,
      color: '#EF4444',
      bgColor: '#FEE2E2'
    },
    {
      value: 'neutral',
      label: 'Neutral',
      description: 'Getting through the day',
      icon: Meh,
      color: '#F59E0B',
      bgColor: '#FEF3C7'
    },
    {
      value: 'good',
      label: 'Good',
      description: 'Feeling positive and productive',
      icon: Smile,
      color: '#10B981',
      bgColor: '#D1FAE5'
    }
  ];
  
  const handleSubmit = () => {
    if (!selectedMood) return;
    
    setIsSubmitting(true);
    
    try {
      const pulseData = {
        mood: selectedMood,
        timestamp: new Date().toISOString(),
        notes: notes.trim() || undefined
      };
      
      addPulse(pulseData);
      toast.success('Your daily pulse has been recorded');
      
      if (onComplete) {
        onComplete();
      }
      
      // Reset form
      setSelectedMood(null);
      setNotes('');
    } catch (error) {
      console.error('Error submitting pulse:', error);
      toast.error('Failed to record your pulse');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If already submitted today, show the current selection
  if (latestPulse && new Date(latestPulse.timestamp).toDateString() === new Date().toDateString()) {
    const option = moodOptions.find(o => o.value === latestPulse.mood);
    
    if (option) {
      const Icon = option.icon;
      
      return (
        <Card className={`p-6 ${className}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center dark:bg-primary/20">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">My Daily Pulse</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last updated at {new Date(latestPulse.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-lg border transition-all duration-200 flex items-center gap-4"
            style={{ 
              borderColor: option.color,
              backgroundColor: option.bgColor,
              boxShadow: `0 0 0 2px ${option.color}20`
            }}
          >
            <div 
              className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ 
                backgroundColor: option.bgColor,
                color: option.color
              }} 
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-gray-800">{option.label}</h4>
              <p className="text-sm text-gray-700 dark:text-gray-600">{option.description}</p>
              
              {latestPulse.notes && (
                <p className="mt-2 text-sm italic text-gray-600 dark:text-gray-700">
                  "{latestPulse.notes}"
                </p>
              )}
            </div>
          </motion.div>
        </Card>
      );
    }
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center dark:bg-primary/20">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">My Daily Pulse</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">How are you feeling today?</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {moodOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedMood === option.value;
            
            return (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMood(option.value)}
                className={`
                  p-4 rounded-lg border text-left transition-all duration-200
                  ${isSelected
                    ? `border-2 border-${option.value === 'challenging' ? 'error' : option.value === 'neutral' ? 'warning' : 'success'}`
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ 
                      backgroundColor: option.bgColor,
                      color: option.color
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
        
        <AnimatePresence>
          {selectedMood && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional notes (optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Share any additional context about how you're feeling..."
                ></textarea>
                
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    disabled={!selectedMood || isSubmitting}
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!selectedMood && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
            Select how you're feeling today to help your team understand your work experience.
          </p>
        )}
      </div>
    </Card>
  );
}