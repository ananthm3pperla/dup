import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { motion } from 'framer-motion';

// Default security questions
export const DEFAULT_SECURITY_QUESTIONS = [
  { id: 'childhood', question: 'What was the name of your first pet?' },
  { id: 'birthplace', question: 'What city were you born in?' },
  { id: 'school', question: 'What is the name of the first school you attended?' },
  { id: 'favorite', question: 'What was your favorite subject in school?' },
  { id: 'mother', question: 'What is your mother\'s maiden name?' }
];

interface SecurityQuestion {
  id: string;
  question: string;
}

interface SecurityQuestionsFormProps {
  onSubmit: (questions: SecurityQuestion[], answers: Record<string, string>) => Promise<void>;
  availableQuestions?: SecurityQuestion[];
  isSubmitting?: boolean;
  error?: string;
  className?: string;
}

export default function SecurityQuestionsForm({ 
  onSubmit, 
  availableQuestions = DEFAULT_SECURITY_QUESTIONS, 
  isSubmitting = false, 
  error,
  className = ''
}: SecurityQuestionsFormProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<SecurityQuestion[]>(availableQuestions.slice(0, 3));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleQuestionChange = (index: number, questionId: string) => {
    const question = availableQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    const newQuestions = [...selectedQuestions];
    newQuestions[index] = question;
    setSelectedQuestions(newQuestions);
    
    // Clear answer for this question
    const newAnswers = { ...answers };
    delete newAnswers[questionId];
    setAnswers(newAnswers);
    
    // Clear error for this question
    const newErrors = { ...errors };
    delete newErrors[questionId];
    setErrors(newErrors);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    selectedQuestions.forEach(question => {
      if (!answers[question.id] || answers[question.id].trim() === '') {
        newErrors[question.id] = 'Answer is required';
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    await onSubmit(selectedQuestions, answers);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {selectedQuestions.map((question, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Security Question {index + 1}
              </label>
              <select
                value={question.id}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {availableQuestions.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.question}
                  </option>
                ))}
              </select>
            </div>
            
            <Input
              label="Your Answer"
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              error={errors[question.id]}
              placeholder="Your answer"
              required
            />
          </motion.div>
        ))}
      </motion.div>
      
      <div className="pt-4">
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="w-full"
        >
          Save Security Questions
        </Button>
      </div>
    </form>
  );
}